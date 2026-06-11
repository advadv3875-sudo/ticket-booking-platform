/**
 * Notification Service - خدمة الإشعارات المتكاملة
 * يدعم: البريد الإلكتروني، إشعارات المتصفح (Push)، إشعارات المدير، التذكيرات
 */

import { getDb } from "./db";
import { notifications, pushSubscriptions, orders, events, tickets, announcementBanners } from "../drizzle/schema";
import { eq, and, gte, lte, lt } from "drizzle-orm";
import { notifyOwner } from "./_core/notification";
import QRCode from "qrcode";

// دالة مساعدة: توليد QR Code كـ Data URL (base64 PNG)
async function generateQRCodeDataUrl(data: string): Promise<string> {
  try {
    return await QRCode.toDataURL(data, {
      width: 200,
      margin: 2,
      color: { dark: "#c9a84c", light: "#111111" },
    });
  } catch {
    return "";
  }
}

// ─── Email Templates ──────────────────────────────────────────────────────────

async function buildBookingConfirmedEmail(data: {
  customerName: string;
  orderNumber: string;
  eventTitle: string;
  eventDate: string;
  venue: string;
  totalAmount: string;
  currency: string;
  ticketCount: number;
  invoiceUrl?: string;
  qrCodeDataUrl?: string;
  ticketNumbers?: string[];
  paymentMethod?: string;
}): Promise<{ subject: string; html: string }> {
  const subject = `✅ تأكيد حجزك - ${data.eventTitle} | Expert Plan`;
  const paymentMethodLabel: Record<string, string> = {
    stripe: "💳 بطاقة ائتمانية (Stripe)",
    paypal: "💰 PayPal",
    sepa: "🇪🇺 SEPA تحويل مصرفي",
    bank_transfer_usd: "🇺🇸 تحويل بنكي (USD)",
    bank_transfer_gbp: "🇬🇧 تحويل بنكي (GBP)",
    hyperpay: "💳 HyperPay",
  };
  const paymentLabel = data.paymentMethod ? (paymentMethodLabel[data.paymentMethod] ?? data.paymentMethod) : "";

  const qrSection = data.qrCodeDataUrl ? `
    <div style="background:#1a1a1a;border:1px solid #c9a84c33;border-radius:10px;padding:20px;margin-bottom:20px;text-align:center;">
      <div style="font-size:14px;color:#888;margin-bottom:12px;text-transform:uppercase;letter-spacing:1px;">🎫 رمز QR التذكرة</div>
      <img src="${data.qrCodeDataUrl}" alt="QR Code" style="width:180px;height:180px;border-radius:8px;border:2px solid #c9a84c33;" />
      <div style="font-size:12px;color:#666;margin-top:10px;">اعرض هذا الرمز عند بوابة الدخول لتأكيد حضورك</div>
      ${data.ticketNumbers && data.ticketNumbers.length > 0 ? `<div style="font-size:11px;color:#c9a84c;margin-top:6px;font-family:monospace;">${data.ticketNumbers.join(" · ")}</div>` : ""}
    </div>` : "";

  const html = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Arial', sans-serif; background: #0a0a0a; color: #fff; margin: 0; padding: 20px 0; }
    .container { max-width: 600px; margin: 0 auto; background: #111; border: 1px solid #c9a84c33; border-radius: 12px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%); padding: 40px 30px; text-align: center; border-bottom: 2px solid #c9a84c; }
    .logo { font-size: 26px; font-weight: bold; color: #c9a84c; letter-spacing: 2px; }
    .logo-sub { font-size: 12px; color: #888; margin-top: 4px; }
    .badge { display: inline-block; background: #22c55e22; border: 1px solid #22c55e; color: #22c55e; padding: 8px 20px; border-radius: 20px; font-size: 14px; margin-top: 16px; font-weight: bold; }
    .body { padding: 32px; }
    .greeting { font-size: 20px; color: #c9a84c; margin-bottom: 8px; font-weight: bold; }
    .message { color: #ccc; line-height: 1.8; margin-bottom: 24px; }
    .card { background: #1a1a1a; border: 1px solid #c9a84c33; border-radius: 10px; padding: 20px; margin-bottom: 20px; }
    .card-title { font-size: 13px; color: #888; margin-bottom: 14px; text-transform: uppercase; letter-spacing: 1px; }
    .detail-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #ffffff0d; }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { color: #888; font-size: 14px; }
    .detail-value { color: #fff; font-size: 14px; font-weight: 600; text-align: left; }
    .amount-box { background: linear-gradient(135deg, #1a1500, #2a2000); border: 1px solid #c9a84c55; border-radius: 10px; padding: 20px; text-align: center; margin-bottom: 20px; }
    .amount { font-size: 32px; color: #c9a84c; font-weight: bold; }
    .amount-label { font-size: 13px; color: #888; margin-top: 4px; }
    .btn { display: block; background: linear-gradient(135deg, #c9a84c, #e8c96d); color: #000 !important; text-align: center; padding: 16px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; margin: 20px 0; }
    .btn-outline { display: block; background: transparent; border: 1px solid #c9a84c; color: #c9a84c !important; text-align: center; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; margin: 10px 0; }
    .footer { background: #0a0a0a; padding: 24px 30px; text-align: center; border-top: 1px solid #c9a84c22; }
    .footer-text { color: #555; font-size: 12px; line-height: 1.8; }
    .divider { height: 1px; background: #c9a84c22; margin: 20px 0; }
    .policy-box { background: #1a0a0a; border: 1px solid #ff444422; border-radius: 8px; padding: 14px 16px; margin-top: 16px; }
    .policy-text { color: #ff6666; font-size: 12px; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="logo">⭐ Expert Plan</div>
      <div class="logo-sub">by MUSTAFA ALJAZAEERI | خطة الخبراء</div>
      <div class="badge">✅ تم تأكيد حجزك بنجاح</div>
    </div>

    <!-- Body -->
    <div class="body">
      <div class="greeting">مرحباً ${data.customerName}!</div>
      <div class="message">
        يسعدنا إخبارك بأن دفعك قد تم بنجاح وتذكرتك جاهزة! 
        نتطلع إلى رؤيتك في <strong style="color:#c9a84c">${data.eventTitle}</strong>.
      </div>

      <!-- رسالة شخصية من مصطفى الجزائري -->
      <div style="background:linear-gradient(135deg,rgba(201,168,76,0.07),rgba(20,20,35,0.8));border:1px solid rgba(201,168,76,0.18);border-radius:12px;padding:20px;margin:0 0 24px 0;text-align:right;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
          <span style="font-size:18px;">💛</span>
          <span style="color:#c9a84c;font-weight:700;font-size:13px;letter-spacing:0.5px;">رسالة شخصية من مصطفى الجزائري</span>
        </div>
        <p style="color:#ddd;line-height:1.9;font-size:14px;margin:0 0 14px 0;">
          شكراً جزيلاً لثقتك بنا وباختيارك لـ <strong style="color:#c9a84c;">Expert Plan</strong>.
          يسعدنا أن نكون جزءاً من تجربتك المميزة، وسنبذل كل جهدنا لضمان أن تكون هذه الفعالية
          من أجمل اللحظات التي تعيشها. نلتزم بتقديم أعلى معايير الجودة والاحترافية في كل تفصيلة.
        </p>
        <p style="color:#777;font-size:12px;margin:0 0 14px 0;font-weight:600;border-top:1px solid rgba(201,168,76,0.1);padding-top:10px;">
          — مصطفى الجزائري، المؤسس والمدير التنفيذي
        </p>
        <!-- البطاقة الرقمية -->
        <a href="https://aljazaeeri.site.expertplan.vip/digital-card" target="_blank" rel="noopener noreferrer" style="display:block;text-decoration:none;">
          <img
            src="https://d2xsxph8kpxj0f.cloudfront.net/310519663444865328/GHvM9jHA5PpD8tSaYENMCe/digital-card-email_9e8567dc.png"
            alt="بطاقة مصطفى الجزائري الرقمية"
            width="560"
            style="width:100%;max-width:560px;border-radius:10px;border:1px solid rgba(201,168,76,0.25);display:block;margin:0 auto;"
          />
          <p style="color:#c9a84c;font-size:11px;text-align:center;margin:6px 0 0 0;">اضغط لعرض بطاقتي الرقمية الكاملة</p>
        </a>
      </div>

      <!-- Booking Details -->
      <div class="card">
        <div class="card-title">🎫 تفاصيل الحجز</div>
        <div class="detail-row">
          <span class="detail-label">📝 رقم الطلب</span>
          <span class="detail-value" style="color:#c9a84c;font-family:monospace;">${data.orderNumber}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">🎉 الفعالية</span>
          <span class="detail-value">${data.eventTitle}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">📅 التاريخ</span>
          <span class="detail-value">${data.eventDate}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">📍 المكان</span>
          <span class="detail-value">${data.venue}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">🎫 عدد التذاكر</span>
          <span class="detail-value">${data.ticketCount} تذكرة</span>
        </div>
        ${paymentLabel ? `
        <div class="detail-row">
          <span class="detail-label">💳 طريقة الدفع</span>
          <span class="detail-value">${paymentLabel}</span>
        </div>` : ""}
      </div>

      <!-- Amount -->
      <div class="amount-box">
        <div class="amount-label">المبلغ المدفوع</div>
        <div class="amount">${data.totalAmount} ${data.currency}</div>
      </div>

      <!-- QR Code -->
      ${qrSection}

      <!-- Buttons -->
      ${data.invoiceUrl ? `<a href="${data.invoiceUrl}" class="btn">📄 تحميل الفاتورة</a>` : ""}
      <a href="https://aljazaeeri.site.expertplan.vip/track" class="btn-outline">🔍 تتبع حجزك</a>

      <div class="divider"></div>

      <!-- No Refund Policy -->
      <div class="policy-box">
        <div class="policy-text">
          ⚠️ <strong>سياسة عدم الاسترداد:</strong> جميع المدفوعات نهائية وغير قابلة للاسترداد بعد إتمام عملية الدفع.
          للاستفسار تواصل معنا عبر البريد: maljazaeeri@gmail.com
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div class="footer-text">
        ⭐ Expert Plan by MUSTAFA ALJAZAEERI<br>
        عمان، المملكة الأردنية الهاشمية | فندق ماريوت عمان<br>
        📞 +962 79 075 9982 | 📧 maljazaeeri@gmail.com<br>
        <br>
        <a href="https://aljazaeeri.site.expertplan.vip" style="color:#c9a84c;text-decoration:none;">aljazaeeri.site.expertplan.vip</a><br>
        <br>
        هذا البريد الإلكتروني تم إرساله تلقائياً، يرجى عدم الرد عليه.
      </div>
    </div>
  </div>
</body>
</html>`;
  return { subject, html };
}

function buildPaymentFailedEmail(data: {
  customerName: string;
  orderNumber: string;
  eventTitle: string;
  totalAmount: string;
  currency: string;
}): { subject: string; html: string } {
  const subject = `❌ فشل الدفع - طلب #${data.orderNumber} | Expert Plan`;
  const html = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; background: #0a0a0a; color: #fff; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #111; border: 1px solid #ff444433; border-radius: 12px; overflow: hidden; }
    .header { background: #1a0a0a; padding: 30px; text-align: center; border-bottom: 2px solid #ff4444; }
    .logo { font-size: 22px; font-weight: bold; color: #c9a84c; }
    .badge { display: inline-block; background: #ff444422; border: 1px solid #ff4444; color: #ff4444; padding: 6px 16px; border-radius: 20px; font-size: 13px; margin-top: 12px; }
    .body { padding: 30px; }
    .message { color: #ccc; line-height: 1.7; margin-bottom: 20px; }
    .btn { display: block; background: linear-gradient(135deg, #c9a84c, #e8c96d); color: #000; text-align: center; padding: 14px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 20px 0; }
    .footer { background: #0a0a0a; padding: 16px; text-align: center; color: #555; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">خطة الخبراء</div>
      <div class="badge">❌ فشل الدفع</div>
    </div>
    <div class="body">
      <div class="message">مرحباً ${data.customerName}،</div>
      <div class="message">
        للأسف، لم تتمكن من إتمام عملية الدفع لطلبك رقم <strong>${data.orderNumber}</strong> 
        للفعالية <strong>${data.eventTitle}</strong> بمبلغ <strong>${data.totalAmount} ${data.currency}</strong>.
        <br><br>
        يمكنك المحاولة مرة أخرى أو اختيار طريقة دفع مختلفة.
      </div>
      <a href="https://tickethub-ghvm9jha.manus.space/events" class="btn">🔄 المحاولة مرة أخرى</a>
    </div>
    <div class="footer">شركة خطة الخبراء | عمان، الأردن</div>
  </div>
</body>
</html>`;
  return { subject, html };
}

function buildEventReminderEmail(data: {
  customerName: string;
  eventTitle: string;
  eventDate: string;
  venue: string;
  daysLeft: number;
  orderNumber: string;
}): { subject: string; html: string } {
  const subject = `🔔 تذكير: ${data.eventTitle} بعد ${data.daysLeft} ${data.daysLeft === 1 ? "يوم" : "أيام"} | Expert Plan`;
  const html = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; background: #0a0a0a; color: #fff; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #111; border: 1px solid #c9a84c33; border-radius: 12px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #1a1a1a, #2a2a2a); padding: 30px; text-align: center; border-bottom: 2px solid #c9a84c; }
    .logo { font-size: 22px; font-weight: bold; color: #c9a84c; }
    .countdown { font-size: 48px; font-weight: bold; color: #c9a84c; text-align: center; padding: 20px; }
    .body { padding: 30px; }
    .message { color: #ccc; line-height: 1.7; }
    .detail { background: #1a1a1a; border: 1px solid #c9a84c33; border-radius: 8px; padding: 16px; margin: 16px 0; }
    .footer { background: #0a0a0a; padding: 16px; text-align: center; color: #555; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">خطة الخبراء</div>
    </div>
    <div class="countdown">${data.daysLeft} ${data.daysLeft === 1 ? "يوم" : "أيام"}</div>
    <div class="body">
      <div class="message">مرحباً ${data.customerName}،</div>
      <div class="message">
        تذكير بأن فعالية <strong>${data.eventTitle}</strong> ستبدأ بعد <strong>${data.daysLeft} ${data.daysLeft === 1 ? "يوم" : "أيام"}</strong>!
      </div>
      <div class="detail">
        📅 <strong>التاريخ:</strong> ${data.eventDate}<br>
        📍 <strong>المكان:</strong> ${data.venue}<br>
        🎫 <strong>رقم طلبك:</strong> ${data.orderNumber}
      </div>
      <div class="message" style="font-size: 13px; color: #888;">
        احضر تذكرتك (رمز QR) في الوقت المحدد. نتطلع إلى رؤيتك!
      </div>
    </div>
    <div class="footer">شركة خطة الخبراء | عمان، الأردن</div>
  </div>
</body>
</html>`;
  return { subject, html };
}

// ─── Send Email via Manus Built-in API ───────────────────────────────────────

async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  try {
    const apiUrl = process.env.BUILT_IN_FORGE_API_URL;
    const apiKey = process.env.BUILT_IN_FORGE_API_KEY;
    if (!apiUrl || !apiKey) {
      console.warn("[Notifications] Missing BUILT_IN_FORGE_API_URL or BUILT_IN_FORGE_API_KEY");
      return false;
    }
    const response = await fetch(`${apiUrl}/v1/email/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        to,
        subject,
        html,
        from_name: "خطة الخبراء - Expert Plan",
      }),
    });
    return response.ok;
  } catch (err) {
    console.error("[Notifications] Email send error:", err);
    return false;
  }
}

// ─── Save Notification to DB ─────────────────────────────────────────────────

async function saveNotification(data: {
  recipientEmail?: string;
  recipientType: "customer" | "admin" | "organizer";
  type: typeof notifications.$inferInsert["type"];
  title: string;
  message: string;
  orderId?: number;
  eventId?: number;
  channel: "email" | "push" | "in_app" | "sms";
  status: "pending" | "sent" | "failed";
}): Promise<void> {
  try {
    const db = await getDb();
    if (!db) return;
    await db.insert(notifications).values({
      ...data,
      sentAt: data.status === "sent" ? new Date() : undefined,
    });
  } catch (err) {
    console.error("[Notifications] Save error:", err);
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * إشعار تأكيد الحجز للعميل
 */
export async function sendBookingConfirmedNotification(data: {
  customerEmail: string;
  customerName: string;
  orderNumber: string;
  eventTitle: string;
  eventDate: Date;
  venue: string;
  totalAmount: string;
  currency: string;
  ticketCount: number;
  orderId: number;
  eventId: number;
  invoiceUrl?: string;
  paymentMethod?: string;
}): Promise<void> {
  const eventDateStr = data.eventDate.toLocaleDateString("ar-JO", {
    weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit"
  });

  // جلب التذاكر وتوليد QR Code للتذكرة الأولى
  let qrCodeDataUrl: string | undefined;
  let ticketNumbers: string[] = [];
  try {
    const { getTicketsByOrderId } = await import("./db");
    const orderTickets = await getTicketsByOrderId(data.orderId);
    if (orderTickets.length > 0) {
      ticketNumbers = orderTickets.map((t: { ticketNumber: string }) => t.ticketNumber);
      const firstTicket = orderTickets[0];
      const qrData = firstTicket.qrCodeData ?? firstTicket.ticketNumber;
      qrCodeDataUrl = await generateQRCodeDataUrl(qrData);
    }
  } catch (qrErr) {
    console.warn("[Notifications] QR Code generation failed:", qrErr);
  }

  const { subject, html } = await buildBookingConfirmedEmail({
    customerName: data.customerName,
    orderNumber: data.orderNumber,
    eventTitle: data.eventTitle,
    eventDate: eventDateStr,
    venue: data.venue,
    totalAmount: data.totalAmount,
    currency: data.currency,
    ticketCount: data.ticketCount,
    invoiceUrl: data.invoiceUrl,
    qrCodeDataUrl,
    ticketNumbers,
    paymentMethod: data.paymentMethod,
  });

  const sent = await sendEmail(data.customerEmail, subject, html);
  await saveNotification({
    recipientEmail: data.customerEmail,
    recipientType: "customer",
    type: "booking_confirmed",
    title: subject,
    message: `تأكيد حجز الطلب ${data.orderNumber}`,
    orderId: data.orderId,
    eventId: data.eventId,
    channel: "email",
    status: sent ? "sent" : "failed",
  });

  // إشعار المدير
  await notifyOwner({
    title: `🎫 حجز جديد: ${data.eventTitle}`,
    content: `العميل: ${data.customerName} (${data.customerEmail})\nالطلب: ${data.orderNumber}\nالمبلغ: ${data.totalAmount} ${data.currency}\nالتذاكر: ${data.ticketCount}`,
  });

  await saveNotification({
    recipientType: "admin",
    type: "new_booking_admin",
    title: `حجز جديد: ${data.orderNumber}`,
    message: `${data.customerName} حجز ${data.ticketCount} تذكرة لـ ${data.eventTitle}`,
    orderId: data.orderId,
    eventId: data.eventId,
    channel: "in_app",
    status: "sent",
  });
}

/**
 * إشعار فشل الدفع للعميل
 */
export async function sendPaymentFailedNotification(data: {
  customerEmail: string;
  customerName: string;
  orderNumber: string;
  eventTitle: string;
  totalAmount: string;
  currency: string;
  orderId: number;
  eventId: number;
}): Promise<void> {
  const { subject, html } = buildPaymentFailedEmail({
    customerName: data.customerName,
    orderNumber: data.orderNumber,
    eventTitle: data.eventTitle,
    totalAmount: data.totalAmount,
    currency: data.currency,
  });

  const sent = await sendEmail(data.customerEmail, subject, html);
  await saveNotification({
    recipientEmail: data.customerEmail,
    recipientType: "customer",
    type: "payment_failed",
    title: subject,
    message: `فشل الدفع للطلب ${data.orderNumber}`,
    orderId: data.orderId,
    eventId: data.eventId,
    channel: "email",
    status: sent ? "sent" : "failed",
  });
}

/**
 * إرسال تذكيرات الفعاليات (يُستدعى من scheduler)
 */
export async function sendEventReminders(): Promise<void> {
  try {
    const db = await getDb();
    if (!db) return;

    const now = new Date();
    const in1Day = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const in2Days = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const in8Days = new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000);

    // جلب الطلبات المدفوعة للفعاليات القادمة
    const paidOrders = await db
      .select({
        orderId: orders.id,
        orderNumber: orders.orderNumber,
        customerEmail: orders.customerEmail,
        customerName: orders.customerFullName,
        eventId: events.id,
        eventTitle: events.title,
        eventDate: events.startDate,
        venue: events.venue,
      })
      .from(orders)
      .innerJoin(events, eq(orders.eventId, events.id))
      .where(
        and(
          eq(orders.status, "paid"),
          // فعاليات بعد يوم أو بعد أسبوع
        )
      );

    for (const order of paidOrders) {
      const eventDate = order.eventDate;
      const daysUntil = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (daysUntil === 1 || daysUntil === 7) {
        // تحقق أن التذكير لم يُرسل مسبقاً
        const existingReminders = await db
          .select()
          .from(notifications)
          .where(
            and(
              eq(notifications.orderId, order.orderId),
              eq(notifications.type, daysUntil === 1 ? "event_reminder_1day" : "event_reminder_1week"),
              eq(notifications.status, "sent")
            )
          )
          .limit(1);

        if (existingReminders.length > 0) continue;

        const eventDateStr = eventDate.toLocaleDateString("ar-JO", {
          weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit"
        });

        const { subject, html } = buildEventReminderEmail({
          customerName: order.customerName,
          eventTitle: order.eventTitle,
          eventDate: eventDateStr,
          venue: order.venue || "فندق ماريوت عمان",
          daysLeft: daysUntil,
          orderNumber: order.orderNumber,
        });

        const sent = await sendEmail(order.customerEmail, subject, html);
        await saveNotification({
          recipientEmail: order.customerEmail,
          recipientType: "customer",
          type: daysUntil === 1 ? "event_reminder_1day" : "event_reminder_1week",
          title: subject,
          message: `تذكير بفعالية ${order.eventTitle} بعد ${daysUntil} ${daysUntil === 1 ? "يوم" : "أيام"}`,
          orderId: order.orderId,
          eventId: order.eventId,
          channel: "email",
          status: sent ? "sent" : "failed",
        });
      }
    }
  } catch (err) {
    console.error("[Notifications] Event reminders error:", err);
  }
}

/**
 * إشعار المدير عند نفاد المقاعد
 */
export async function sendLowStockAlert(eventTitle: string, ticketTypeName: string, remaining: number, eventId: number): Promise<void> {
  await notifyOwner({
    title: `⚠️ تحذير: مقاعد على وشك النفاد`,
    content: `الفعالية: ${eventTitle}\nنوع التذكرة: ${ticketTypeName}\nالمتبقي: ${remaining} مقعد فقط`,
  });

  await saveNotification({
    recipientType: "admin",
    type: remaining === 0 ? "sold_out" : "low_stock",
    title: remaining === 0 ? `نفدت مقاعد ${ticketTypeName}` : `تحذير: ${remaining} مقعد متبقي`,
    message: `${eventTitle} - ${ticketTypeName}: ${remaining} مقعد متبقي`,
    eventId,
    channel: "in_app",
    status: "sent",
  });
}

/**
 * جلب إشعارات المدير (للوحة التحكم)
 */
export async function getAdminNotifications(limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.recipientType, "admin"))
    .orderBy(notifications.createdAt)
    .limit(limit);
}

/**
 * تسجيل اشتراك Push Notification
 */
export async function savePushSubscription(data: {
  endpoint: string;
  p256dh: string;
  auth: string;
  userEmail?: string;
}): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(pushSubscriptions).values(data);
}

/**
 * جلب الإعلانات النشطة
 */
export async function getActiveBanners() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(announcementBanners)
    .where(eq(announcementBanners.isActive, true));
}
