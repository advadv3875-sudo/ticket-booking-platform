import Stripe from "stripe";
import { ENV } from "./_core/env";

// Live key - production mode
const STRIPE_KEY_FALLBACK = "STRIPE_KEY_HERE";

// Lazy initialization - only create Stripe instance when needed
let _stripe: Stripe | null = null;
export function getStripe(): Stripe {
  if (!_stripe) {
    const secretKey = ENV.stripeSecretKey || STRIPE_KEY_FALLBACK;
    if (!secretKey) {
      throw new Error("STRIPE_SECRET_KEY is not configured. Please add it in Settings → Secrets.");
    }
    _stripe = new Stripe(secretKey, {
      apiVersion: "2026-03-25.dahlia",
    });
  }
  return _stripe;
}

// Keep backward compat export
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripe() as any)[prop];
  },
});

/**
 * تحديد طرق الدفع المتاحة حسب العملة
 * card فقط لضمان الاستقرار
 */
function getPaymentMethods(curr: string): string[] {
  // card فقط لجميع العملات - الأكثر استقراراً وتوافقاً
  return ["card"];
}

/**
 * إنشاء Stripe Checkout Session لدفع تذكرة
 * بدون 3D Secure إجباري - مجرد إدخال بيانات البطاقة
 * يدعم جميع طرق الدفع الأوروبية والعالمية
 */
export async function createTicketCheckoutSession({
  orderId,
  amount,
  currency = "usd",
  customerEmail,
  customerName,
  eventTitle,
  ticketCount,
  origin,
}: {
  orderId: number;
  amount: number; // بالسنت (مثلاً 5000 = 50 دولار)
  currency?: string;
  customerEmail?: string;
  customerName?: string;
  eventTitle: string;
  ticketCount: number;
  origin: string;
}) {
  const stripeClient = getStripe();

  const paymentMethods = getPaymentMethods(currency.toLowerCase());

  const session = await stripeClient.checkout.sessions.create({
    payment_method_types: paymentMethods as any[],
    mode: "payment",
    customer_email: customerEmail,
    allow_promotion_codes: true,
    // إعداد 3D Secure - يطلب فقط عند الضرورة القصوى
    payment_method_options: {
      card: {
        request_three_d_secure: "any",
      },
    },
    line_items: [
      {
        price_data: {
          currency,
          product_data: {
            name: `تذاكر: ${eventTitle}`,
            description: `${ticketCount} تذكرة`,
          },
          unit_amount: amount,
        },
        quantity: 1,
      },
    ],
    metadata: {
      order_id: orderId.toString(),
      customer_email: customerEmail ?? "",
      customer_name: customerName ?? "",
    },
    client_reference_id: orderId.toString(),
    success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
    cancel_url: `${origin}/checkout?order_id=${orderId}&cancelled=true`,
  });

  return session;
}
