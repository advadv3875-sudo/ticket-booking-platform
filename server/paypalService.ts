/**
 * PayPal Orders API v2 - Live Integration
 * Expert Plan by MUSTAFA AL JAZAEERI
 * No 3D Secure required - PayPal handles authentication internally
 */

const PAYPAL_BASE = process.env.PAYPAL_MODE === "live"
  ? "https://api-m.paypal.com"
  : "https://api-m.sandbox.paypal.com";

const CLIENT_ID = process.env.PAYPAL_CLIENT_ID!;
const CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET!;

// Cache access token
let _accessToken: string | null = null;
let _tokenExpiry = 0;

async function getAccessToken(): Promise<string> {
  if (_accessToken && Date.now() < _tokenExpiry) return _accessToken;

  const resp = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`PayPal auth failed: ${err}`);
  }

  const data = await resp.json();
  _accessToken = data.access_token;
  _tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
  return _accessToken!;
}

async function paypalRequest(method: string, path: string, body?: unknown) {
  const token = await getAccessToken();
  const resp = await fetch(`${PAYPAL_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "PayPal-Request-Id": `EP-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const text = await resp.text();
  let data: unknown;
  try { data = JSON.parse(text); } catch { data = text; }

  if (!resp.ok) throw new Error(`PayPal API error ${resp.status}: ${JSON.stringify(data)}`);
  return data as Record<string, unknown>;
}

/**
 * Create a PayPal order - returns approval URL for redirect
 * No 3DS required - PayPal handles auth internally
 */
export async function createPayPalOrder(params: {
  orderNumber: string;
  amount: number;
  currency: string;
  description: string;
  returnUrl: string;
  cancelUrl: string;
}) {
  // Convert JOD to USD for PayPal (PayPal doesn't support JOD directly)
  const { paypalAmount, paypalCurrency } = convertCurrency(params.amount, params.currency);

  const order = await paypalRequest("POST", "/v2/checkout/orders", {
    intent: "CAPTURE",
    purchase_units: [
      {
        reference_id: params.orderNumber,
        description: params.description,
        amount: {
          currency_code: paypalCurrency,
          value: paypalAmount.toFixed(2),
        },
        custom_id: params.orderNumber,
      },
    ],
    payment_source: {
      paypal: {
        experience_context: {
          payment_method_preference: "IMMEDIATE_PAYMENT_REQUIRED",
          brand_name: "Expert Plan by MUSTAFA ALJAZAEERI",
          locale: "ar-JO",
          landing_page: "LOGIN",
          shipping_preference: "NO_SHIPPING",
          user_action: "PAY_NOW",
          return_url: params.returnUrl,
          cancel_url: params.cancelUrl,
        },
      },
    },
  });

  const approveLink = (order.links as Array<{ rel: string; href: string }>)
    ?.find((l) => l.rel === "payer-action")?.href;

  return {
    paypalOrderId: order.id as string,
    approveUrl: approveLink ?? "",
    status: order.status as string,
    originalAmount: params.amount,
    originalCurrency: params.currency,
    paypalAmount,
    paypalCurrency,
  };
}

/**
 * Capture a PayPal order after customer approval
 * This is when money moves to your PayPal account
 */
export async function capturePayPalOrder(paypalOrderId: string) {
  const result = await paypalRequest("POST", `/v2/checkout/orders/${paypalOrderId}/capture`);

  const capture = (result.purchase_units as Array<{
    payments: { captures: Array<{ id: string; status: string; amount: { value: string; currency_code: string } }> };
    reference_id: string;
  }>)?.[0];

  const captureDetails = capture?.payments?.captures?.[0];
  const orderNumber = capture?.reference_id;

  return {
    paypalOrderId: result.id as string,
    captureId: captureDetails?.id ?? "",
    status: captureDetails?.status ?? result.status as string,
    orderNumber: orderNumber ?? "",
    amount: captureDetails?.amount?.value ?? "0",
    currency: captureDetails?.amount?.currency_code ?? "USD",
    success: captureDetails?.status === "COMPLETED",
  };
}

/**
 * Get PayPal order details
 */
export async function getPayPalOrder(paypalOrderId: string) {
  return paypalRequest("GET", `/v2/checkout/orders/${paypalOrderId}`);
}

/**
 * Verify PayPal webhook signature
 */
export async function verifyPayPalWebhook(headers: Record<string, string>, body: string, webhookId: string) {
  try {
    const result = await paypalRequest("POST", "/v1/notifications/verify-webhook-signature", {
      auth_algo: headers["paypal-auth-algo"],
      cert_url: headers["paypal-cert-url"],
      transmission_id: headers["paypal-transmission-id"],
      transmission_sig: headers["paypal-transmission-sig"],
      transmission_time: headers["paypal-transmission-time"],
      webhook_id: webhookId,
      webhook_event: JSON.parse(body),
    });
    return (result as { verification_status: string }).verification_status === "SUCCESS";
  } catch {
    return false;
  }
}

/**
 * Currency conversion for PayPal
 * PayPal supports: USD, EUR, GBP, AED, SAR (not JOD)
 */
function convertCurrency(amount: number, currency: string): { paypalAmount: number; paypalCurrency: string } {
  const rates: Record<string, { rate: number; target: string }> = {
    JOD: { rate: 1.41, target: "USD" },  // 1 JOD ≈ 1.41 USD
    USD: { rate: 1, target: "USD" },
    EUR: { rate: 1, target: "EUR" },
    GBP: { rate: 1, target: "GBP" },
    AED: { rate: 1, target: "AED" },
    SAR: { rate: 1, target: "SAR" },
  };

  const conv = rates[currency];
  if (!conv) return { paypalAmount: amount, paypalCurrency: "USD" };
  return { paypalAmount: parseFloat((amount * conv.rate).toFixed(2)), paypalCurrency: conv.target };
}

/**
 * Test PayPal credentials - returns true if valid
 */
export async function testPayPalCredentials(): Promise<{ valid: boolean; mode: string; error?: string }> {
  try {
    await getAccessToken();
    return { valid: true, mode: process.env.PAYPAL_MODE ?? "sandbox" };
  } catch (e) {
    return { valid: false, mode: process.env.PAYPAL_MODE ?? "sandbox", error: String(e) };
  }
}
