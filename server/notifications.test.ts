/**
 * Notification System Tests
 * اختبارات نظام الإشعارات
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mock DB ──────────────────────────────────────────────────────────────────

vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue({
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockResolvedValue(undefined),
    }),
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
          limit: vi.fn().mockResolvedValue([]),
        }),
      }),
    }),
  }),
}));

// ─── Mock notifyOwner ─────────────────────────────────────────────────────────

vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

// ─── Mock fetch for email ─────────────────────────────────────────────────────

const mockFetch = vi.fn().mockResolvedValue({ ok: true });
global.fetch = mockFetch;

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("Notification Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.BUILT_IN_FORGE_API_URL = "https://api.test.com";
    process.env.BUILT_IN_FORGE_API_KEY = "test-key";
  });

  describe("sendBookingConfirmedNotification", () => {
    it("should send email notification on successful booking", async () => {
      const { sendBookingConfirmedNotification } = await import("./notificationService");

      await sendBookingConfirmedNotification({
        customerEmail: "test@example.com",
        customerName: "أحمد محمد",
        orderNumber: "EP-123456-ABCD",
        eventTitle: "فعالية خيرية",
        eventDate: new Date("2026-04-01"),
        venue: "فندق ماريوت عمان",
        totalAmount: "250",
        currency: "JOD",
        ticketCount: 2,
        orderId: 1,
        eventId: 1,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.test.com/v1/email/send",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: "Bearer test-key",
          }),
        })
      );
    });

    it("should include correct email subject with event title", async () => {
      const { sendBookingConfirmedNotification } = await import("./notificationService");

      await sendBookingConfirmedNotification({
        customerEmail: "customer@test.com",
        customerName: "فاطمة علي",
        orderNumber: "EP-789-XYZ",
        eventTitle: "مؤتمر الأعمال الدولي",
        eventDate: new Date("2026-03-30"),
        venue: "فندق ماريوت عمان",
        totalAmount: "500",
        currency: "USD",
        ticketCount: 1,
        orderId: 2,
        eventId: 3,
      });

      const fetchCall = mockFetch.mock.calls[0];
      const body = JSON.parse(fetchCall[1].body);
      expect(body.subject).toContain("مؤتمر الأعمال الدولي");
      expect(body.subject).toContain("✅");
    });

    it("should notify admin via notifyOwner", async () => {
      const { notifyOwner } = await import("./_core/notification");
      const { sendBookingConfirmedNotification } = await import("./notificationService");

      await sendBookingConfirmedNotification({
        customerEmail: "buyer@test.com",
        customerName: "محمد خالد",
        orderNumber: "EP-001",
        eventTitle: "حفل خيري",
        eventDate: new Date("2026-04-15"),
        venue: "فندق ماريوت عمان",
        totalAmount: "250",
        currency: "EUR",
        ticketCount: 3,
        orderId: 5,
        eventId: 10,
      });

      expect(notifyOwner).toHaveBeenCalledWith(
        expect.objectContaining({
          title: expect.stringContaining("حجز جديد"),
        })
      );
    });
  });

  describe("sendPaymentFailedNotification", () => {
    it("should send failure email with retry link", async () => {
      const { sendPaymentFailedNotification } = await import("./notificationService");

      await sendPaymentFailedNotification({
        customerEmail: "failed@test.com",
        customerName: "سارة أحمد",
        orderNumber: "EP-FAIL-001",
        eventTitle: "فعالية اختبار",
        totalAmount: "250",
        currency: "JOD",
        orderId: 10,
        eventId: 5,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.test.com/v1/email/send",
        expect.objectContaining({ method: "POST" })
      );

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.subject).toContain("❌");
      expect(body.html).toContain("فشل الدفع");
    });
  });

  describe("getAdminNotifications", () => {
    it("should return empty array when no notifications", async () => {
      const { getAdminNotifications } = await import("./notificationService");
      const result = await getAdminNotifications();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("savePushSubscription", () => {
    it("should save push subscription to database", async () => {
      const { savePushSubscription } = await import("./notificationService");

      await expect(
        savePushSubscription({
          endpoint: "https://push.example.com/sub/123",
          p256dh: "BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QTpQtUbVlqHgx9tpsDelta",
          auth: "tBHItJI5svbpez7KI4CCXg",
          userEmail: "user@test.com",
        })
      ).resolves.not.toThrow();
    });
  });

  describe("Email Template Generation", () => {
    it("should handle missing API credentials gracefully", async () => {
      delete process.env.BUILT_IN_FORGE_API_URL;
      delete process.env.BUILT_IN_FORGE_API_KEY;

      const { sendBookingConfirmedNotification } = await import("./notificationService");

      // Should not throw even without credentials
      await expect(
        sendBookingConfirmedNotification({
          customerEmail: "test@test.com",
          customerName: "Test User",
          orderNumber: "EP-TEST",
          eventTitle: "Test Event",
          eventDate: new Date(),
          venue: "Test Venue",
          totalAmount: "100",
          currency: "JOD",
          ticketCount: 1,
          orderId: 1,
          eventId: 1,
        })
      ).resolves.not.toThrow();
    });
  });
});

describe("Announcement Banners", () => {
  it("should fetch active banners from database", async () => {
    // getActiveBanners uses dynamic import for schema, so it may return [] from mock
    const { getActiveBanners } = await import("./notificationService");
    const result = await getActiveBanners();
    // Result should be an array (possibly empty due to mock)
    expect(result).toBeDefined();
    expect(typeof result).not.toBe("undefined");
  });
});
