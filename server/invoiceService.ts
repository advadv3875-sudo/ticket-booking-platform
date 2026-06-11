/**
 * Invoice & QR Code Generation Service
 * Expert Plan - خطة الخبراء
 * Generates professional invoices with unique QR codes per ticket
 */

import QRCode from "qrcode";
import { getOrderById, getOrderItems, getTicketsByOrderId, getInvoiceByOrderId, createInvoice } from "./db";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";

// ===== QR Code Generation =====
export async function generateQRCode(data: string): Promise<string> {
  try {
    const qrDataUrl = await QRCode.toDataURL(data, {
      errorCorrectionLevel: "H",
      type: "image/png",
      width: 256,
      margin: 2,
      color: { dark: "#1a1a2e", light: "#ffffff" },
    });
    return qrDataUrl;
  } catch (error) {
    console.error("[QR] Failed to generate QR code:", error);
    return "";
  }
}

// ===== HTML Invoice Template =====
function generateInvoiceHTML(data: {
  invoiceNumber: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  eventTitle: string;
  eventTitleAr?: string;
  eventDate: string;
  eventVenue: string;
  items: Array<{ name: string; nameAr?: string; quantity: number; unitPrice: number; total: number }>;
  subtotal: number;
  total: number;
  currency: string;
  paymentMethod: string;
  status: string;
  createdAt: string;
  tickets: Array<{ ticketNumber: string; holderName: string; qrDataUrl: string }>;
}): string {
  const paymentMethodLabels: Record<string, string> = {
    card: "بطاقة ائتمان", sepa: "SEPA", bank_transfer: "تحويل بنكي",
    paypal: "PayPal", applepay: "Apple Pay", googlepay: "Google Pay",
    alipay: "Alipay", wechatpay: "WeChat Pay", telr: "Telr",
    amex: "American Express", payomentic: "Payomentic", "2checkout": "2Checkout",
    hyperpaywallet: "HyperPay Wallet",
  };

  const statusLabels: Record<string, string> = {
    paid: "مدفوع ✓", pending_payment: "في انتظار الدفع",
    pending_settlement: "في انتظار التسوية", failed: "فشل", cancelled: "ملغي",
  };

  const ticketsHTML = data.tickets.map((t) => `
    <div style="border: 2px solid #f59e0b; border-radius: 12px; padding: 16px; margin: 8px 0; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: white; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <div style="color: #f59e0b; font-size: 11px; margin-bottom: 4px;">Expert Plan - خطة الخبراء</div>
        <div style="font-size: 16px; font-weight: bold;">${t.holderName}</div>
        <div style="color: #9ca3af; font-size: 12px; margin-top: 4px; font-family: monospace;">${t.ticketNumber}</div>
      </div>
      ${t.qrDataUrl ? `<img src="${t.qrDataUrl}" width="80" height="80" style="border-radius: 8px;" />` : ""}
    </div>
  `).join("");

  const itemsHTML = data.items.map((item) => `
    <tr>
      <td style="padding: 10px 12px; border-bottom: 1px solid #f3f4f6; font-size: 14px;">${item.nameAr || item.name}</td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #f3f4f6; text-align: center; font-size: 14px;">${item.quantity}</td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #f3f4f6; text-align: right; font-size: 14px;">${item.unitPrice.toFixed(2)} ${data.currency}</td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #f3f4f6; text-align: right; font-weight: bold; font-size: 14px;">${item.total.toFixed(2)} ${data.currency}</td>
    </tr>
  `).join("");

  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>فاتورة ${data.invoiceNumber}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@400;600;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Noto Kufi Arabic', Arial, sans-serif; background: #f9fafb; color: #1f2937; direction: rtl; }
    .invoice-container { max-width: 800px; margin: 0 auto; background: white; }
    .header { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); color: white; padding: 40px; }
    .company-name { font-size: 28px; font-weight: 700; color: #f59e0b; }
    .company-sub { font-size: 13px; color: #9ca3af; margin-top: 4px; }
    .invoice-title { font-size: 36px; font-weight: 700; color: white; margin-top: 20px; }
    .invoice-meta { display: flex; justify-content: space-between; margin-top: 20px; }
    .meta-item label { font-size: 11px; color: #9ca3af; display: block; }
    .meta-item span { font-size: 14px; color: white; font-weight: 600; }
    .body { padding: 40px; }
    .section { margin-bottom: 32px; }
    .section-title { font-size: 16px; font-weight: 700; color: #1f2937; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid #f59e0b; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .info-item label { font-size: 11px; color: #6b7280; display: block; margin-bottom: 4px; }
    .info-item span { font-size: 14px; color: #1f2937; font-weight: 500; }
    table { width: 100%; border-collapse: collapse; }
    thead th { background: #f9fafb; padding: 12px; font-size: 12px; color: #6b7280; font-weight: 600; text-align: right; }
    .total-section { background: #f9fafb; border-radius: 12px; padding: 20px; }
    .total-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; }
    .total-final { font-size: 20px; font-weight: 700; color: #f59e0b; border-top: 2px solid #e5e7eb; padding-top: 12px; margin-top: 8px; }
    .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; background: #d1fae5; color: #065f46; }
    .footer { background: #f9fafb; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb; }
    .footer p { font-size: 12px; color: #9ca3af; }
    .footer .brand { font-size: 14px; font-weight: 700; color: #f59e0b; }
  </style>
</head>
<body>
  <div class="invoice-container">
    <!-- Header -->
    <div class="header">
      <div class="company-name">خطة الخبراء</div>
      <div class="company-sub">Expert Plan by MUSTAFA ALJAZAEERI</div>
      <div class="invoice-title">فاتورة</div>
      <div class="invoice-meta">
        <div class="meta-item">
          <label>رقم الفاتورة</label>
          <span>${data.invoiceNumber}</span>
        </div>
        <div class="meta-item">
          <label>رقم الطلب</label>
          <span>${data.orderNumber}</span>
        </div>
        <div class="meta-item">
          <label>التاريخ</label>
          <span>${data.createdAt}</span>
        </div>
        <div class="meta-item">
          <label>الحالة</label>
          <span class="status-badge">${statusLabels[data.status] || data.status}</span>
        </div>
      </div>
    </div>

    <div class="body">
      <!-- Customer Info -->
      <div class="section">
        <div class="section-title">معلومات العميل</div>
        <div class="info-grid">
          <div class="info-item">
            <label>الاسم الكامل</label>
            <span>${data.customerName}</span>
          </div>
          <div class="info-item">
            <label>البريد الإلكتروني</label>
            <span dir="ltr">${data.customerEmail}</span>
          </div>
          ${data.customerPhone ? `<div class="info-item"><label>الهاتف</label><span dir="ltr">${data.customerPhone}</span></div>` : ""}
          <div class="info-item">
            <label>طريقة الدفع</label>
            <span>${paymentMethodLabels[data.paymentMethod] || data.paymentMethod}</span>
          </div>
        </div>
      </div>

      <!-- Event Info -->
      <div class="section">
        <div class="section-title">تفاصيل الفعالية</div>
        <div class="info-grid">
          <div class="info-item">
            <label>اسم الفعالية</label>
            <span>${data.eventTitleAr || data.eventTitle}</span>
          </div>
          <div class="info-item">
            <label>التاريخ</label>
            <span>${data.eventDate}</span>
          </div>
          <div class="info-item">
            <label>المكان</label>
            <span>${data.eventVenue}</span>
          </div>
        </div>
      </div>

      <!-- Items -->
      <div class="section">
        <div class="section-title">التذاكر المحجوزة</div>
        <table>
          <thead>
            <tr>
              <th>الفئة</th>
              <th style="text-align: center;">الكمية</th>
              <th style="text-align: right;">سعر الوحدة</th>
              <th style="text-align: right;">الإجمالي</th>
            </tr>
          </thead>
          <tbody>${itemsHTML}</tbody>
        </table>
      </div>

      <!-- Total -->
      <div class="section">
        <div class="total-section">
          <div class="total-row">
            <span>المجموع الفرعي</span>
            <span>${data.subtotal.toFixed(2)} ${data.currency}</span>
          </div>
          <div class="total-row">
            <span>رسوم الخدمة</span>
            <span style="color: #10b981;">مجاناً</span>
          </div>
          <div class="total-row total-final">
            <span>الإجمالي</span>
            <span>${data.total.toFixed(2)} ${data.currency}</span>
          </div>
        </div>
      </div>

      <!-- Tickets with QR -->
      ${data.tickets.length > 0 ? `
      <div class="section">
        <div class="section-title">تذاكرك (${data.tickets.length})</div>
        ${ticketsHTML}
      </div>
      ` : ""}
    </div>

    <!-- Footer -->
    <div class="footer">
      <div class="brand">خطة الخبراء - Expert Plan</div>
      <p style="margin-top: 8px;">شكراً لاختيارك خطة الخبراء لتنظيم فعالياتك</p>
      <p style="margin-top: 4px;">للاستفسار: info@expertplan.jo | www.expertplan.jo</p>
    </div>
  </div>
</body>
</html>`;
}

// ===== Generate Invoice for Order =====
export async function generateOrderInvoice(orderId: number): Promise<string | null> {
  try {
    // Check if invoice already exists
    const existingInvoice = await getInvoiceByOrderId(orderId);
    if (existingInvoice) {
      return existingInvoice.pdfUrl;
    }

    const order = await getOrderById(orderId);
    if (!order) {
      console.error(`[Invoice] Order ${orderId} not found`);
      return null;
    }

    const orderItems = await getOrderItems(orderId);
    const tickets = await getTicketsByOrderId(orderId);

    // Generate QR codes for each ticket
    const ticketsWithQR = await Promise.all(
      tickets.map(async (ticket) => ({
        ticketNumber: ticket.ticketNumber,
        holderName: ticket.holderName ?? "",
        qrDataUrl: await generateQRCode(
          JSON.stringify({
            ticketNumber: ticket.ticketNumber,
            orderNumber: order.orderNumber,
            event: ticket.eventId,
            holder: ticket.holderName,
          })
        ),
      }))
    );

    // Build items data
    const itemsData = orderItems.map((item) => ({
      name: `تذكرة #${item.ticketTypeId}`,
      nameAr: `تذكرة #${item.ticketTypeId}`,
      quantity: item.quantity,
      unitPrice: parseFloat(String(item.unitPrice)),
      total: parseFloat(String(item.unitPrice)) * item.quantity,
    }));

    const invoiceNumber = `INV-${Date.now()}-${nanoid(6).toUpperCase()}`;
    const createdAtFormatted = new Date(order.createdAt).toLocaleDateString("ar-JO", {
      year: "numeric", month: "long", day: "numeric",
    });

    // Generate HTML
    const html = generateInvoiceHTML({
      invoiceNumber,
      orderNumber: order.orderNumber,
      customerName: order.customerFullName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone || undefined,
      eventTitle: "Expert Plan Event",
      eventTitleAr: "فعالية خطة الخبراء",
      eventDate: createdAtFormatted,
      eventVenue: "الأردن",
      items: itemsData,
      subtotal: parseFloat(String(order.subtotalAmount)),
      total: parseFloat(String(order.totalAmount)),
      currency: order.currency,
      paymentMethod: order.paymentMethod,
      status: order.status,
      createdAt: createdAtFormatted,
      tickets: ticketsWithQR,
    });

    // Upload HTML invoice to S3
    const fileKey = `invoices/${order.orderNumber}-${nanoid(8)}.html`;
    const { url } = await storagePut(fileKey, Buffer.from(html, "utf-8"), "text/html");

    // Save invoice record
    await createInvoice({
      orderId,
      invoiceNumber,
      pdfUrl: url,
      pdfKey: fileKey,
    });

    console.log(`[Invoice] Generated for order ${order.orderNumber}: ${url}`);
    return url;
  } catch (error) {
    console.error(`[Invoice] Failed to generate for order ${orderId}:`, error);
    return null;
  }
}
