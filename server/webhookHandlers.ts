/**
 * Webhook Handlers for all payment gateways
 * Expert Plan - خطة الخبراء
 * Handles: HyperPay, SEPA, Payomentic, 2Checkout, PayPal, Alipay, WeChat Pay, Telr, Amex
 */

import { getOrderById, updateOrderStatus, createPayment, getTicketsByOrderId } from "./db";
import { notifyOwner } from "./_core/notification";
import { generateOrderInvoice } from "./invoiceService";

// ===== HELPER: Process successful payment =====
async function processSuccessfulPayment(
  orderId: number,
  gatewayTransactionId: string,
  amount: string,
  currency: string,
  gatewayName: string,
  rawResponse: string
) {
  const order = await getOrderById(orderId);
  if (!order) {
    console.error(`[Webhook] Order ${orderId} not found`);
    return;
  }

  if (order.status === "paid") {
    console.log(`[Webhook] Order ${orderId} already paid, skipping`);
    return;
  }

  // Update order to paid
  await updateOrderStatus(orderId, "paid");

  // Record payment
  await createPayment({
    orderId,
    gatewayTransactionId,
    amount,
    currency,
    gateway: gatewayName,
    status: "confirmed",
    gatewayResponse: rawResponse,
  });

  // Generate invoice asynchronously
  generateOrderInvoice(orderId).catch((err) => console.error("[Invoice] Auto-gen failed:", err));

  // Notify owner
  await notifyOwner({
    title: `✅ دفع مؤكد - ${order.orderNumber}`,
    content: `تم تأكيد الدفع للطلب ${order.orderNumber} بمبلغ ${order.totalAmount} ${order.currency} عبر ${gatewayName}`,
  }).catch(() => {});

  console.log(`[Webhook] Order ${orderId} marked as paid via ${gatewayName}`);
}

// ===== HELPER: Process failed payment =====
async function processFailedPayment(orderId: number, reason: string, gatewayName: string) {
  const order = await getOrderById(orderId);
  if (!order || order.status === "paid") return;

  await updateOrderStatus(orderId, "failed");
  console.log(`[Webhook] Order ${orderId} failed via ${gatewayName}: ${reason}`);
}

// ===== HyperPay Webhook =====
export async function handleHyperPayWebhook(body: any) {
  console.log("[HyperPay Webhook]", JSON.stringify(body));
  const { id, result, merchantTransactionId, amount, currency } = body;

  // HyperPay success codes: 000.000.000, 000.100.110, 000.100.111, 000.100.112
  const successPattern = /^(000\.000\.|000\.100\.1|000\.[36])/;
  const isSuccess = result?.code && successPattern.test(result.code);

  if (!merchantTransactionId) return;
  const orderId = parseInt(merchantTransactionId.split("-")[0]);
  if (isNaN(orderId)) return;

  if (isSuccess) {
    await processSuccessfulPayment(orderId, id, amount, currency, "HyperPay", JSON.stringify(body));
  } else {
    await processFailedPayment(orderId, result?.description || "Unknown", "HyperPay");
  }
}

// ===== SEPA Webhook (48-hour hold) =====
export async function handleSepaWebhook(body: any) {
  console.log("[SEPA Webhook]", JSON.stringify(body));
  const { event, data } = body;
  const orderId = parseInt(data?.metadata?.orderId || data?.orderId || "0");
  if (!orderId) return;

  const order = await getOrderById(orderId);
  if (!order) return;

  if (event === "payment_intent.created" || event === "charge.pending") {
    // SEPA initiated - set to pending_settlement (48h hold)
    await updateOrderStatus(orderId, "pending_settlement");
    console.log(`[SEPA] Order ${orderId} set to pending_settlement`);
  } else if (event === "payment_intent.succeeded" || event === "charge.succeeded") {
    await processSuccessfulPayment(orderId, data?.id || "", data?.amount?.toString() || "0", data?.currency?.toUpperCase() || "EUR", "SEPA", JSON.stringify(body));
  } else if (event === "payment_intent.payment_failed" || event === "charge.failed") {
    await processFailedPayment(orderId, data?.failure_message || "SEPA failed", "SEPA");
  }
}

// ===== Payomentic Webhook =====
export async function handlePayomenticWebhook(body: any) {
  console.log("[Payomentic Webhook]", JSON.stringify(body));
  const { status, transaction_id, order_id, amount, currency } = body;
  const orderId = parseInt(order_id || "0");
  if (!orderId) return;

  if (status === "SUCCESS" || status === "APPROVED") {
    await processSuccessfulPayment(orderId, transaction_id, amount, currency, "Payomentic", JSON.stringify(body));
  } else if (status === "FAILED" || status === "DECLINED") {
    await processFailedPayment(orderId, "Payomentic declined", "Payomentic");
  }
}

// ===== 2Checkout Webhook =====
export async function handle2CheckoutWebhook(body: any) {
  console.log("[2Checkout Webhook]", JSON.stringify(body));
  const { message_type, sale_id, invoice_id, order_ref, invoice_status } = body;

  const orderId = parseInt(order_ref?.split("-")[0] || "0");
  if (!orderId) return;

  if (message_type === "FRAUD_STATUS_CHANGED" || message_type === "ORDER_CREATED") {
    if (invoice_status === "approved" || invoice_status === "deposited") {
      await processSuccessfulPayment(orderId, sale_id?.toString() || "", "0", "USD", "2Checkout", JSON.stringify(body));
    }
  } else if (message_type === "REFUND_ISSUED") {
    await updateOrderStatus(orderId, "cancelled");
  }
}

// ===== PayPal Webhook =====
export async function handlePayPalWebhook(body: any) {
  console.log("[PayPal Webhook]", JSON.stringify(body));
  const { event_type, resource } = body;
  const orderId = parseInt(resource?.custom_id?.split("-")[0] || resource?.purchase_units?.[0]?.custom_id?.split("-")[0] || "0");
  if (!orderId) return;

  if (event_type === "PAYMENT.CAPTURE.COMPLETED" || event_type === "CHECKOUT.ORDER.APPROVED") {
    await processSuccessfulPayment(orderId, resource?.id || "", resource?.amount?.value || "0", resource?.amount?.currency_code || "USD", "PayPal", JSON.stringify(body));
  } else if (event_type === "PAYMENT.CAPTURE.DENIED" || event_type === "PAYMENT.CAPTURE.DECLINED") {
    await processFailedPayment(orderId, "PayPal declined", "PayPal");
  }
}

// ===== Alipay Webhook =====
export async function handleAlipayWebhook(body: any) {
  console.log("[Alipay Webhook]", JSON.stringify(body));
  const { trade_status, out_trade_no, trade_no, total_amount } = body;
  const orderId = parseInt(out_trade_no?.split("-")[0] || "0");
  if (!orderId) return;

  if (trade_status === "TRADE_SUCCESS" || trade_status === "TRADE_FINISHED") {
    await processSuccessfulPayment(orderId, trade_no, total_amount, "CNY", "Alipay", JSON.stringify(body));
  } else if (trade_status === "TRADE_CLOSED") {
    await processFailedPayment(orderId, "Alipay closed", "Alipay");
  }
}

// ===== WeChat Pay Webhook =====
export async function handleWeChatPayWebhook(body: any) {
  console.log("[WeChat Pay Webhook]", JSON.stringify(body));
  const { return_code, result_code, out_trade_no, transaction_id, total_fee } = body;
  const orderId = parseInt(out_trade_no?.split("-")[0] || "0");
  if (!orderId) return;

  if (return_code === "SUCCESS" && result_code === "SUCCESS") {
    await processSuccessfulPayment(orderId, transaction_id, String(parseInt(total_fee || "0") / 100), "CNY", "WeChat Pay", JSON.stringify(body));
  } else {
    await processFailedPayment(orderId, "WeChat Pay failed", "WeChat Pay");
  }
}

// ===== Telr Webhook =====
export async function handleTelrWebhook(body: any) {
  console.log("[Telr Webhook]", JSON.stringify(body));
  const { tran, order } = body;
  const orderId = parseInt(order?.ref?.split("-")[0] || "0");
  if (!orderId) return;

  if (tran?.status === "A" || tran?.status === "H") {
    // A = Authorised, H = Held
    await processSuccessfulPayment(orderId, tran?.ref || "", tran?.amount || "0", tran?.currency || "AED", "Telr", JSON.stringify(body));
  } else if (tran?.status === "D" || tran?.status === "E") {
    // D = Declined, E = Error
    await processFailedPayment(orderId, "Telr declined", "Telr");
  }
}

// ===== American Express Webhook =====
export async function handleAmexWebhook(body: any) {
  console.log("[Amex Webhook]", JSON.stringify(body));
  const { transactionId, orderRef, amount, currency, status } = body;
  const orderId = parseInt(orderRef?.split("-")[0] || "0");
  if (!orderId) return;

  if (status === "APPROVED" || status === "SUCCESS") {
    await processSuccessfulPayment(orderId, transactionId, amount, currency, "American Express", JSON.stringify(body));
  } else if (status === "DECLINED" || status === "FAILED") {
    await processFailedPayment(orderId, "Amex declined", "American Express");
  }
}

// ===== Generic Webhook (for testing) =====
export async function handleGenericWebhook(body: any) {
  console.log("[Generic Webhook]", JSON.stringify(body));
  const { orderId, status, transactionId, amount, currency } = body;
  if (!orderId) return;

  if (status === "paid" || status === "success") {
    await processSuccessfulPayment(parseInt(orderId), transactionId || "test", amount || "0", currency || "JOD", "Generic", JSON.stringify(body));
  } else if (status === "failed") {
    await processFailedPayment(parseInt(orderId), "Generic failed", "Generic");
  }
}
