import { and, desc, eq, like, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, users,
  events, InsertEvent, Event,
  ticketTypes, InsertTicketType,
  orders, InsertOrder, Order,
  orderItems, InsertOrderItem,
  tickets, InsertTicket,
  payments, InsertPayment,
  invoices, InsertInvoice,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ===== USERS =====
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }
  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
    else if (user.openId === ENV.ownerOpenId) { values.role = 'admin'; updateSet.role = 'admin'; }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserRole(userId: number, role: "user" | "organizer" | "admin") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(users).set({ role }).where(eq(users.id, userId));
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(desc(users.createdAt));
}

// ===== EVENTS =====
export async function createEvent(data: InsertEvent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(events).values(data);
  return result[0];
}

export async function updateEvent(id: number, data: Partial<InsertEvent>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(events).set({ ...data, updatedAt: new Date() }).where(eq(events.id, id));
}

export async function getEventById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(events).where(eq(events.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getEventBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(events).where(eq(events.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getPublishedEvents(filters?: {
  category?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return [];
  const conditions: ReturnType<typeof eq>[] = [eq(events.status, "published") as any];
  if (filters?.category && filters.category !== "all") {
    conditions.push(eq(events.category, filters.category as Event["category"]) as any);
  }
  if (filters?.search) {
    conditions.push(
      or(
        like(events.title, `%${filters.search}%`),
        like(events.titleAr, `%${filters.search}%`),
        like(events.venue, `%${filters.search}%`)
      ) as any
    );
  }
  return db.select().from(events)
    .where(and(...conditions))
    .orderBy(desc(events.isFeatured), events.startDate)
    .limit(filters?.limit ?? 20)
    .offset(filters?.offset ?? 0);
}

export async function getFeaturedEvents() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(events)
    .where(and(eq(events.status, "published"), eq(events.isFeatured, true)))
    .orderBy(events.startDate)
    .limit(6);
}

export async function getAllEvents() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(events).orderBy(desc(events.createdAt));
}

export async function deleteEvent(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(events).where(eq(events.id, id));
}

// ===== TICKET TYPES =====
export async function createTicketType(data: InsertTicketType) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(ticketTypes).values(data);
  return result[0];
}

export async function updateTicketType(id: number, data: Partial<InsertTicketType>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(ticketTypes).set({ ...data, updatedAt: new Date() }).where(eq(ticketTypes.id, id));
}

export async function getTicketTypesByEventId(eventId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(ticketTypes)
    .where(and(eq(ticketTypes.eventId, eventId), eq(ticketTypes.isActive, true)))
    .orderBy(ticketTypes.sortOrder, ticketTypes.price);
}

export async function getTicketTypeById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(ticketTypes).where(eq(ticketTypes.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function holdTickets(ticketTypeId: number, quantity: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(ticketTypes)
    .set({ heldQuantity: sql`${ticketTypes.heldQuantity} + ${quantity}`, updatedAt: new Date() })
    .where(eq(ticketTypes.id, ticketTypeId));
}

export async function releaseHeldTickets(ticketTypeId: number, quantity: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(ticketTypes)
    .set({ heldQuantity: sql`GREATEST(0, ${ticketTypes.heldQuantity} - ${quantity})`, updatedAt: new Date() })
    .where(eq(ticketTypes.id, ticketTypeId));
}

export async function sellTickets(ticketTypeId: number, quantity: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(ticketTypes)
    .set({
      soldQuantity: sql`${ticketTypes.soldQuantity} + ${quantity}`,
      heldQuantity: sql`GREATEST(0, ${ticketTypes.heldQuantity} - ${quantity})`,
      updatedAt: new Date()
    })
    .where(eq(ticketTypes.id, ticketTypeId));
}

// ===== ORDERS =====
export async function createOrder(data: InsertOrder) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(orders).values(data);
  return result[0];
}

export async function createOrderItems(items: InsertOrderItem[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(orderItems).values(items);
}

export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getOrderByNumber(orderNumber: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getOrdersByCustomer(customerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders)
    .where(eq(orders.customerId, customerId))
    .orderBy(desc(orders.createdAt));
}

export async function getOrdersByEmail(email: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders)
    .where(eq(orders.customerEmail, email))
    .orderBy(desc(orders.createdAt));
}

export async function getAllOrders(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).orderBy(desc(orders.createdAt)).limit(limit).offset(offset);
}

export async function updateOrderStatus(
  orderId: number,
  status: Order["status"],
  extra?: { gatewayOrderId?: string; gatewayPaymentUrl?: string; paidAt?: Date }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(orders)
    .set({ status, ...extra, updatedAt: new Date() })
    .where(eq(orders.id, orderId));
}

export async function getOrderItems(orderId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
}

// ===== TICKETS =====
export async function createTickets(items: InsertTicket[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(tickets).values(items);
}

export async function getTicketsByOrderId(orderId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tickets).where(eq(tickets.orderId, orderId));
}

export async function getTicketByNumber(ticketNumber: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(tickets).where(eq(tickets.ticketNumber, ticketNumber)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ===== PAYMENTS =====
export async function createPayment(data: InsertPayment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(payments).values(data);
}

export async function getPaymentsByOrderId(orderId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(payments).where(eq(payments.orderId, orderId));
}

// ===== INVOICES =====
export async function createInvoice(data: InsertInvoice) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(invoices).values(data);
}

export async function getInvoiceByOrderId(orderId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(invoices).where(eq(invoices.orderId, orderId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ===== STATS =====
export async function getDashboardStats() {
  const db = await getDb();
  if (!db) return { totalEvents: 0, totalOrders: 0, totalRevenue: 0, totalTickets: 0, totalUsers: 0, pendingOrders: 0, totalTicketsSold: 0, publishedEvents: 0, paidOrders: 0 };
  const [eventsCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(events);
  const [publishedCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(events).where(eq(events.status, "published"));
  const [allOrdersCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(orders);
  const [paidOrdersCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(orders).where(eq(orders.status, "paid"));
  const [pendingOrdersCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(orders).where(eq(orders.status, "pending_payment"));
  const [revenueSum] = await db.select({ sum: sql<string>`COALESCE(SUM(totalAmount), 0)` }).from(orders).where(eq(orders.status, "paid"));
  const [ticketsCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(tickets).where(eq(tickets.status, "active"));
  const [usersCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(users);
  return {
    totalEvents: Number(eventsCount?.count ?? 0),
    publishedEvents: Number(publishedCount?.count ?? 0),
    totalOrders: Number(allOrdersCount?.count ?? 0),
    paidOrders: Number(paidOrdersCount?.count ?? 0),
    pendingOrders: Number(pendingOrdersCount?.count ?? 0),
    totalRevenue: parseFloat(revenueSum?.sum ?? "0"),
    totalTickets: Number(ticketsCount?.count ?? 0),
    totalTicketsSold: Number(ticketsCount?.count ?? 0),
    totalUsers: Number(usersCount?.count ?? 0),
  };
}

// ===== PAYMENT ANALYTICS =====

/** إيرادات يومية آخر N يوم */
export async function getDailyRevenue(days: number = 30) {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.execute(sql`
    SELECT
      DATE(paidAt) AS day,
      COUNT(*) AS orderCount,
      COALESCE(SUM(totalAmount), 0) AS revenue,
      currency
    FROM orders
    WHERE status = 'paid'
      AND paidAt >= DATE_SUB(NOW(), INTERVAL ${days} DAY)
    GROUP BY DATE(paidAt), currency
    ORDER BY day ASC
  `);
  const raw = (rows as any)[0] as Array<{ day: string; orderCount: number; revenue: string; currency: string }>;
  const rateToUSD: Record<string, number> = { USD: 1, EUR: 1.08, GBP: 1.27, JOD: 1.41, AED: 0.27, SAR: 0.267 };
  const map: Record<string, { day: string; revenue: number; orderCount: number }> = {};
  for (const r of raw) {
    const key = r.day;
    const rate = rateToUSD[r.currency] ?? 1;
    if (!map[key]) map[key] = { day: key, revenue: 0, orderCount: 0 };
    map[key].revenue += parseFloat(r.revenue) * rate;
    map[key].orderCount += Number(r.orderCount);
  }
  return Object.values(map).map(v => ({ ...v, revenue: Math.round(v.revenue * 100) / 100 }));
}

/** توزيع المدفوعات حسب بوابة الدفع */
export async function getPaymentsByGateway() {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.execute(sql`
    SELECT
      paymentMethod AS gateway,
      COUNT(*) AS orderCount,
      COALESCE(SUM(totalAmount), 0) AS revenue,
      currency
    FROM orders
    WHERE status = 'paid'
    GROUP BY paymentMethod, currency
    ORDER BY orderCount DESC
  `);
  const raw = (rows as any)[0] as Array<{ gateway: string; orderCount: number; revenue: string; currency: string }>;
  const rateToUSD: Record<string, number> = { USD: 1, EUR: 1.08, GBP: 1.27, JOD: 1.41, AED: 0.27, SAR: 0.267 };
  const map: Record<string, { gateway: string; orderCount: number; revenue: number }> = {};
  for (const r of raw) {
    const key = r.gateway;
    const rate = rateToUSD[r.currency] ?? 1;
    if (!map[key]) map[key] = { gateway: key, orderCount: 0, revenue: 0 };
    map[key].orderCount += Number(r.orderCount);
    map[key].revenue += parseFloat(r.revenue) * rate;
  }
  return Object.values(map)
    .map(v => ({ ...v, revenue: Math.round(v.revenue * 100) / 100 }))
    .sort((a, b) => b.revenue - a.revenue);
}

/** أفضل الفعاليات مبيعاً */
export async function getTopEvents(limit: number = 5) {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.execute(sql`
    SELECT
      e.id,
      e.title,
      e.category,
      COUNT(o.id) AS orderCount,
      COALESCE(SUM(o.totalAmount), 0) AS revenue,
      o.currency
    FROM events e
    JOIN orders o ON o.eventId = e.id
    WHERE o.status = 'paid'
    GROUP BY e.id, e.title, e.category, o.currency
    ORDER BY orderCount DESC
    LIMIT ${limit}
  `);
  const raw = (rows as any)[0] as Array<{ id: number; title: string; category: string; orderCount: number; revenue: string; currency: string }>;
  const rateToUSD: Record<string, number> = { USD: 1, EUR: 1.08, GBP: 1.27, JOD: 1.41, AED: 0.27, SAR: 0.267 };
  const map: Record<number, { id: number; title: string; category: string; orderCount: number; revenue: number }> = {};
  for (const r of raw) {
    const rate = rateToUSD[r.currency] ?? 1;
    if (!map[r.id]) map[r.id] = { id: r.id, title: r.title, category: r.category, orderCount: 0, revenue: 0 };
    map[r.id].orderCount += Number(r.orderCount);
    map[r.id].revenue += parseFloat(r.revenue) * rate;
  }
  return Object.values(map)
    .map(v => ({ ...v, revenue: Math.round(v.revenue * 100) / 100 }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}

/** إحصائيات KPI شاملة للتحليلات */
export async function getPaymentAnalyticsKPIs() {
  const db = await getDb();
  if (!db) return { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0, successRate: 0, todayRevenue: 0, todayOrders: 0, weekRevenue: 0, weekOrders: 0 };
  const rateToUSD: Record<string, number> = { USD: 1, EUR: 1.08, GBP: 1.27, JOD: 1.41, AED: 0.27, SAR: 0.267 };
  const paidRows = await db.execute(sql`
    SELECT COUNT(*) AS cnt, COALESCE(SUM(totalAmount), 0) AS rev, currency
    FROM orders WHERE status = 'paid' GROUP BY currency
  `);
  const allRows = await db.execute(sql`SELECT COUNT(*) AS cnt FROM orders WHERE status != 'expired'`);
  const todayRows = await db.execute(sql`
    SELECT COUNT(*) AS cnt, COALESCE(SUM(totalAmount), 0) AS rev, currency
    FROM orders WHERE status = 'paid' AND DATE(paidAt) = CURDATE() GROUP BY currency
  `);
  const weekRows = await db.execute(sql`
    SELECT COUNT(*) AS cnt, COALESCE(SUM(totalAmount), 0) AS rev, currency
    FROM orders WHERE status = 'paid' AND paidAt >= DATE_SUB(NOW(), INTERVAL 7 DAY) GROUP BY currency
  `);
  const sumUSD = (rows: any) => {
    const arr = (rows as any)[0] as Array<{ cnt: number; rev: string; currency: string }>;
    return arr.reduce((acc, r) => {
      const rate = rateToUSD[r.currency] ?? 1;
      return { rev: acc.rev + parseFloat(r.rev) * rate, cnt: acc.cnt + Number(r.cnt) };
    }, { rev: 0, cnt: 0 });
  };
  const paid = sumUSD(paidRows);
  const today = sumUSD(todayRows);
  const week = sumUSD(weekRows);
  const allCount = Number(((allRows as any)[0] as any[])[0]?.cnt ?? 0);
  return {
    totalRevenue: Math.round(paid.rev * 100) / 100,
    totalOrders: paid.cnt,
    avgOrderValue: paid.cnt > 0 ? Math.round((paid.rev / paid.cnt) * 100) / 100 : 0,
    successRate: allCount > 0 ? Math.round((paid.cnt / allCount) * 1000) / 10 : 0,
    todayRevenue: Math.round(today.rev * 100) / 100,
    todayOrders: today.cnt,
    weekRevenue: Math.round(week.rev * 100) / 100,
    weekOrders: week.cnt,
  };
}
