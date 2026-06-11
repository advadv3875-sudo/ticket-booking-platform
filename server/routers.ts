import { TRPCError } from "@trpc/server";
import { generateOrderInvoice } from "./invoiceService";
import { createPayPalOrder, capturePayPalOrder, testPayPalCredentials } from "./paypalService";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { flowersRouter } from "./routers/flowers";
import { rentalsRouter } from "./routers/rentals";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { ENV } from "./_core/env";
import { sdk } from "./_core/sdk";
import {
  getAllEvents, getPublishedEvents, getFeaturedEvents,
  getEventById, getEventBySlug, createEvent, updateEvent, deleteEvent,
  getTicketTypesByEventId, getTicketTypeById, createTicketType, updateTicketType,
  holdTickets, releaseHeldTickets, sellTickets,
  createOrder, createOrderItems, getOrderById, getOrderByNumber,
  getOrdersByCustomer, getOrdersByEmail, getAllOrders, updateOrderStatus, getOrderItems,
  createTickets, getTicketsByOrderId,
  createPayment,
  createInvoice, getInvoiceByOrderId,
  getDashboardStats, getAllUsers, updateUserRole,
  getDailyRevenue, getPaymentsByGateway, getTopEvents, getPaymentAnalyticsKPIs,
} from "./db";
import { nanoid } from "nanoid";

function generateOrderNumber(): string {
  return `EP-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
}

function generateTicketNumber(): string {
  return `TK-${nanoid(10).toUpperCase()}`;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '') + '-' + nanoid(6);
}

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  return next({ ctx });
});

const organizerProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin' && ctx.user.role !== 'organizer') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Organizer access required' });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
    adminLogin: publicProcedure
      .input(z.object({ password: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const adminPassword = ENV.adminPassword;
        if (!adminPassword || input.password !== adminPassword) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'كلمة المرور غير صحيحة' });
        }
        // Create a session for the owner using their openId
        const ownerOpenId = ENV.ownerOpenId;
        if (!ownerOpenId) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'لم يتم تكوين حساب المسؤول' });
        // Ensure owner exists in DB with admin role
        const { upsertUser, getUserByOpenId, updateUserRole } = await import('./db');
        await upsertUser({ openId: ownerOpenId, name: 'Admin', email: null, loginMethod: 'admin', lastSignedIn: new Date() });
        const owner = await getUserByOpenId(ownerOpenId);
        if (owner && owner.role !== 'admin') {
          await updateUserRole(owner.id, 'admin');
        }
        // Sign a JWT session
        const token = await sdk.createSessionToken(ownerOpenId, { name: 'Admin' });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, token, cookieOptions);
        return { success: true };
      }),
  }),

  events: router({
    list: publicProcedure
      .input(z.object({
        category: z.string().optional(),
        search: z.string().optional(),
        limit: z.number().optional(),
        offset: z.number().optional(),
      }).optional())
      .query(async ({ input }) => getPublishedEvents(input)),

    featured: publicProcedure.query(async () => getFeaturedEvents()),

    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const event = await getEventBySlug(input.slug);
        if (!event) throw new TRPCError({ code: 'NOT_FOUND' });
        return event;
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const event = await getEventById(input.id);
        if (!event) throw new TRPCError({ code: 'NOT_FOUND' });
        return event;
      }),

    getTicketTypes: publicProcedure
      .input(z.object({ eventId: z.number() }))
      .query(async ({ input }) => getTicketTypesByEventId(input.eventId)),

    adminList: organizerProcedure.query(async () => getAllEvents()),

    create: organizerProcedure
      .input(z.object({
        title: z.string().min(3),
        titleAr: z.string().optional(),
        description: z.string().optional(),
        descriptionAr: z.string().optional(),
        category: z.enum(["conference", "exhibition", "wedding", "concert", "corporate", "cultural", "sports", "other"]),
        venue: z.string().optional(),
        venueAr: z.string().optional(),
        city: z.string().optional(),
        country: z.string().optional(),
        startDate: z.number(),
        endDate: z.number(),
        currency: z.enum(["JOD", "EUR", "USD", "AED", "SAR", "GBP"]),
        coverImage: z.string().optional(),
        galleryImages: z.array(z.string()).optional(),
        isFeatured: z.boolean().optional(),
        status: z.enum(["draft", "published"]).optional(),
        ticketTypes: z.array(z.object({
          name: z.string(),
          nameAr: z.string().optional(),
          description: z.string().optional(),
          price: z.number(),
          totalQuantity: z.number(),
          maxPerOrder: z.number().optional(),
        })).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const slug = slugify(input.title);
        await createEvent({
          organizerId: ctx.user.id,
          title: input.title, titleAr: input.titleAr, slug,
          description: input.description, descriptionAr: input.descriptionAr,
          category: input.category, venue: input.venue, venueAr: input.venueAr,
          city: input.city ?? "Amman", country: input.country ?? "Jordan",
          startDate: new Date(input.startDate), endDate: new Date(input.endDate),
          currency: input.currency, coverImage: input.coverImage,
          galleryImages: input.galleryImages,
          isFeatured: input.isFeatured ?? false, status: input.status ?? "draft",
          totalCapacity: input.ticketTypes?.reduce((a, t) => a + t.totalQuantity, 0) ?? 0,
        });
        const event = await getEventBySlug(slug);
        if (!event) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        if (input.ticketTypes?.length) {
          for (let i = 0; i < input.ticketTypes.length; i++) {
            const tt = input.ticketTypes[i];
            await createTicketType({
              eventId: event.id, name: tt.name, nameAr: tt.nameAr,
              description: tt.description, price: String(tt.price),
              currency: input.currency, totalQuantity: tt.totalQuantity,
              maxPerOrder: tt.maxPerOrder ?? 10, sortOrder: i,
            });
          }
        }
        return { success: true, eventId: event.id, slug };
      }),

    update: organizerProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(), titleAr: z.string().optional(),
        description: z.string().optional(), descriptionAr: z.string().optional(),
        category: z.enum(["conference", "exhibition", "wedding", "concert", "corporate", "cultural", "sports", "other"]).optional(),
        venue: z.string().optional(), venueAr: z.string().optional(),
        city: z.string().optional(), startDate: z.number().optional(), endDate: z.number().optional(),
        currency: z.enum(["JOD", "EUR", "USD", "AED", "SAR", "GBP"]).optional(),
        coverImage: z.string().optional(), isFeatured: z.boolean().optional(),
        status: z.enum(["draft", "published", "cancelled", "completed"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, startDate, endDate, ...rest } = input;
        await updateEvent(id, {
          ...rest,
          ...(startDate ? { startDate: new Date(startDate) } : {}),
          ...(endDate ? { endDate: new Date(endDate) } : {}),
        });
        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => { await deleteEvent(input.id); return { success: true }; }),

    addTicketType: organizerProcedure
      .input(z.object({
        eventId: z.number(), name: z.string(), nameAr: z.string().optional(),
        description: z.string().optional(), price: z.number(),
        currency: z.enum(["JOD", "EUR", "USD", "AED", "SAR", "GBP"]),
        totalQuantity: z.number(), maxPerOrder: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        await createTicketType({ ...input, price: String(input.price) });
        return { success: true };
      }),

    updateTicketType: organizerProcedure
      .input(z.object({
        id: z.number(), name: z.string().optional(), nameAr: z.string().optional(),
        price: z.number().optional(), totalQuantity: z.number().optional(), isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, price, ...rest } = input;
        await updateTicketType(id, { ...rest, ...(price !== undefined ? { price: String(price) } : {}) });
        return { success: true };
      }),
  }),

  orders: router({
    create: publicProcedure
      .input(z.object({
        eventId: z.number(),
        customerEmail: z.string().email(),
        customerFullName: z.string().min(2),
        customerPhone: z.string().optional(),
        currency: z.enum(["JOD", "EUR", "USD", "AED", "SAR", "GBP"]),
        paymentMethod: z.enum([
          "card", "unionpay", "sepa", "payomentic", "2checkout",
          "applepay", "googlepay", "paypal", "alipay", "wechatpay",
          "telr", "hyperpaywallet", "amex", "bank_transfer"
        ]),
        items: z.array(z.object({ ticketTypeId: z.number(), quantity: z.number().min(1).max(20) })),
      }))
      .mutation(async ({ input, ctx }) => {
        let subtotal = 0;
        const validatedItems: Array<{ ticketTypeId: number; quantity: number; unitPrice: number }> = [];
        for (const item of input.items) {
          const tt = await getTicketTypeById(item.ticketTypeId);
          if (!tt) throw new TRPCError({ code: 'NOT_FOUND', message: `Ticket type not found` });
          if (!tt.isActive) throw new TRPCError({ code: 'BAD_REQUEST', message: `Ticket type not available` });
          const available = tt.totalQuantity - tt.soldQuantity - tt.heldQuantity;
          if (available < item.quantity) throw new TRPCError({ code: 'BAD_REQUEST', message: `Only ${available} tickets available` });
          const unitPrice = parseFloat(String(tt.price));
          subtotal += unitPrice * item.quantity;
          validatedItems.push({ ticketTypeId: item.ticketTypeId, quantity: item.quantity, unitPrice });
        }
        const isSepa = input.paymentMethod === "sepa";
        const orderNumber = generateOrderNumber();
        const expiresAt = new Date(Date.now() + (isSepa ? 48 * 60 * 60 * 1000 : 30 * 60 * 1000));
        await createOrder({
          orderNumber, customerId: ctx.user?.id,
          customerEmail: input.customerEmail, customerFullName: input.customerFullName,
          customerPhone: input.customerPhone, eventId: input.eventId, currency: input.currency,
          subtotalAmount: String(subtotal), feesAmount: "0", totalAmount: String(subtotal),
          paymentMethod: input.paymentMethod, status: "pending_payment", expiresAt,
        });
        const order = await getOrderByNumber(orderNumber);
        if (!order) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        await createOrderItems(validatedItems.map(item => ({
          orderId: order.id, ticketTypeId: item.ticketTypeId, quantity: item.quantity,
          unitPrice: String(item.unitPrice), totalPrice: String(item.unitPrice * item.quantity),
        })));
        for (const item of validatedItems) await holdTickets(item.ticketTypeId, item.quantity);
        const bankInfo = isSepa ? {
          iban: process.env.BANK_GB_IBAN_1, swift: process.env.BANK_GB_SWIFT_1,
          accountName: process.env.BANK_US_ACCOUNT_NAME, bankName: process.env.BANK_GB_NAME,
          bankAddress: process.env.BANK_GB_ADDRESS, reference: orderNumber,
          note: "SEPA transfer - 48 hours settlement period",
        } : input.paymentMethod === "bank_transfer" ? {
          accountNumber: process.env.BANK_US_ACCOUNT_NUMBER, routingNumber: process.env.BANK_US_ROUTING_NUMBER,
          accountName: process.env.BANK_US_ACCOUNT_NAME, bankName: process.env.BANK_US_NAME,
          bankAddress: process.env.BANK_US_ADDRESS, reference: orderNumber,
        } : null;
        return { orderId: order.id, orderNumber, totalAmount: subtotal, currency: input.currency, paymentMethod: input.paymentMethod, expiresAt: expiresAt.getTime(), bankInfo, status: "pending_payment" };
      }),

    getByNumber: publicProcedure
      .input(z.object({ orderNumber: z.string() }))
      .query(async ({ input }) => {
        const order = await getOrderByNumber(input.orderNumber);
        if (!order) throw new TRPCError({ code: 'NOT_FOUND' });
        const items = await getOrderItems(order.id);
        const orderTickets = await getTicketsByOrderId(order.id);
        const invoice = await getInvoiceByOrderId(order.id);
        return { order, items, tickets: orderTickets, invoice };
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const order = await getOrderById(input.id);
        if (!order) throw new TRPCError({ code: 'NOT_FOUND' });
        const items = await getOrderItems(order.id);
        const orderTickets = await getTicketsByOrderId(order.id);
        const invoice = await getInvoiceByOrderId(order.id);
        // جلب اسم الفعالية وأسماء أنواع التذاكر
        const event = await getEventById(order.eventId);
        const enrichedItems = await Promise.all(items.map(async (item) => {
          const ticketType = await getTicketTypeById(item.ticketTypeId);
          return { ...item, ticketTypeName: ticketType?.name ?? null };
        }));
        return { order: { ...order, eventTitle: event?.title ?? null }, items: enrichedItems, tickets: orderTickets, invoice };
      }),

    myOrders: protectedProcedure.query(async ({ ctx }) => getOrdersByCustomer(ctx.user.id)),

    trackByEmail: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .query(async ({ input }) => getOrdersByEmail(input.email)),

    confirmPayment: publicProcedure
      .input(z.object({ orderId: z.number(), gatewayTransactionId: z.string().optional() }))
      .mutation(async ({ input }) => {
        const order = await getOrderById(input.orderId);
        if (!order) throw new TRPCError({ code: 'NOT_FOUND' });
        if (order.status !== "pending_payment" && order.status !== "pending_settlement") {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Order not in pending state' });
        }
        const isSepa = order.paymentMethod === "sepa";
        const newStatus = isSepa ? "pending_settlement" : "paid";
        await updateOrderStatus(order.id, newStatus, { gatewayOrderId: input.gatewayTransactionId, paidAt: isSepa ? undefined : new Date() });
        await createPayment({ orderId: order.id, gatewayTransactionId: input.gatewayTransactionId ?? `DEMO-${nanoid(10)}`, gateway: order.paymentMethod, amount: order.totalAmount, currency: order.currency, status: isSepa ? "pending" : "confirmed" });
        if (!isSepa) {
          const items = await getOrderItems(order.id);
          for (const item of items) {
            await sellTickets(item.ticketTypeId, item.quantity);
            await createTickets(Array.from({ length: item.quantity }, () => ({
              ticketNumber: generateTicketNumber(), orderId: order.id, orderItemId: item.id,
              ticketTypeId: item.ticketTypeId, eventId: order.eventId,
              holderName: order.customerFullName, holderEmail: order.customerEmail,
              qrCodeData: `EP:${order.orderNumber}:${nanoid(8)}`, status: "active" as const,
            })));
          }
          await createInvoice({ orderId: order.id, invoiceNumber: `INV-${order.orderNumber}` });
          // إرسال إشعار تأكيد الحجز
          try {
            const { sendBookingConfirmedNotification } = await import('./notificationService');
            const event = await getEventById(order.eventId);
            const totalItems = items.reduce((sum: number, i: { quantity: number }) => sum + i.quantity, 0);
            await sendBookingConfirmedNotification({
              customerEmail: order.customerEmail,
              customerName: order.customerFullName,
              orderNumber: order.orderNumber,
              eventTitle: event?.titleAr ?? event?.title ?? 'فعالية',
              eventDate: event?.startDate ?? new Date(),
              venue: event?.venueAr ?? event?.venue ?? 'فندق ماريوت عمان',
              totalAmount: String(order.totalAmount),
              currency: order.currency,
              ticketCount: totalItems,
              orderId: order.id,
              eventId: order.eventId,
              paymentMethod: order.paymentMethod,
            });
          } catch (notifErr) {
            console.error('[confirmPayment] Notification error:', notifErr);
          }
        }
        return { success: true, status: newStatus };
      }),

    adminList: organizerProcedure
      .input(z.object({ limit: z.number().optional(), offset: z.number().optional() }).optional())
      .query(async ({ input }) => getAllOrders(input?.limit, input?.offset)),

    adminUpdateStatus: adminProcedure
      .input(z.object({ orderId: z.number(), status: z.enum(["pending_payment", "pending_settlement", "paid", "failed", "expired", "cancelled", "refunded"]) }))
      .mutation(async ({ input }) => { await updateOrderStatus(input.orderId, input.status); return { success: true }; }),

    generateInvoice: protectedProcedure
      .input(z.object({ orderId: z.number() }))
      .mutation(async ({ input }) => {
        const invoiceUrl = await generateOrderInvoice(input.orderId);
        if (!invoiceUrl) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to generate invoice' });
        return { success: true, invoiceUrl };
      }),
  }),

  webhooks: router({
    generic: publicProcedure
      .input(z.object({ orderId: z.string(), transactionId: z.string(), gateway: z.string(), status: z.string(), amount: z.string().optional() }))
      .mutation(async ({ input }) => {
        const order = await getOrderByNumber(input.orderId);
        if (!order) return { success: false };
        const isSuccess = ["success", "APPROVED", "COMPLETED", "paid", "CAPTURED", "SETTLED"].includes(input.status);
        if (isSuccess) {
          await updateOrderStatus(order.id, "paid", { paidAt: new Date() });
          await createPayment({ orderId: order.id, gatewayTransactionId: input.transactionId, gateway: input.gateway, amount: input.amount ?? order.totalAmount, currency: order.currency, status: "confirmed" });
          const items = await getOrderItems(order.id);
          for (const item of items) {
            await sellTickets(item.ticketTypeId, item.quantity);
            await createTickets(Array.from({ length: item.quantity }, () => ({
              ticketNumber: generateTicketNumber(), orderId: order.id, orderItemId: item.id,
              ticketTypeId: item.ticketTypeId, eventId: order.eventId,
              holderName: order.customerFullName, holderEmail: order.customerEmail,
              qrCodeData: `EP:${order.orderNumber}:${nanoid(8)}`, status: "active" as const,
            })));
          }
          await createInvoice({ orderId: order.id, invoiceNumber: `INV-${order.orderNumber}` });
        } else {
          await updateOrderStatus(order.id, "failed");
          const items = await getOrderItems(order.id);
          for (const item of items) await releaseHeldTickets(item.ticketTypeId, item.quantity);
        }
        return { success: true };
      }),
  }),

  paypal: router({
    /**
     * إنشاء طلب PayPal - يعيد رابط الموافقة للعميل
     * لا يتطلب رمز تحقق - PayPal يتحقق داخلياً
     */
    createOrder: publicProcedure
      .input(z.object({
        orderId: z.number(),
        returnUrl: z.string(),
        cancelUrl: z.string(),
      }))
      .mutation(async ({ input }) => {
        const order = await getOrderById(input.orderId);
        if (!order) throw new TRPCError({ code: 'NOT_FOUND', message: 'Order not found' });
        if (order.status !== 'pending_payment') throw new TRPCError({ code: 'BAD_REQUEST', message: 'Order not in pending state' });

        const event = await getEventById(order.eventId);
        const description = `Expert Plan - ${event?.titleAr ?? event?.title ?? 'Event Ticket'} - ${order.orderNumber}`;

        const paypalOrder = await createPayPalOrder({
          orderNumber: order.orderNumber,
          amount: parseFloat(String(order.totalAmount)),
          currency: order.currency,
          description,
          returnUrl: input.returnUrl,
          cancelUrl: input.cancelUrl,
        });

        // Save PayPal order ID to our order
        await updateOrderStatus(order.id, 'pending_payment', { gatewayOrderId: paypalOrder.paypalOrderId });

        return {
          paypalOrderId: paypalOrder.paypalOrderId,
          approveUrl: paypalOrder.approveUrl,
          paypalAmount: paypalOrder.paypalAmount,
          paypalCurrency: paypalOrder.paypalCurrency,
          originalAmount: paypalOrder.originalAmount,
          originalCurrency: paypalOrder.originalCurrency,
        };
      }),

    /**
     * تأكيد الدفع بعد موافقة العميل على PayPal
     * الأموال تُحوَّل فورياً لحساب PayPal الخاص بك
     */
    captureOrder: publicProcedure
      .input(z.object({
        orderId: z.number(),
        paypalOrderId: z.string(),
      }))
      .mutation(async ({ input }) => {
        const order = await getOrderById(input.orderId);
        if (!order) throw new TRPCError({ code: 'NOT_FOUND' });

        // Capture payment from PayPal - money moves to your account NOW
        const capture = await capturePayPalOrder(input.paypalOrderId);

        if (!capture.success) {
          await updateOrderStatus(order.id, 'failed');
          const items = await getOrderItems(order.id);
          for (const item of items) await releaseHeldTickets(item.ticketTypeId, item.quantity);
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'PayPal payment capture failed' });
        }

        // Payment confirmed - update order and generate tickets
        await updateOrderStatus(order.id, 'paid', { paidAt: new Date(), gatewayOrderId: input.paypalOrderId });
        await createPayment({
          orderId: order.id,
          gatewayTransactionId: capture.captureId,
          gateway: 'paypal',
          amount: String(order.totalAmount),
          currency: order.currency,
          status: 'confirmed',
        });

        const items = await getOrderItems(order.id);
        for (const item of items) {
          await sellTickets(item.ticketTypeId, item.quantity);
          await createTickets(Array.from({ length: item.quantity }, () => ({
            ticketNumber: generateTicketNumber(),
            orderId: order.id,
            orderItemId: item.id,
            ticketTypeId: item.ticketTypeId,
            eventId: order.eventId,
            holderName: order.customerFullName,
            holderEmail: order.customerEmail,
            qrCodeData: `EP:${order.orderNumber}:${nanoid(8)}`,
            status: 'active' as const,
          })));
        }
        await createInvoice({ orderId: order.id, invoiceNumber: `INV-${order.orderNumber}` });

        // إرسال إشعار تأكيد الحجز للعميل
        try {
          const { sendBookingConfirmedNotification } = await import('./notificationService');
          const event = await getEventById(order.eventId);
          const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
          await sendBookingConfirmedNotification({
            customerEmail: order.customerEmail,
            customerName: order.customerFullName,
            orderNumber: order.orderNumber,
            eventTitle: event?.titleAr ?? event?.title ?? 'فعالية خيرية',
            eventDate: event?.startDate ?? new Date(),
            venue: event?.venueAr ?? event?.venue ?? 'فندق ماريوت عمان',
            totalAmount: String(order.totalAmount),
            currency: order.currency,
            ticketCount: totalItems,
            orderId: order.id,
            eventId: order.eventId,
            paymentMethod: 'paypal',
          });
        } catch (notifErr) {
          console.error('[PayPal captureOrder] Notification error:', notifErr);
        }

        return {
          success: true,
          captureId: capture.captureId,
          orderNumber: order.orderNumber,
          message: 'تم الدفع بنجاح! الأموال وصلت لحساب PayPal الخاص بك.',
        };
      }),

    /**
     * التحقق من صحة مفاتيح PayPal
     */
    testCredentials: publicProcedure.query(async () => {
      return testPayPalCredentials();
    }),
  }),

  notifications: router({
    // جلب الإعلانات النشطة للموقع العام
    activeBanners: publicProcedure.query(async () => {
      const { getActiveBanners } = await import('./notificationService');
      return getActiveBanners();
    }),

    // جلب إشعارات المدير
    adminList: organizerProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ input }) => {
        const { getAdminNotifications } = await import('./notificationService');
        return getAdminNotifications(input?.limit ?? 50);
      }),

    // إنشاء إعلان جديد
    createBanner: adminProcedure
      .input(z.object({
        message: z.string().min(5),
        messageAr: z.string().optional(),
        type: z.enum(['info', 'success', 'warning', 'promo']).default('info'),
        ctaText: z.string().optional(),
        ctaUrl: z.string().optional(),
        isActive: z.boolean().default(true),
        startsAt: z.number().optional(),
        endsAt: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { getDb } = await import('./db');
        const { announcementBanners } = await import('../drizzle/schema');
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        await db.insert(announcementBanners).values({
          message: input.message,
          messageAr: input.messageAr,
          type: input.type,
          ctaText: input.ctaText,
          ctaUrl: input.ctaUrl,
          isActive: input.isActive,
          startsAt: input.startsAt ? new Date(input.startsAt) : undefined,
          endsAt: input.endsAt ? new Date(input.endsAt) : undefined,
        });
        return { success: true };
      }),

    // تحديث إعلان
    updateBanner: adminProcedure
      .input(z.object({
        id: z.number(),
        message: z.string().optional(),
        messageAr: z.string().optional(),
        type: z.enum(['info', 'success', 'warning', 'promo']).optional(),
        ctaText: z.string().optional(),
        ctaUrl: z.string().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { getDb } = await import('./db');
        const { announcementBanners } = await import('../drizzle/schema');
        const { eq } = await import('drizzle-orm');
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        const { id, ...rest } = input;
        await db.update(announcementBanners).set(rest).where(eq(announcementBanners.id, id));
        return { success: true };
      }),

    // حذف إعلان
    deleteBanner: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const { getDb } = await import('./db');
        const { announcementBanners } = await import('../drizzle/schema');
        const { eq } = await import('drizzle-orm');
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        await db.delete(announcementBanners).where(eq(announcementBanners.id, input.id));
        return { success: true };
      }),

    // تسجيل Push Subscription
    subscribePush: publicProcedure
      .input(z.object({
        endpoint: z.string(),
        p256dh: z.string(),
        auth: z.string(),
        userEmail: z.string().email().optional(),
      }))
      .mutation(async ({ input }) => {
        const { savePushSubscription } = await import('./notificationService');
        await savePushSubscription(input);
        return { success: true };
      }),

    // إرسال تذكيرات الفعاليات يدوياً (للمدير)
    sendReminders: adminProcedure.mutation(async () => {
      const { sendEventReminders } = await import('./notificationService');
      await sendEventReminders();
      return { success: true, message: 'تم إرسال التذكيرات' };
    }),
  }),

  admin: router({
    stats: organizerProcedure.query(async () => getDashboardStats()),

    // ===== PAYMENT ANALYTICS =====
    analyticsKPIs: organizerProcedure.query(async () => getPaymentAnalyticsKPIs()),

    dailyRevenue: organizerProcedure
      .input(z.object({ days: z.number().min(7).max(365).default(30) }))
      .query(async ({ input }) => getDailyRevenue(input.days)),

    paymentsByGateway: organizerProcedure.query(async () => getPaymentsByGateway()),

    topEvents: organizerProcedure
      .input(z.object({ limit: z.number().min(3).max(20).default(5) }))
      .query(async ({ input }) => getTopEvents(input.limit)),

    users: adminProcedure.query(async () => getAllUsers()),

    updateUserRole: adminProcedure
      .input(z.object({ userId: z.number(), role: z.enum(["user", "organizer", "admin"]) }))
      .mutation(async ({ input }) => { await updateUserRole(input.userId, input.role); return { success: true }; }),

    seedDemoEvents: adminProcedure.mutation(async ({ ctx }) => {
      const demoEvents = [
        {
          title: "International Business Conference 2025", titleAr: "مؤتمر الأعمال الدولي 2025",
          category: "conference" as const,
          description: "A premier gathering of business leaders and innovators from across the globe.",
          descriptionAr: "تجمع رائد لقادة الأعمال والمبتكرين من جميع أنحاء العالم.",
          venue: "King Hussein Convention Center, Amman", venueAr: "مركز الملك حسين للمؤتمرات، عمان",
          coverImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663444865328/GHvM9jHA5PpD8tSaYENMCe/conference_851b4f15.png",
          isFeatured: true, startDate: new Date(Date.now() + 30 * 86400000), endDate: new Date(Date.now() + 32 * 86400000),
          currency: "JOD" as const, status: "published" as const,
          ticketPrices: [{ name: "VIP", nameAr: "VIP", price: 250, qty: 50 }, { name: "Standard", nameAr: "عادي", price: 100, qty: 200 }],
        },
        {
          title: "Luxury Wedding Expo 2025", titleAr: "معرض حفلات الزفاف الفاخرة 2025",
          category: "wedding" as const,
          description: "The ultimate wedding planning experience featuring top vendors and designers.",
          descriptionAr: "التجربة المثلى لتخطيط حفلات الزفاف مع أفضل الموردين والمصممين.",
          venue: "Four Seasons Hotel Amman", venueAr: "فندق فور سيزونز عمان",
          coverImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663444865328/GHvM9jHA5PpD8tSaYENMCe/wedding2_eaf807ad.jpg",
          isFeatured: true, startDate: new Date(Date.now() + 45 * 86400000), endDate: new Date(Date.now() + 46 * 86400000),
          currency: "JOD" as const, status: "published" as const,
          ticketPrices: [{ name: "Couple Entry", nameAr: "دخول زوجين", price: 30, qty: 100 }, { name: "Single Entry", nameAr: "دخول فردي", price: 15, qty: 300 }],
        },
        {
          title: "Middle East Trade Exhibition 2025", titleAr: "معرض التجارة للشرق الأوسط 2025",
          category: "exhibition" as const,
          description: "The largest trade exhibition in the region connecting buyers and sellers.",
          descriptionAr: "أكبر معرض تجاري في المنطقة يربط المشترين والبائعين.",
          venue: "Jordan International Exhibition Center", venueAr: "مركز الأردن الدولي للمعارض",
          coverImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663444865328/GHvM9jHA5PpD8tSaYENMCe/exhibition_0e574000.jpg",
          isFeatured: false, startDate: new Date(Date.now() + 60 * 86400000), endDate: new Date(Date.now() + 63 * 86400000),
          currency: "JOD" as const, status: "published" as const,
          ticketPrices: [{ name: "Exhibitor Pass", nameAr: "تصريح عارض", price: 500, qty: 50 }, { name: "Visitor Pass", nameAr: "تصريح زائر", price: 20, qty: 1000 }],
        },
        {
          title: "Corporate Gala Night 2025", titleAr: "ليلة الجالا المؤسسية 2025",
          category: "corporate" as const,
          description: "An exclusive corporate networking event with dinner and entertainment.",
          descriptionAr: "حدث شبكي مؤسسي حصري مع عشاء وترفيه.",
          venue: "The Country Club, Amman", venueAr: "نادي الريف، عمان",
          coverImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663444865328/GHvM9jHA5PpD8tSaYENMCe/venue_0419aee1.webp",
          isFeatured: true, startDate: new Date(Date.now() + 20 * 86400000), endDate: new Date(Date.now() + 20 * 86400000 + 6 * 3600000),
          currency: "JOD" as const, status: "published" as const,
          ticketPrices: [{ name: "Table (10 seats)", nameAr: "طاولة (10 مقاعد)", price: 1500, qty: 20 }, { name: "Single Seat", nameAr: "مقعد فردي", price: 180, qty: 50 }],
        },
      ];
      for (const demo of demoEvents) {
        const slug = slugify(demo.title);
        const existing = await getEventBySlug(slug.split('-').slice(0, -1).join('-'));
        if (existing) continue;
        await createEvent({
          organizerId: ctx.user.id, title: demo.title, titleAr: demo.titleAr, slug,
          description: demo.description, descriptionAr: demo.descriptionAr, category: demo.category,
          venue: demo.venue, venueAr: demo.venueAr, city: "Amman", country: "Jordan",
          startDate: demo.startDate, endDate: demo.endDate, currency: demo.currency,
          coverImage: demo.coverImage, isFeatured: demo.isFeatured, status: demo.status,
          totalCapacity: demo.ticketPrices.reduce((a, t) => a + t.qty, 0),
        });
        const event = await getEventBySlug(slug);
        if (!event) continue;
        for (let i = 0; i < demo.ticketPrices.length; i++) {
          const tp = demo.ticketPrices[i];
          await createTicketType({ eventId: event.id, name: tp.name, nameAr: tp.nameAr, price: String(tp.price), currency: demo.currency, totalQuantity: tp.qty, sortOrder: i });
        }
      }
      return { success: true, message: "Demo events seeded" };
    }),
  }),
  coupons: router({
    validate: publicProcedure
      .input(z.object({
        code: z.string().min(1),
        orderAmount: z.number().min(0),
      }))
      .mutation(async ({ input }) => {
        const now = Date.now();
        const { getDb } = await import('./db');
        const dbConn = await getDb();
        const [rows] = await (dbConn as any).$client.execute(
          `SELECT * FROM coupons WHERE code = ? AND is_active = 1 AND valid_from <= ? AND (valid_until IS NULL OR valid_until >= ?)`,
          [input.code.toUpperCase().trim(), now, now]
        );
        const coupon = (rows as any[])[0];
        if (!coupon) throw new TRPCError({ code: 'NOT_FOUND', message: 'كود الخصم غير صحيح أو منتهي الصلاحية' });
        if (coupon.usage_limit !== null && coupon.used_count >= coupon.usage_limit) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'تم استنفاد هذا الكود بالكامل' });
        }
        const minOrder = parseFloat(coupon.min_order_amount ?? 0);
        if (input.orderAmount < minOrder) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: `الحد الأدنى للطلب ${minOrder}` });
        }
        let discountAmount = 0;
        if (coupon.discount_type === 'percentage') {
          discountAmount = (input.orderAmount * parseFloat(coupon.discount_value)) / 100;
          if (coupon.max_discount_amount) discountAmount = Math.min(discountAmount, parseFloat(coupon.max_discount_amount));
        } else {
          discountAmount = Math.min(parseFloat(coupon.discount_value), input.orderAmount);
        }
        return {
          valid: true,
          couponId: coupon.id as number,
          code: coupon.code as string,
          description: coupon.description as string,
          discountType: coupon.discount_type as 'percentage' | 'fixed',
          discountValue: parseFloat(coupon.discount_value),
          discountAmount: Math.round(discountAmount * 100) / 100,
          finalAmount: Math.round((input.orderAmount - discountAmount) * 100) / 100,
        };
      }),

    list: adminProcedure.query(async () => {
      const { getDb } = await import('./db');
      const dbConn = await getDb();
      const [rows] = await (dbConn as any).$client.execute(`SELECT * FROM coupons ORDER BY created_at DESC`);
      return rows as any[];
    }),

    create: adminProcedure
      .input(z.object({
        code: z.string().min(2).max(50),
        description: z.string().optional(),
        discountType: z.enum(['percentage', 'fixed']),
        discountValue: z.number().positive(),
        minOrderAmount: z.number().min(0).default(0),
        maxDiscountAmount: z.number().optional(),
        usageLimit: z.number().optional(),
        validFrom: z.number(),
        validUntil: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const now = Date.now();
        const { getDb } = await import('./db');
        const dbConn = await getDb();
        await (dbConn as any).$client.execute(
          `INSERT INTO coupons (code, description, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit, is_active, valid_from, valid_until, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?)`,
          [input.code.toUpperCase(), input.description ?? null, input.discountType, input.discountValue,
           input.minOrderAmount, input.maxDiscountAmount ?? null, input.usageLimit ?? null,
           input.validFrom, input.validUntil ?? null, now, now]
        );
        return { success: true };
      }),

    toggle: adminProcedure
      .input(z.object({ id: z.number(), isActive: z.boolean() }))
      .mutation(async ({ input }) => {
        const { getDb } = await import('./db');
        const dbConn = await getDb();
        await (dbConn as any).$client.execute(`UPDATE coupons SET is_active = ?, updated_at = ? WHERE id = ?`, [input.isActive ? 1 : 0, Date.now(), input.id]);
        return { success: true };
      }),

     delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const { getDb } = await import('./db');
        const dbConn = await getDb();
        await (dbConn as any).$client.execute(`DELETE FROM coupons WHERE id = ?`, [input.id]);
        return { success: true };
      }),
  }),

  // ===== Stripe Payment =====
  stripe: router({
    createCheckout: publicProcedure
      .input(z.object({
        orderId: z.number(),
        origin: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { createTicketCheckoutSession } = await import('./stripe');
        const { getOrderById, getEventById } = await import('./db');

        const order = await getOrderById(input.orderId);
        if (!order) throw new TRPCError({ code: 'NOT_FOUND', message: 'الطلب غير موجود' });

        const event = await getEventById(order.eventId);
        if (!event) throw new TRPCError({ code: 'NOT_FOUND', message: 'الفعالية غير موجودة' });

        // Stripe supported currencies - JOD and some others not supported, convert to USD
        const STRIPE_SUPPORTED = ['usd','eur','gbp','aed','aud','cad','chf','dkk','nok','sek','sgd','hkd','jpy','mxn','brl','inr','myr','nzd','php','pln','thb','czk','huf','ron','bgn','hrk'];
        const orderCurrency = order.currency.toLowerCase();
        // Exchange rates (approximate) for unsupported currencies
        const exchangeRates: Record<string, number> = { jod: 1.41, sar: 0.267, kwd: 3.26 };
        let stripeCurrency = orderCurrency;
        let stripeAmount = parseFloat(order.totalAmount);
        if (!STRIPE_SUPPORTED.includes(orderCurrency)) {
          const rate = exchangeRates[orderCurrency] ?? 1;
          stripeAmount = stripeAmount * rate;
          stripeCurrency = 'usd';
        }
        const amountInCents = Math.round(stripeAmount * 100);

        const session = await createTicketCheckoutSession({
          orderId: order.id,
          amount: amountInCents,
          currency: stripeCurrency,
          customerEmail: ctx.user?.email ?? order.customerEmail,
          customerName: ctx.user?.name ?? order.customerFullName,
          eventTitle: event.title,
          ticketCount: 1,
          origin: input.origin,
        });

        return { checkoutUrl: session.url };
      }),
  }),

  flowers: flowersRouter,
  rentals: rentalsRouter,
});
export type AppRouter = typeof appRouter;
