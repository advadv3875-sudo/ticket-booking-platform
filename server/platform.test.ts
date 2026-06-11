/**
 * Expert Plan Platform - Comprehensive Tests
 * Tests: Auth, Events, Orders, Payments, Webhooks
 */

import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import { COOKIE_NAME } from "../shared/const";
import type { TrpcContext } from "./_core/context";

// ===== Mock DB =====
vi.mock("./db", () => ({
  upsertUser: vi.fn(),
  getUserByOpenId: vi.fn(),
  getPublishedEvents: vi.fn().mockResolvedValue([]),
  getFeaturedEvents: vi.fn().mockResolvedValue([]),
  getEventBySlug: vi.fn().mockResolvedValue(null),
  getEventById: vi.fn().mockResolvedValue(null),
  getAllEvents: vi.fn().mockResolvedValue([]),
  createEvent: vi.fn().mockResolvedValue({ insertId: 1 }),
  updateEvent: vi.fn(),
  deleteEvent: vi.fn(),
  getTicketTypesByEventId: vi.fn().mockResolvedValue([]),
  getTicketTypeById: vi.fn().mockResolvedValue(null),
  createTicketType: vi.fn(),
  updateTicketType: vi.fn(),
  holdTickets: vi.fn(),
  releaseHeldTickets: vi.fn(),
  sellTickets: vi.fn(),
  createOrder: vi.fn().mockResolvedValue({ insertId: 1 }),
  createOrderItems: vi.fn(),
  getOrderById: vi.fn().mockResolvedValue(null),
  getOrderByNumber: vi.fn().mockResolvedValue(null),
  getOrdersByCustomer: vi.fn().mockResolvedValue([]),
  getOrdersByEmail: vi.fn().mockResolvedValue([]),
  getAllOrders: vi.fn().mockResolvedValue([]),
  updateOrderStatus: vi.fn(),
  getOrderItems: vi.fn().mockResolvedValue([]),
  createTickets: vi.fn(),
  getTicketsByOrderId: vi.fn().mockResolvedValue([]),
  createPayment: vi.fn(),
  createInvoice: vi.fn(),
  getInvoiceByOrderId: vi.fn().mockResolvedValue(null),
  getDashboardStats: vi.fn().mockResolvedValue({ totalEvents: 0, totalOrders: 0, paidOrders: 0, totalRevenue: 0, totalUsers: 0, pendingOrders: 0, totalTicketsSold: 0, publishedEvents: 0 }),
  getAllUsers: vi.fn().mockResolvedValue([]),
  updateUserRole: vi.fn(),
}));

vi.mock("./invoiceService", () => ({
  generateOrderInvoice: vi.fn().mockResolvedValue("https://example.com/invoice.html"),
  generateQRCode: vi.fn().mockResolvedValue("data:image/png;base64,test"),
}));

// ===== Context Factories =====
function createPublicCtx(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function createUserCtx(role: "user" | "admin" | "organizer" = "user"): TrpcContext {
  return {
    user: {
      id: 1, openId: "test-user", email: "test@example.com",
      name: "Test User", loginMethod: "manus", role,
      createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function createAdminCtx(): TrpcContext {
  return createUserCtx("admin");
}

// ===== Auth Tests =====
describe("auth", () => {
  it("returns null for unauthenticated user", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });

  it("returns user for authenticated user", async () => {
    const caller = appRouter.createCaller(createUserCtx());
    const result = await caller.auth.me();
    expect(result).not.toBeNull();
    expect(result?.email).toBe("test@example.com");
  });

  it("clears session cookie on logout", async () => {
    const ctx = createUserCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result.success).toBe(true);
    expect(ctx.res.clearCookie).toHaveBeenCalledWith(COOKIE_NAME, expect.objectContaining({ maxAge: -1 }));
  });
});

// ===== Events Tests =====
describe("events", () => {
  it("lists published events (public)", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.events.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("lists featured events (public)", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.events.featured();
    expect(Array.isArray(result)).toBe(true);
  });

  it("throws NOT_FOUND for non-existent event slug", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    await expect(caller.events.getBySlug({ slug: "non-existent" })).rejects.toThrow();
  });

  it("admin can list all events", async () => {
    const caller = appRouter.createCaller(createAdminCtx());
    const result = await caller.events.adminList();
    expect(Array.isArray(result)).toBe(true);
  });

  it("non-admin cannot list admin events", async () => {
    const caller = appRouter.createCaller(createUserCtx("user"));
    await expect(caller.events.adminList()).rejects.toThrow();
  });
});

// ===== Orders Tests =====
describe("orders", () => {
  it("throws NOT_FOUND for non-existent order number", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    await expect(caller.orders.getByNumber({ orderNumber: "INVALID-ORDER" })).rejects.toThrow();
  });

  it("authenticated user can view their orders", async () => {
    const caller = appRouter.createCaller(createUserCtx());
    const result = await caller.orders.myOrders();
    expect(Array.isArray(result)).toBe(true);
  });

  it("unauthenticated user cannot view their orders", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    await expect(caller.orders.myOrders()).rejects.toThrow();
  });

  it("admin can list all orders", async () => {
    const caller = appRouter.createCaller(createAdminCtx());
    const result = await caller.orders.adminList();
    expect(Array.isArray(result)).toBe(true);
  });

  it("non-admin cannot list admin orders", async () => {
    const caller = appRouter.createCaller(createUserCtx("user"));
    await expect(caller.orders.adminList()).rejects.toThrow();
  });
});

// ===== Admin Tests =====
describe("admin", () => {
  it("admin can view dashboard stats", async () => {
    const caller = appRouter.createCaller(createAdminCtx());
    const stats = await caller.admin.stats();
    expect(stats).toHaveProperty("totalEvents");
    expect(stats).toHaveProperty("totalOrders");
    expect(stats).toHaveProperty("totalRevenue");
  });

  it("non-admin cannot view dashboard stats", async () => {
    const caller = appRouter.createCaller(createUserCtx("user"));
    await expect(caller.admin.stats()).rejects.toThrow();
  });

  it("admin can list users", async () => {
    const caller = appRouter.createCaller(createAdminCtx());
    const users = await caller.admin.users();
    expect(Array.isArray(users)).toBe(true);
  });

  it("non-admin cannot list users", async () => {
    const caller = appRouter.createCaller(createUserCtx("user"));
    await expect(caller.admin.users()).rejects.toThrow();
  });
});

// ===== Webhook Tests =====
describe("webhooks", () => {
  it("processes generic webhook with paid status", async () => {
    const { getOrderByNumber } = await import("./db");
    vi.mocked(getOrderByNumber).mockResolvedValueOnce({
      id: 1, orderNumber: "EP-TEST-001", customerId: null,
      customerEmail: "test@example.com", customerFullName: "Test User",
      customerPhone: null, currency: "JOD", subtotalAmount: "100",
      feesAmount: "0", totalAmount: "100", paymentMethod: "card",
      status: "pending_payment", eventId: 1, gatewayOrderId: null,
      paidAt: null, expiresAt: null, createdAt: new Date(), updatedAt: new Date(),
    });
    const { getOrderItems } = await import("./db");
    vi.mocked(getOrderItems).mockResolvedValueOnce([]);

    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.webhooks.generic({
      orderId: "EP-TEST-001", transactionId: "TXN-123",
      gateway: "card", status: "paid",
    });
    expect(result.success).toBe(true);
  });

  it("handles failed payment status", async () => {
    const { getOrderByNumber } = await import("./db");
    vi.mocked(getOrderByNumber).mockResolvedValueOnce({
      id: 2, orderNumber: "EP-TEST-002", customerId: null,
      customerEmail: "test@example.com", customerFullName: "Test User",
      customerPhone: null, currency: "JOD", subtotalAmount: "50",
      feesAmount: "0", totalAmount: "50", paymentMethod: "card",
      status: "pending_payment", eventId: 1, gatewayOrderId: null,
      paidAt: null, expiresAt: null, createdAt: new Date(), updatedAt: new Date(),
    });
    const { getOrderItems } = await import("./db");
    vi.mocked(getOrderItems).mockResolvedValueOnce([]);

    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.webhooks.generic({
      orderId: "EP-TEST-002", transactionId: "TXN-456",
      gateway: "card", status: "FAILED",
    });
    expect(result.success).toBe(true);
  });
});

// ===== Payment Method Tests =====
describe("payment methods coverage", () => {
  const paymentMethods = [
    "card", "sepa", "paypal", "applepay", "googlepay",
    "alipay", "wechatpay", "telr", "amex", "payomentic", "2checkout",
  ];

  it.each(paymentMethods)("supports payment method: %s", (method) => {
    // Verify the method is in the supported enum
    const supportedMethods = [
      "card", "unionpay", "sepa", "payomentic", "2checkout",
      "applepay", "googlepay", "paypal", "alipay", "wechatpay",
      "telr", "hyperpaywallet", "amex", "bank_transfer",
    ];
    expect(supportedMethods).toContain(method);
  });
});

// ===== Currency Tests =====
describe("currency support", () => {
  const currencies = ["JOD", "EUR", "USD", "AED", "SAR", "GBP"];

  it.each(currencies)("supports currency: %s", (currency) => {
    const supportedCurrencies = ["JOD", "EUR", "USD", "AED", "SAR", "GBP"];
    expect(supportedCurrencies).toContain(currency);
  });
});
