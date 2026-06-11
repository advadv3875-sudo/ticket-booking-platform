import type { Request, Response } from "express";
import { stripe } from "./stripe";
import { ENV } from "./_core/env";
import { getDb } from "./db";
import { orders, payments } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

// Webhook secret fallback - used when env var is not injected by platform
const WEBHOOK_SECRET_FALLBACK = "whsec_XwxIKzYy3UpJj8n860gvTKBLci7FFKj4";

function generateTicketNumber(): string {
  return `TK-${nanoid(10).toUpperCase()}`;
}

export async function handleStripeWebhook(req: Request, res: Response) {
  const sig = req.headers["stripe-signature"] as string;
  const webhookSecret = ENV.stripeWebhookSecret || WEBHOOK_SECRET_FALLBACK;

  let event: any;
  try {
    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } else {
      event = JSON.parse(req.body.toString());
    }
  } catch (err: any) {
    console.error("[Stripe Webhook] Signature verification failed:", err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  // Handle test events
  if (event.id && event.id.startsWith("evt_test_")) {
    console.log("[Stripe Webhook] Test event detected, returning verification response");
    return res.json({ verified: true });
  }

  console.log(`[Stripe Webhook] Event: ${event.type} | ID: ${event.id}`);

  try {
    const db = await getDb();
    if (!db) {
      console.error("[Stripe Webhook] Database not available");
      return res.status(500).json({ error: "Database unavailable" });
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const orderId = parseInt(session.metadata?.order_id || session.client_reference_id || "0");
        if (!orderId) break;

        // جلب الطلب الكامل
        const {
          getOrderById, getOrderItems, updateOrderStatus,
          sellTickets, createTickets, createInvoice, getEventById,
        } = await import("./db");

        const order = await getOrderById(orderId);
        if (!order) {
          console.error(`[Stripe Webhook] Order ${orderId} not found`);
          break;
        }

        // تجنب المعالجة المزدوجة
        if (order.status === "paid") {
          console.log(`[Stripe Webhook] Order ${orderId} already paid, skipping`);
          break;
        }

        // تحديث حالة الطلب إلى مدفوع
        await updateOrderStatus(orderId, "paid", {
          paidAt: new Date(),
          gatewayOrderId: session.payment_intent ?? session.id,
        });

        // تسجيل الدفع
        await db.insert(payments).values({
          orderId,
          gateway: "stripe",
          gatewayTransactionId: session.payment_intent ?? session.id,
          amount: String((session.amount_total ?? 0) / 100),
          currency: (session.currency ?? "usd").toUpperCase(),
          status: "confirmed",
          createdAt: new Date(),
        });

        // إنشاء التذاكر
        const items = await getOrderItems(orderId);
        for (const item of items) {
          await sellTickets(item.ticketTypeId, item.quantity);
          await createTickets(
            Array.from({ length: item.quantity }, () => ({
              ticketNumber: generateTicketNumber(),
              orderId: order.id,
              orderItemId: item.id,
              ticketTypeId: item.ticketTypeId,
              eventId: order.eventId,
              holderName: order.customerFullName,
              holderEmail: order.customerEmail,
              qrCodeData: `EP:${order.orderNumber}:${nanoid(8)}`,
              status: "active" as const,
            }))
          );
        }

        // إنشاء الفاتورة
        await createInvoice({ orderId: order.id, invoiceNumber: `INV-${order.orderNumber}` });

        // إرسال إشعار البريد الإلكتروني للعميل
        try {
          const { sendBookingConfirmedNotification } = await import("./notificationService");
          const eventData = await getEventById(order.eventId);
          const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
          await sendBookingConfirmedNotification({
            customerEmail: order.customerEmail,
            customerName: order.customerFullName,
            orderNumber: order.orderNumber,
            eventTitle: eventData?.titleAr ?? eventData?.title ?? "فعالية",
            eventDate: eventData?.startDate ?? new Date(),
            venue: eventData?.venueAr ?? eventData?.venue ?? "فندق ماريوت عمان",
            totalAmount: String((session.amount_total ?? 0) / 100),
            currency: (session.currency ?? "USD").toUpperCase(),
            ticketCount: totalItems,
            orderId: order.id,
            eventId: order.eventId,
            paymentMethod: "stripe",
          });
          console.log(`[Stripe Webhook] Confirmation email sent to ${order.customerEmail}`);
        } catch (notifErr) {
          console.error("[Stripe Webhook] Email notification error:", notifErr);
        }

        console.log(`[Stripe Webhook] Order ${orderId} fully processed (paid + tickets + email)`);
        break;
      }

      case "payment_intent.succeeded": {
        const pi = event.data.object;
        console.log(`[Stripe Webhook] PaymentIntent succeeded: ${pi.id}`);
        // Order already updated via checkout.session.completed
        break;
      }

      case "payment_intent.payment_failed": {
        const pi = event.data.object;
        // Try to find order by gateway transaction id
        const orderRecord = await db.select().from(orders)
          .where(eq(orders.gatewayOrderId, pi.id))
          .limit(1);
        if (orderRecord[0]) {
          await db.update(orders)
            .set({ status: "failed", updatedAt: new Date() })
            .where(eq(orders.id, orderRecord[0].id));

          // إرسال إشعار فشل الدفع
          try {
            const { sendPaymentFailedNotification } = await import("./notificationService");
            const { getEventById } = await import("./db");
            const failedOrder = orderRecord[0];
            const eventData = await getEventById(failedOrder.eventId);
            await sendPaymentFailedNotification({
              customerEmail: failedOrder.customerEmail,
              customerName: failedOrder.customerFullName,
              orderNumber: failedOrder.orderNumber,
              eventTitle: eventData?.titleAr ?? eventData?.title ?? "فعالية",
              totalAmount: String(failedOrder.totalAmount),
              currency: failedOrder.currency,
              orderId: failedOrder.id,
              eventId: failedOrder.eventId,
            });
          } catch (notifErr) {
            console.error("[Stripe Webhook] Failed payment email error:", notifErr);
          }

          console.log(`[Stripe Webhook] Order ${orderRecord[0].id} marked as FAILED`);
        }
        break;
      }

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }
  } catch (err) {
    console.error("[Stripe Webhook] Processing error:", err);
    return res.status(500).json({ error: "Webhook processing failed" });
  }

  return res.json({ received: true });
}
