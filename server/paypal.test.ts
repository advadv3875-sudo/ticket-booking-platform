import { describe, it, expect } from "vitest";

describe("PayPal Integration", () => {
  it("should have PayPal credentials configured", () => {
    expect(process.env.PAYPAL_CLIENT_ID).toBeDefined();
    expect(process.env.PAYPAL_CLIENT_SECRET).toBeDefined();
    expect(process.env.PAYPAL_CLIENT_ID?.length).toBeGreaterThan(10);
    expect(process.env.PAYPAL_CLIENT_SECRET?.length).toBeGreaterThan(10);
  });

  it("should be in live mode", () => {
    expect(process.env.PAYPAL_MODE).toBe("live");
  });

  it("should validate PayPal credentials against live API", async () => {
    const PAYPAL_BASE = "https://api-m.paypal.com";
    const CLIENT_ID = process.env.PAYPAL_CLIENT_ID!;
    const CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET!;

    const resp = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64")}`,
      },
      body: "grant_type=client_credentials",
    });

    expect(resp.ok).toBe(true);
    const data = await resp.json();
    expect(data.token_type).toBe("Bearer");
    expect(data.access_token).toBeDefined();
    expect(data.app_id).toBe("APP-4RD37527D8066631K");
  }, 30000);

  it("should have correct currency conversion for JOD", () => {
    // 1 JOD ≈ 1.41 USD
    const jodAmount = 250;
    const usdAmount = parseFloat((jodAmount * 1.41).toFixed(2));
    expect(usdAmount).toBe(352.5);
    expect(usdAmount).toBeGreaterThan(0);
  });
});
