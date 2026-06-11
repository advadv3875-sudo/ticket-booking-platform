/**
 * HyperPay Payment Gateway Integration
 * Expert Plan by MUSTAFA AL JAZAEERI
 */

const IS_TEST = process.env.NODE_ENV !== "production";
const HYPERPAY_BASE = process.env.HYPERPAY_API_URL ?? "https://eu-test.oppwa.com";
const ACCESS_TOKEN = process.env.HYPERPAY_ACCESS_TOKEN ?? "OGFjN2E0ZGE5ZTk3ZmFlYTAxOWVhMTQyNGVmYTBhOTB8RTZjYUV1R2cjRCFTWm5LYk1jTHI=";
const ENTITY_ID = process.env.HYPERPAY_ENTITY_ID ?? "8ac7a4c89e97fa77019ea1432dc50565";

export type HyperPayBrand = "VISA" | "MASTER" | "MADA" | "AMEX";

export async function createHyperPayCheckout({ amount, currency = "SAR", orderId, customer = {} }: {
  amount: number; currency?: string; orderId: number;
  customer?: { email?: string; givenName?: string; surname?: string; street1?: string; city?: string; state?: string; country?: string; postcode?: string; };
}): Promise<{ checkoutId: string }> {
  const params = new URLSearchParams({
    entityId: ENTITY_ID, amount: amount.toFixed(2), currency,
    paymentType: "DB", merchantTransactionId: `ORDER-${orderId}-${Date.now()}`, integrity: "true",
  });
  if (IS_TEST) { params.append("testMode", "EXTERNAL"); params.append("customParameters[3DS2_enrolled]", "true"); params.append("customParameters[3DS2_flow]", "challenge"); }
  if (customer.email) params.append("customer.email", customer.email);
  if (customer.givenName) params.append("customer.givenName", customer.givenName);
  if (customer.surname) params.append("customer.surname", customer.surname);
  if (customer.street1) params.append("billing.street1", customer.street1);
  if (customer.city) params.append("billing.city", customer.city);
  if (customer.state) params.append("billing.state", customer.state);
  if (customer.country) params.append("billing.country", customer.country);
  if (customer.postcode) params.append("billing.postcode", customer.postcode);
  const response = await fetch(`${HYPERPAY_BASE}/v1/checkouts`, {
    method: "POST", headers: { Authorization: `Bearer ${ACCESS_TOKEN}`, "Content-Type": "application/x-www-form-urlencoded" }, body: params.toString(),
  });
  const data = await response.json();
  if (!response.ok || !data.id) throw new Error(`HyperPay: ${data?.result?.description ?? JSON.stringify(data)}`);
  return { checkoutId: data.id };
}

export async function verifyHyperPayPayment(resourcePath: string): Promise<{ success: boolean; transactionId: string; resultCode: string; resultDescription: string }> {
  const response = await fetch(`${HYPERPAY_BASE}${resourcePath}?entityId=${ENTITY_ID}`, { headers: { Authorization: `Bearer ${ACCESS_TOKEN}` } });
  const data = await response.json();
  const resultCode: string = data.result?.code ?? "";
  const isSuccess = /^(000\.000\.|000\.100\.1|000\.[36])/.test(resultCode) || /^(000\.400\.0[^3]|000\.400\.100)/.test(resultCode);
  return { success: isSuccess, transactionId: data.id ?? "", resultCode, resultDescription: data.result?.description ?? "" };
}
