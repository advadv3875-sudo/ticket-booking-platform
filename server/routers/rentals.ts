import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { rentalItems, rentalOrders, rentalOrderItems } from "../../drizzle/schema";
import { eq, and, gte, lte, desc, like, or, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

function generateOrderNumber(): string {
  const prefix = "RNT";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export const rentalsRouter = router({
  // ── List all rental items with optional filters ──
  listItems: publicProcedure
    .input(z.object({
      category: z.enum(["all", "furniture", "lighting", "tents", "decor", "audio_visual", "catering", "stage", "other"]).optional().default("all"),
      search: z.string().optional(),
      featuredOnly: z.boolean().optional().default(false),
      sortBy: z.enum(["default", "price_asc", "price_desc", "name_asc", "featured"]).optional().default("default"),
      minPrice: z.number().optional(),
      maxPrice: z.number().optional(),
      deliveryIncluded: z.boolean().optional(),
      setupIncluded: z.boolean().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

      const conditions = [eq(rentalItems.isAvailable, true)];
      if (input.category && input.category !== "all") {
        conditions.push(eq(rentalItems.category, input.category as any));
      }
      if (input.featuredOnly) {
        conditions.push(eq(rentalItems.isFeatured, true));
      }
      if (input.search) {
        conditions.push(
          or(
            like(rentalItems.name, `%${input.search}%`),
            like(rentalItems.nameAr, `%${input.search}%`)
          )!
        );
      }
      if (input.minPrice !== undefined) {
        conditions.push(gte(rentalItems.pricePerDay, input.minPrice.toString()));
      }
      if (input.maxPrice !== undefined) {
        conditions.push(lte(rentalItems.pricePerDay, input.maxPrice.toString()));
      }
      if (input.deliveryIncluded === true) {
        conditions.push(eq(rentalItems.deliveryIncluded, true));
      }
      if (input.setupIncluded === true) {
        conditions.push(eq(rentalItems.setupIncluded, true));
      }

      const query = db.select().from(rentalItems).where(and(...conditions));

      switch (input.sortBy) {
        case "price_asc":  return query.orderBy(sql`CAST(${rentalItems.pricePerDay} AS DECIMAL)`);
        case "price_desc": return query.orderBy(desc(sql`CAST(${rentalItems.pricePerDay} AS DECIMAL)`));
        case "name_asc":   return query.orderBy(rentalItems.nameAr);
        case "featured":   return query.orderBy(desc(rentalItems.isFeatured), rentalItems.sortOrder);
        default:           return query.orderBy(rentalItems.sortOrder, desc(rentalItems.isFeatured), rentalItems.name);
      }
    }),

  // ── Get single rental item ──
  getItem: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

      const [item] = await db.select().from(rentalItems).where(eq(rentalItems.id, input.id));
      if (!item) throw new TRPCError({ code: "NOT_FOUND", message: "العنصر غير موجود" });
      return item;
    }),

  // ── Check availability for date range ──
  checkAvailability: publicProcedure
    .input(z.object({
      itemId: z.number(),
      startDate: z.string(),
      endDate: z.string(),
      quantity: z.number().min(1).default(1),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

      const [item] = await db.select().from(rentalItems).where(eq(rentalItems.id, input.itemId));
      if (!item) throw new TRPCError({ code: "NOT_FOUND", message: "العنصر غير موجود" });

      // Count booked quantity in the date range
      const bookedResult = await db.select({
        totalBooked: sql<number>`COALESCE(SUM(roi.quantity), 0)`,
      })
        .from(rentalOrderItems)
        .innerJoin(rentalOrders, eq(rentalOrderItems.orderId, rentalOrders.id))
        .where(
          and(
            eq(rentalOrderItems.rentalItemId, input.itemId),
            or(
              eq(rentalOrders.status, "pending"),
              eq(rentalOrders.status, "confirmed"),
              eq(rentalOrders.status, "delivered")
            )!,
            lte(rentalOrders.startDate, new Date(input.endDate)),
            gte(rentalOrders.endDate, new Date(input.startDate))
          )
        );

      const totalBooked = Number(bookedResult[0]?.totalBooked ?? 0);
      const available = item.stockQuantity - totalBooked;

      return {
        available: available >= input.quantity,
        availableQuantity: Math.max(0, available),
        stockQuantity: item.stockQuantity,
      };
    }),

  // ── Create rental order ──
  createOrder: publicProcedure
    .input(z.object({
      customerName: z.string().min(2),
      customerEmail: z.string().email(),
      customerPhone: z.string().min(8),
      eventType: z.string().optional(),
      eventAddress: z.string().optional(),
      startDate: z.string(),
      endDate: z.string(),
      notes: z.string().optional(),
      items: z.array(z.object({
        rentalItemId: z.number(),
        quantity: z.number().min(1),
      })).min(1),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

      const start = new Date(input.startDate);
      const end = new Date(input.endDate);
      const rentalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

      // Fetch all items and calculate totals
      let subtotal = 0;
      let depositTotal = 0;
      const orderItemsData: Array<{
        rentalItemId: number;
        quantity: number;
        pricePerDay: string;
        rentalDays: number;
        subtotal: string;
      }> = [];

      for (const cartItem of input.items) {
        const [item] = await db.select().from(rentalItems).where(eq(rentalItems.id, cartItem.rentalItemId));
        if (!item) throw new TRPCError({ code: "NOT_FOUND", message: `العنصر ${cartItem.rentalItemId} غير موجود` });

        const itemSubtotal = Number(item.pricePerDay) * cartItem.quantity * rentalDays;
        const itemDeposit = Number(item.depositAmount ?? 0) * cartItem.quantity;
        subtotal += itemSubtotal;
        depositTotal += itemDeposit;

        orderItemsData.push({
          rentalItemId: cartItem.rentalItemId,
          quantity: cartItem.quantity,
          pricePerDay: item.pricePerDay,
          rentalDays,
          subtotal: itemSubtotal.toFixed(2),
        });
      }

      const totalAmount = subtotal + depositTotal;
      const orderNumber = generateOrderNumber();

      // Create order
      const [result] = await db.insert(rentalOrders).values({
        orderNumber,
        customerId: (ctx as any).user?.id ?? null,
        customerName: input.customerName,
        customerEmail: input.customerEmail,
        customerPhone: input.customerPhone,
        eventType: input.eventType,
        eventAddress: input.eventAddress,
        startDate: start,
        endDate: end,
        rentalDays,
        subtotal: subtotal.toFixed(2),
        depositTotal: depositTotal.toFixed(2),
        deliveryFee: "0",
        totalAmount: totalAmount.toFixed(2),
        notes: input.notes,
        status: "pending",
        paymentStatus: "unpaid",
      });

      const orderId = (result as any).insertId;

      // Insert order items
      for (const item of orderItemsData) {
        await db.insert(rentalOrderItems).values({ orderId, ...item });
      }

      return { orderNumber, orderId, totalAmount: totalAmount.toFixed(2) };
    }),

  // ── Track rental order ──
  trackOrder: publicProcedure
    .input(z.object({
      orderNumber: z.string(),
      email: z.string().email(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

      const [order] = await db.select().from(rentalOrders)
        .where(and(
          eq(rentalOrders.orderNumber, input.orderNumber),
          eq(rentalOrders.customerEmail, input.email)
        ));

      if (!order) throw new TRPCError({ code: "NOT_FOUND", message: "الطلب غير موجود" });

      const items = await db.select({
        id: rentalOrderItems.id,
        quantity: rentalOrderItems.quantity,
        pricePerDay: rentalOrderItems.pricePerDay,
        rentalDays: rentalOrderItems.rentalDays,
        subtotal: rentalOrderItems.subtotal,
        itemName: rentalItems.name,
        itemNameAr: rentalItems.nameAr,
        itemImage: rentalItems.coverImage,
      })
        .from(rentalOrderItems)
        .innerJoin(rentalItems, eq(rentalOrderItems.rentalItemId, rentalItems.id))
        .where(eq(rentalOrderItems.orderId, order.id));

      return { order, items };
    }),

  // ── Admin: list all rental orders ──
  adminListOrders: protectedProcedure
    .input(z.object({
      status: z.string().optional(),
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(50).default(20),
    }))
    .query(async ({ input, ctx }) => {
      if ((ctx as any).user?.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "غير مصرح" });
      }
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

      const conditions = input.status && input.status !== "all"
        ? [eq(rentalOrders.status, input.status as any)]
        : [];

      const offset = (input.page - 1) * input.limit;
      const orders = await db.select().from(rentalOrders)
        .where(conditions.length ? and(...conditions) : undefined)
        .orderBy(desc(rentalOrders.createdAt))
        .limit(input.limit)
        .offset(offset);

      return orders;
    }),

  // ── Admin: update rental item ──
  adminUpsertItem: protectedProcedure
    .input(z.object({
      id: z.number().optional(),
      name: z.string().min(2),
      nameAr: z.string().min(2),
      description: z.string().optional(),
      descriptionAr: z.string().optional(),
      category: z.enum(["furniture", "lighting", "tents", "decor", "audio_visual", "catering", "stage", "other"]),
      pricePerDay: z.string(),
      depositAmount: z.string().optional().default("0"),
      stockQuantity: z.number().min(1),
      minRentalDays: z.number().min(1).default(1),
      coverImage: z.string().optional(),
      images: z.array(z.string()).optional(),
      features: z.array(z.string()).optional(),
      isAvailable: z.boolean().default(true),
      isFeatured: z.boolean().default(false),
      deliveryIncluded: z.boolean().default(false),
      setupIncluded: z.boolean().default(false),
    }))
    .mutation(async ({ input, ctx }) => {
      if ((ctx as any).user?.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "غير مصرح" });
      }
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

      const { id, ...data } = input;
      if (id) {
        await db.update(rentalItems).set(data as any).where(eq(rentalItems.id, id));
        return { id };
      } else {
        const [result] = await db.insert(rentalItems).values(data as any);
        return { id: (result as any).insertId };
      }
    }),
});
