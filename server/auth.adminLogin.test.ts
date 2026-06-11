import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import { COOKIE_NAME } from "../shared/const";
import type { TrpcContext } from "./_core/context";

// Mock ENV to provide a test admin password
vi.mock("./_core/env", () => ({
  ENV: {
    adminPassword: "test-admin-secret-123",
    ownerOpenId: "owner-open-id-test",
    appId: "test-app-id",
    cookieSecret: "test-cookie-secret",
    databaseUrl: "",
    oAuthServerUrl: "",
    isProduction: false,
    forgeApiUrl: "",
    forgeApiKey: "",
    stripeSecretKey: "",
    stripeWebhookSecret: "",
  },
}));

// Mock db functions
vi.mock("./db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./db")>();
  return {
    ...actual,
    upsertUser: vi.fn().mockResolvedValue(undefined),
    getUserByOpenId: vi.fn().mockResolvedValue({
      id: 1,
      openId: "owner-open-id-test",
      name: "Admin",
      email: null,
      role: "admin",
      loginMethod: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    }),
    updateUserRole: vi.fn().mockResolvedValue(undefined),
  };
});

// Mock sdk
vi.mock("./_core/sdk", () => ({
  sdk: {
    createSessionToken: vi.fn().mockResolvedValue("mock-jwt-token"),
  },
}));

function createPublicContext() {
  const setCookies: Array<{ name: string; value: string; options: Record<string, unknown> }> = [];
  const ctx: TrpcContext = {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      cookie: (name: string, value: string, options: Record<string, unknown>) => {
        setCookies.push({ name, value, options });
      },
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
  return { ctx, setCookies };
}

describe("auth.adminLogin", () => {
  it("returns success and sets session cookie with correct password", async () => {
    const { ctx, setCookies } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.adminLogin({ password: "test-admin-secret-123" });
    expect(result).toEqual({ success: true });
    expect(setCookies).toHaveLength(1);
    expect(setCookies[0]?.name).toBe(COOKIE_NAME);
    expect(setCookies[0]?.value).toBe("mock-jwt-token");
  });

  it("throws UNAUTHORIZED with wrong password", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.auth.adminLogin({ password: "wrong-password" })
    ).rejects.toThrow("كلمة المرور غير صحيحة");
  });
});
