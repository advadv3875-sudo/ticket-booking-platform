import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { flowerProducts, flowerOrders } from "../../drizzle/schema";
import { eq, desc, and, like, or, sql } from "drizzle-orm";

// ── helpers ──────────────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\s\u0600-\u06FF]+/g, "-")
    .replace(/[^\w-]/g, "")
    .replace(/--+/g, "-")
    .replace(/^-|-$/g, "");
}

function generateFlowerOrderNumber(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `FL-${ts}-${rand}`;
}

// ── admin guard ───────────────────────────────────────────────────────────────

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin only" });
  }
  return next({ ctx });
});

// ── router ────────────────────────────────────────────────────────────────────

export const flowersRouter = router({
  // ── PUBLIC: list products ──────────────────────────────────────────────────
  list: publicProcedure
    .input(
      z.object({
        category: z.enum(["natural", "artificial", "bouquet", "arrangement", "wreath", "gift_box", "other"]).optional(),
        flowerType: z.enum(["roses", "tulips", "orchids", "lilies", "sunflowers", "mixed", "artificial_silk", "artificial_foam", "other"]).optional(),
        search: z.string().optional(),
        featuredOnly: z.boolean().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const conditions = [eq(flowerProducts.isAvailable, true)];
      if (input?.category) conditions.push(eq(flowerProducts.category, input.category));
      if (input?.flowerType) conditions.push(eq(flowerProducts.flowerType, input.flowerType));
      if (input?.featuredOnly) conditions.push(eq(flowerProducts.isFeatured, true));
      if (input?.search) {
        conditions.push(
          or(
            like(flowerProducts.name, `%${input.search}%`),
            like(flowerProducts.nameAr, `%${input.search}%`)
          ) as any
        );
      }
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      return db
        .select()
        .from(flowerProducts)
        .where(and(...conditions))
        .orderBy(desc(flowerProducts.isFeatured), flowerProducts.sortOrder, flowerProducts.name);
    }),

  // ── PUBLIC: get single product by slug ────────────────────────────────────
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      const [product] = await db
        .select()
        .from(flowerProducts)
        .where(eq(flowerProducts.slug, input.slug))
        .limit(1);
      if (!product) throw new TRPCError({ code: "NOT_FOUND" });
      return product;
    }),

  // ── PUBLIC: featured products ─────────────────────────────────────────────
  featured: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
    return db
      .select()
      .from(flowerProducts)
      .where(and(eq(flowerProducts.isFeatured, true), eq(flowerProducts.isAvailable, true)))
      .orderBy(flowerProducts.sortOrder)
      .limit(8);
  }),

  // ── PUBLIC: create order ──────────────────────────────────────────────────
  createOrder: publicProcedure
    .input(
      z.object({
        customerName: z.string().min(2),
        customerEmail: z.string().email(),
        customerPhone: z.string().optional(),
        deliveryType: z.enum(["pickup", "delivery"]).default("delivery"),
        deliveryAddress: z.string().optional(),
        deliveryCity: z.string().optional(),
        deliveryDate: z.string().optional(),
        deliveryNotes: z.string().optional(),
        giftMessage: z.string().optional(),
        recipientName: z.string().optional(),
        items: z.array(
          z.object({
            productId: z.number().int().positive(),
            quantity: z.number().int().min(1).max(50),
          })
        ).min(1),
        paymentMethod: z.enum(["cash_on_delivery", "bank_transfer", "paypal", "stripe", "other"]).default("cash_on_delivery"),
        currency: z.enum(["JOD", "USD", "EUR", "AED", "SAR"]).default("JOD"),
      })
    )
    .mutation(async ({ input }) => {
      // Fetch products to validate & calculate totals
      const productIds = input.items.map((i) => i.productId);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      const products = await db
        .select()
        .from(flowerProducts)
        .where(sql`${flowerProducts.id} IN (${sql.join(productIds.map((id) => sql`${id}`), sql`, `)})`);

      const productMap = new Map(products.map((p) => [p.id, p]));

      // Validate all products exist and are available
      for (const item of input.items) {
        const p = productMap.get(item.productId);
        if (!p) throw new TRPCError({ code: "NOT_FOUND", message: `المنتج #${item.productId} غير موجود` });
        if (!p.isAvailable) throw new TRPCError({ code: "BAD_REQUEST", message: `المنتج "${p.nameAr || p.name}" غير متاح حالياً` });
        if (p.stockQuantity < item.quantity) {
          throw new TRPCError({ code: "BAD_REQUEST", message: `الكمية المطلوبة من "${p.nameAr || p.name}" غير متوفرة (المتاح: ${p.stockQuantity})` });
        }
      }

      // Build order items snapshot
      const orderItems = input.items.map((item) => {
        const p = productMap.get(item.productId)!;
        const unitPrice = parseFloat(p.price);
        const subtotal = unitPrice * item.quantity;
        return {
          productId: p.id,
          productName: p.nameAr || p.name,
          quantity: item.quantity,
          unitPrice: unitPrice.toFixed(2),
          subtotal: subtotal.toFixed(2),
        };
      });

      const subtotal = orderItems.reduce((sum, i) => sum + parseFloat(i.subtotal), 0);
      const deliveryFee = input.deliveryType === "delivery" ? 2.5 : 0; // 2.5 JOD delivery fee
      const totalAmount = subtotal + deliveryFee;

      const orderNumber = generateFlowerOrderNumber();

      const [result] = await db.insert(flowerOrders).values({
        orderNumber,
        customerName: input.customerName,
        customerEmail: input.customerEmail,
        customerPhone: input.customerPhone,
        deliveryType: input.deliveryType,
        deliveryAddress: input.deliveryAddress,
        deliveryCity: input.deliveryCity,
        deliveryDate: input.deliveryDate ? new Date(input.deliveryDate) : undefined,
        deliveryNotes: input.deliveryNotes,
        giftMessage: input.giftMessage,
        recipientName: input.recipientName,
        items: orderItems,
        subtotal: subtotal.toFixed(2),
        deliveryFee: deliveryFee.toFixed(2),
        totalAmount: totalAmount.toFixed(2),
        currency: input.currency,
        paymentMethod: input.paymentMethod,
        status: "pending",
        paymentStatus: "pending",
      });

      // Reduce stock
      for (const item of input.items) {
        await db
          .update(flowerProducts)
          .set({ stockQuantity: sql`${flowerProducts.stockQuantity} - ${item.quantity}` })
          .where(eq(flowerProducts.id, item.productId));
      }

      return { orderNumber, totalAmount: totalAmount.toFixed(2), currency: input.currency };
    }),

  // ── PUBLIC: track order by number + email ────────────────────────────────
  trackOrder: publicProcedure
    .input(z.object({ orderNumber: z.string(), email: z.string().email() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      const [order] = await db
        .select()
        .from(flowerOrders)
        .where(
          and(
            eq(flowerOrders.orderNumber, input.orderNumber),
            eq(flowerOrders.customerEmail, input.email)
          )
        )
        .limit(1);
      if (!order) throw new TRPCError({ code: "NOT_FOUND", message: "الطلب غير موجود أو البريد الإلكتروني غير مطابق" });
      return order;
    }),

  // ── ADMIN: list all products ───────────────────────────────────────────────
  adminListProducts: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
    return db.select().from(flowerProducts).orderBy(flowerProducts.sortOrder, desc(flowerProducts.createdAt));
  }),

  // ── ADMIN: create product ─────────────────────────────────────────────────
  adminCreateProduct: adminProcedure
    .input(
      z.object({
        name: z.string().min(2),
        nameAr: z.string().optional(),
        description: z.string().optional(),
        descriptionAr: z.string().optional(),
        category: z.enum(["natural", "artificial", "bouquet", "arrangement", "wreath", "gift_box", "other"]),
        flowerType: z.enum(["roses", "tulips", "orchids", "lilies", "sunflowers", "mixed", "artificial_silk", "artificial_foam", "other"]),
        price: z.string(),
        originalPrice: z.string().optional(),
        currency: z.enum(["JOD", "USD", "EUR", "AED", "SAR"]).default("JOD"),
        coverImage: z.string().optional(),
        images: z.array(z.string()).optional(),
        stockQuantity: z.number().int().min(0).default(0),
        isAvailable: z.boolean().default(true),
        isFeatured: z.boolean().default(false),
        tags: z.array(z.string()).optional(),
        occasionTags: z.array(z.string()).optional(),
        colors: z.array(z.string()).optional(),
        sortOrder: z.number().int().default(0),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      const slug = slugify(input.nameAr || input.name) + "-" + Date.now().toString(36);
      await db.insert(flowerProducts).values({
        ...input,
        slug,
        price: input.price,
        originalPrice: input.originalPrice ?? null,
      });
      return { success: true };
    }),

  // ── ADMIN: update product ─────────────────────────────────────────────────
  adminUpdateProduct: adminProcedure
    .input(
      z.object({
        id: z.number().int(),
        name: z.string().min(2).optional(),
        nameAr: z.string().optional(),
        description: z.string().optional(),
        descriptionAr: z.string().optional(),
        category: z.enum(["natural", "artificial", "bouquet", "arrangement", "wreath", "gift_box", "other"]).optional(),
        flowerType: z.enum(["roses", "tulips", "orchids", "lilies", "sunflowers", "mixed", "artificial_silk", "artificial_foam", "other"]).optional(),
        price: z.string().optional(),
        originalPrice: z.string().optional(),
        coverImage: z.string().optional(),
        images: z.array(z.string()).optional(),
        stockQuantity: z.number().int().min(0).optional(),
        isAvailable: z.boolean().optional(),
        isFeatured: z.boolean().optional(),
        tags: z.array(z.string()).optional(),
        occasionTags: z.array(z.string()).optional(),
        colors: z.array(z.string()).optional(),
        sortOrder: z.number().int().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      const { id, ...data } = input;
      await db.update(flowerProducts).set({ ...data, updatedAt: new Date() }).where(eq(flowerProducts.id, id));
      return { success: true };
    }),

  // ── ADMIN: delete product ─────────────────────────────────────────────────
  adminDeleteProduct: adminProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      await db.delete(flowerProducts).where(eq(flowerProducts.id, input.id));
      return { success: true };
    }),

  // ── ADMIN: list all orders ────────────────────────────────────────────────
  adminListOrders: adminProcedure
    .input(z.object({ status: z.string().optional(), limit: z.number().default(50), offset: z.number().default(0) }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      const conditions = input?.status ? [eq(flowerOrders.status, input.status as any)] : [];
      return db
        .select()
        .from(flowerOrders)
        .where(conditions.length ? and(...conditions) : undefined)
        .orderBy(desc(flowerOrders.createdAt))
        .limit(input?.limit ?? 50)
        .offset(input?.offset ?? 0);
    }),

  // ── ADMIN: update order status ────────────────────────────────────────────
  adminUpdateOrderStatus: adminProcedure
    .input(
      z.object({
        id: z.number().int(),
        status: z.enum(["pending", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"]),
        paymentStatus: z.enum(["pending", "paid", "failed", "refunded"]).optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      const { id, ...data } = input;
      await db.update(flowerOrders).set({ ...data, updatedAt: new Date() }).where(eq(flowerOrders.id, id));
      return { success: true };
    }),
});
