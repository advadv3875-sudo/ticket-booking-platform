import {
  decimal,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  boolean,
  json,
  bigint,
  index,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  phone: varchar("phone", { length: 30 }),
  role: mysqlEnum("role", ["user", "organizer", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ===== EVENTS =====
export const events = mysqlTable("events", {
  id: int("id").autoincrement().primaryKey(),
  organizerId: int("organizerId").references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  titleAr: varchar("titleAr", { length: 255 }),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  descriptionAr: text("descriptionAr"),
  category: mysqlEnum("category", [
    "conference", "exhibition", "wedding", "concert",
    "corporate", "cultural", "sports", "other"
  ]).notNull().default("other"),
  status: mysqlEnum("status", ["draft", "published", "cancelled", "completed"]).default("draft").notNull(),
  coverImage: text("coverImage"),
  galleryImages: json("galleryImages").$type<string[]>(),
  venue: varchar("venue", { length: 500 }),
  venueAr: varchar("venueAr", { length: 500 }),
  city: varchar("city", { length: 100 }).default("Amman"),
  country: varchar("country", { length: 100 }).default("Jordan"),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate").notNull(),
  currency: mysqlEnum("currency", ["JOD", "EUR", "USD", "AED", "SAR", "GBP"]).default("JOD").notNull(),
  isFeatured: boolean("isFeatured").default(false),
  totalCapacity: int("totalCapacity").default(0),
  soldCount: int("soldCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (t) => ({
  // فلترة الفعاليات المنشورة (الاستعلام الأكثر شيوعاً)
  statusIdx: index("idx_events_status").on(t.status),
  // ترتيب الفعاليات بالتاريخ
  startDateIdx: index("idx_events_start_date").on(t.startDate),
  // فلترة الفعاليات المميزة
  isFeaturedIdx: index("idx_events_is_featured").on(t.isFeatured),
  // composite: status + isFeatured + startDate (للصفحة الرئيسية)
  statusFeaturedDateIdx: index("idx_events_status_featured_date").on(t.status, t.isFeatured, t.startDate),
}));

export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;

// ===== TICKET TYPES =====
export const ticketTypes = mysqlTable("ticket_types", {
  id: int("id").autoincrement().primaryKey(),
  eventId: int("eventId").notNull().references(() => events.id),
  name: varchar("name", { length: 255 }).notNull(),
  nameAr: varchar("nameAr", { length: 255 }),
  description: text("description"),
  descriptionAr: text("descriptionAr"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currency: mysqlEnum("currency", ["JOD", "EUR", "USD", "AED", "SAR", "GBP"]).default("JOD").notNull(),
  totalQuantity: int("totalQuantity").notNull(),
  soldQuantity: int("soldQuantity").default(0).notNull(),
  heldQuantity: int("heldQuantity").default(0).notNull(),
  maxPerOrder: int("maxPerOrder").default(10),
  isActive: boolean("isActive").default(true),
  sortOrder: int("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (t) => ({
  // composite: eventId + isActive + sortOrder (لعرض أنواع التذاكر النشطة مرتبة)
  eventActiveIdx: index("idx_ticket_types_event_active").on(t.eventId, t.isActive, t.sortOrder),
}));

export type TicketType = typeof ticketTypes.$inferSelect;
export type InsertTicketType = typeof ticketTypes.$inferInsert;

// ===== COUPONS =====
// Note: This table uses snake_case column names (legacy schema)
export const coupons = mysqlTable("coupons", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  description: varchar("description", { length: 255 }),
  discountType: mysqlEnum("discount_type", ["percentage", "fixed"]).notNull().default("percentage"),
  discountValue: decimal("discount_value", { precision: 10, scale: 2 }).notNull(),
  minOrderAmount: decimal("min_order_amount", { precision: 10, scale: 2 }).default("0"),
  maxDiscountAmount: decimal("max_discount_amount", { precision: 10, scale: 2 }),
  usageLimit: int("usage_limit"),
  usedCount: int("used_count").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  validFrom: bigint("valid_from", { mode: "number" }).notNull(),
  validUntil: bigint("valid_until", { mode: "number" }),
  eventId: int("event_id").references(() => events.id),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
  updatedAt: bigint("updated_at", { mode: "number" }).notNull(),
});

export type Coupon = typeof coupons.$inferSelect;
export type InsertCoupon = typeof coupons.$inferInsert;

// ===== ORDERS =====
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  orderNumber: varchar("orderNumber", { length: 50 }).notNull().unique(),
  customerId: int("customerId").references(() => users.id),
  customerEmail: varchar("customerEmail", { length: 320 }).notNull(),
  customerFullName: varchar("customerFullName", { length: 255 }).notNull(),
  customerPhone: varchar("customerPhone", { length: 30 }),
  eventId: int("eventId").notNull().references(() => events.id),
  currency: mysqlEnum("currency", ["JOD", "EUR", "USD", "AED", "SAR", "GBP"]).notNull(),
  subtotalAmount: decimal("subtotalAmount", { precision: 10, scale: 2 }).notNull(),
  feesAmount: decimal("feesAmount", { precision: 10, scale: 2 }).default("0"),
  totalAmount: decimal("totalAmount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: mysqlEnum("paymentMethod", [
    "card", "unionpay", "sepa", "payomentic", "2checkout",
    "applepay", "googlepay", "paypal", "alipay", "wechatpay",
    "telr", "hyperpaywallet", "amex", "bank_transfer"
  ]).notNull(),
  status: mysqlEnum("status", [
    "pending_payment", "pending_settlement", "paid", "failed", "expired", "cancelled", "refunded"
  ]).default("pending_payment").notNull(),
  gatewayOrderId: varchar("gatewayOrderId", { length: 255 }),
  gatewayPaymentUrl: text("gatewayPaymentUrl"),
  notes: text("notes"),
  expiresAt: timestamp("expiresAt"),
  paidAt: timestamp("paidAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (t) => ({
  // البحث بالبريد الإلكتروني (تتبع الطلب بدون حساب)
  customerEmailIdx: index("idx_orders_customer_email").on(t.customerEmail),
  // فلترة حالة الطلب (analytics + webhooks)
  statusIdx: index("idx_orders_status").on(t.status),
  // ترتيب الطلبات بالتاريخ
  createdAtIdx: index("idx_orders_created_at").on(t.createdAt),
  // البحث بـ gatewayOrderId في Stripe/PayPal webhooks
  gatewayOrderIdIdx: index("idx_orders_gateway_order_id").on(t.gatewayOrderId),
  // composite: status + createdAt (لتقارير الإيرادات)
  statusCreatedAtIdx: index("idx_orders_status_created_at").on(t.status, t.createdAt),
}));

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

// ===== ORDER ITEMS =====
export const orderItems = mysqlTable("order_items", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull().references(() => orders.id),
  ticketTypeId: int("ticketTypeId").notNull().references(() => ticketTypes.id),
  quantity: int("quantity").notNull(),
  unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("totalPrice", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

// ===== TICKETS =====
export const tickets = mysqlTable("tickets", {
  id: int("id").autoincrement().primaryKey(),
  ticketNumber: varchar("ticketNumber", { length: 50 }).notNull().unique(),
  orderId: int("orderId").notNull().references(() => orders.id),
  orderItemId: int("orderItemId").notNull().references(() => orderItems.id),
  ticketTypeId: int("ticketTypeId").notNull().references(() => ticketTypes.id),
  eventId: int("eventId").notNull().references(() => events.id),
  holderName: varchar("holderName", { length: 255 }),
  holderEmail: varchar("holderEmail", { length: 320 }),
  qrCode: text("qrCode"),
  qrCodeData: varchar("qrCodeData", { length: 500 }),
  status: mysqlEnum("status", ["active", "used", "cancelled", "expired"]).default("active").notNull(),
  checkedInAt: timestamp("checkedInAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (t) => ({
  // عد التذاكر النشطة (analytics dashboard)
  statusIdx: index("idx_tickets_status").on(t.status),
  // البحث بالبريد لإرسال التذكرة مجدداً
  holderEmailIdx: index("idx_tickets_holder_email").on(t.holderEmail),
}));

export type Ticket = typeof tickets.$inferSelect;
export type InsertTicket = typeof tickets.$inferInsert;

// ===== PAYMENTS =====
export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull().references(() => orders.id),
  gatewayTransactionId: varchar("gatewayTransactionId", { length: 255 }).unique(),
  gateway: varchar("gateway", { length: 50 }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull(),
  status: mysqlEnum("status", ["pending", "confirmed", "failed", "refunded"]).notNull(),
  gatewayResponse: text("gatewayResponse"),
  webhookData: text("webhookData"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

// ===== INVOICES =====
export const invoices = mysqlTable("invoices", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull().references(() => orders.id),
  invoiceNumber: varchar("invoiceNumber", { length: 50 }).notNull().unique(),
  pdfUrl: text("pdfUrl"),
  pdfKey: varchar("pdfKey", { length: 255 }),
  emailSentAt: timestamp("emailSentAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = typeof invoices.$inferInsert;

// ===== NOTIFICATIONS =====
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  recipientEmail: varchar("recipientEmail", { length: 320 }),
  recipientType: mysqlEnum("recipientType", ["customer", "admin", "organizer"]).notNull(),
  type: mysqlEnum("type", [
    "booking_confirmed", "payment_success", "payment_failed",
    "event_reminder_1day", "event_reminder_1week",
    "low_stock", "sold_out", "new_booking_admin", "custom"
  ]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  orderId: int("orderId").references(() => orders.id),
  eventId: int("eventId").references(() => events.id),
  channel: mysqlEnum("channel", ["email", "push", "in_app", "sms"]).notNull(),
  status: mysqlEnum("status", ["pending", "sent", "failed", "read"]).default("pending").notNull(),
  sentAt: timestamp("sentAt"),
  readAt: timestamp("readAt"),
  metadata: text("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (t) => ({
  // فلترة حالة الإشعار (لمعالجة الإشعارات المعلقة)
  statusIdx: index("idx_notifications_status").on(t.status),
  // composite: type + status (لاستعلامات التذكير الدوري)
  typeStatusIdx: index("idx_notifications_type_status").on(t.type, t.status),
  // فلترة إشعارات المستلم
  recipientTypeIdx: index("idx_notifications_recipient_type").on(t.recipientType),
}));

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

// ===== ANNOUNCEMENT BANNERS =====
export const announcementBanners = mysqlTable("announcement_banners", {
  id: int("id").autoincrement().primaryKey(),
  message: text("message").notNull(),
  messageAr: text("messageAr"),
  type: mysqlEnum("type", ["info", "success", "warning", "promo"]).default("info").notNull(),
  ctaText: varchar("ctaText", { length: 100 }),
  ctaUrl: varchar("ctaUrl", { length: 500 }),
  isActive: boolean("isActive").default(true).notNull(),
  startsAt: timestamp("startsAt"),
  endsAt: timestamp("endsAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AnnouncementBanner = typeof announcementBanners.$inferSelect;
export type InsertAnnouncementBanner = typeof announcementBanners.$inferInsert;

// ===== FLOWER PRODUCTS =====
export const flowerProducts = mysqlTable("flower_products", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  nameAr: varchar("nameAr", { length: 255 }),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  descriptionAr: text("descriptionAr"),
  category: mysqlEnum("category", [
    "natural", "artificial", "bouquet", "arrangement", "wreath", "gift_box", "other"
  ]).notNull().default("natural"),
  flowerType: mysqlEnum("flowerType", [
    "roses", "tulips", "orchids", "lilies", "sunflowers",
    "mixed", "artificial_silk", "artificial_foam", "other"
  ]).notNull().default("roses"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal("originalPrice", { precision: 10, scale: 2 }),
  currency: mysqlEnum("currency", ["JOD", "USD", "EUR", "AED", "SAR"]).default("JOD").notNull(),
  coverImage: text("coverImage"),
  images: json("images").$type<string[]>(),
  stockQuantity: int("stockQuantity").default(0).notNull(),
  isAvailable: boolean("isAvailable").default(true).notNull(),
  isFeatured: boolean("isFeatured").default(false).notNull(),
  tags: json("tags").$type<string[]>(),
  occasionTags: json("occasionTags").$type<string[]>(),
  colors: json("colors").$type<string[]>(),
  sortOrder: int("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (t) => ({
  categoryIdx: index("idx_flower_products_category").on(t.category),
  availableIdx: index("idx_flower_products_available").on(t.isAvailable),
  featuredIdx: index("idx_flower_products_featured").on(t.isFeatured),
  categoryAvailableIdx: index("idx_flower_products_cat_avail").on(t.category, t.isAvailable),
}));

export type FlowerProduct = typeof flowerProducts.$inferSelect;
export type InsertFlowerProduct = typeof flowerProducts.$inferInsert;

// ===== FLOWER ORDERS =====
export const flowerOrders = mysqlTable("flower_orders", {
  id: int("id").autoincrement().primaryKey(),
  orderNumber: varchar("orderNumber", { length: 30 }).notNull().unique(),
  customerId: int("customerId").references(() => users.id),
  customerName: varchar("customerName", { length: 255 }).notNull(),
  customerEmail: varchar("customerEmail", { length: 320 }).notNull(),
  customerPhone: varchar("customerPhone", { length: 30 }),
  // تفاصيل التوصيل
  deliveryType: mysqlEnum("deliveryType", ["pickup", "delivery"]).default("delivery").notNull(),
  deliveryAddress: text("deliveryAddress"),
  deliveryCity: varchar("deliveryCity", { length: 100 }),
  deliveryDate: timestamp("deliveryDate"),
  deliveryNotes: text("deliveryNotes"),
  // رسالة البطاقة
  giftMessage: text("giftMessage"),
  recipientName: varchar("recipientName", { length: 255 }),
  // المنتجات (JSON snapshot)
  items: json("items").$type<Array<{
    productId: number;
    productName: string;
    quantity: number;
    unitPrice: string;
    subtotal: string;
  }>>().notNull(),
  // الأسعار
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  deliveryFee: decimal("deliveryFee", { precision: 10, scale: 2 }).default("0").notNull(),
  discountAmount: decimal("discountAmount", { precision: 10, scale: 2 }).default("0"),
  totalAmount: decimal("totalAmount", { precision: 10, scale: 2 }).notNull(),
  currency: mysqlEnum("currency", ["JOD", "USD", "EUR", "AED", "SAR"]).default("JOD").notNull(),
  // الدفع
  paymentMethod: mysqlEnum("paymentMethod", [
    "cash_on_delivery", "bank_transfer", "paypal", "stripe", "other"
  ]).default("cash_on_delivery").notNull(),
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "paid", "failed", "refunded"]).default("pending").notNull(),
  // حالة الطلب
  status: mysqlEnum("status", [
    "pending", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"
  ]).default("pending").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (t) => ({
  customerEmailIdx: index("idx_flower_orders_email").on(t.customerEmail),
  statusIdx: index("idx_flower_orders_status").on(t.status),
  createdAtIdx: index("idx_flower_orders_created_at").on(t.createdAt),
}));

export type FlowerOrder = typeof flowerOrders.$inferSelect;
export type InsertFlowerOrder = typeof flowerOrders.$inferInsert;

// ===== PUSH SUBSCRIPTIONS =====
export const pushSubscriptions = mysqlTable("push_subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  endpoint: text("endpoint").notNull(),
  p256dh: text("p256dh").notNull(),
  auth: varchar("auth", { length: 255 }).notNull(),
  userEmail: varchar("userEmail", { length: 320 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PushSubscription = typeof pushSubscriptions.$inferSelect;
export type InsertPushSubscription = typeof pushSubscriptions.$inferInsert;

// ===== RELATIONS =====

export const usersRelations = relations(users, ({ many }) => ({
  events: many(events),
  orders: many(orders),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  organizer: one(users, { fields: [events.organizerId], references: [users.id] }),
  ticketTypes: many(ticketTypes),
  orders: many(orders),
  tickets: many(tickets),
  notifications: many(notifications),
}));

export const ticketTypesRelations = relations(ticketTypes, ({ one, many }) => ({
  event: one(events, { fields: [ticketTypes.eventId], references: [events.id] }),
  orderItems: many(orderItems),
  tickets: many(tickets),
}));

export const couponsRelations = relations(coupons, ({ one }) => ({
  event: one(events, { fields: [coupons.eventId], references: [events.id] }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  customer: one(users, { fields: [orders.customerId], references: [users.id] }),
  event: one(events, { fields: [orders.eventId], references: [events.id] }),
  orderItems: many(orderItems),
  tickets: many(tickets),
  payments: many(payments),
  invoice: one(invoices, { fields: [orders.id], references: [invoices.orderId] }),
  notifications: many(notifications),
}));

export const orderItemsRelations = relations(orderItems, ({ one, many }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  ticketType: one(ticketTypes, { fields: [orderItems.ticketTypeId], references: [ticketTypes.id] }),
  tickets: many(tickets),
}));

export const ticketsRelations = relations(tickets, ({ one }) => ({
  order: one(orders, { fields: [tickets.orderId], references: [orders.id] }),
  orderItem: one(orderItems, { fields: [tickets.orderItemId], references: [orderItems.id] }),
  ticketType: one(ticketTypes, { fields: [tickets.ticketTypeId], references: [ticketTypes.id] }),
  event: one(events, { fields: [tickets.eventId], references: [events.id] }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  order: one(orders, { fields: [payments.orderId], references: [orders.id] }),
}));

export const invoicesRelations = relations(invoices, ({ one }) => ({
  order: one(orders, { fields: [invoices.orderId], references: [orders.id] }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  order: one(orders, { fields: [notifications.orderId], references: [orders.id] }),
  event: one(events, { fields: [notifications.eventId], references: [events.id] }),
}));

export const flowerOrdersRelations = relations(flowerOrders, ({ one }) => ({
  customer: one(users, { fields: [flowerOrders.customerId], references: [users.id] }),
}));


// ===== RENTAL ITEMS (تأجير لوازم المناسبات) =====
export const rentalItems = mysqlTable("rental_items", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  nameAr: varchar("nameAr", { length: 255 }).notNull(),
  description: text("description"),
  descriptionAr: text("descriptionAr"),
  category: mysqlEnum("rentalCategory", [
    "furniture", "lighting", "tents", "decor",
    "audio_visual", "catering", "stage", "other"
  ]).notNull().default("other"),
  pricePerDay: decimal("pricePerDay", { precision: 10, scale: 2 }).notNull(),
  depositAmount: decimal("depositAmount", { precision: 10, scale: 2 }).default("0"),
  currency: varchar("currency", { length: 10 }).default("JOD").notNull(),
  stockQuantity: int("stockQuantity").default(1).notNull(),
  minRentalDays: int("minRentalDays").default(1).notNull(),
  maxRentalDays: int("maxRentalDays").default(30),
  images: json("images").$type<string[]>(),
  coverImage: text("coverImage"),
  features: json("features").$type<string[]>(),
  isAvailable: boolean("isAvailable").default(true).notNull(),
  isFeatured: boolean("isFeatured").default(false).notNull(),
  deliveryIncluded: boolean("deliveryIncluded").default(false).notNull(),
  setupIncluded: boolean("setupIncluded").default(false).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (t) => ({
  categoryIdx: index("rental_items_category_idx").on(t.category),
  availableIdx: index("rental_items_available_idx").on(t.isAvailable),
  featuredIdx: index("rental_items_featured_idx").on(t.isFeatured),
}));

export type RentalItem = typeof rentalItems.$inferSelect;
export type InsertRentalItem = typeof rentalItems.$inferInsert;

// ===== RENTAL ORDERS (طلبات التأجير) =====
export const rentalOrders = mysqlTable("rental_orders", {
  id: int("id").autoincrement().primaryKey(),
  orderNumber: varchar("orderNumber", { length: 30 }).notNull().unique(),
  customerId: int("customerId").references(() => users.id),
  customerName: varchar("customerName", { length: 255 }).notNull(),
  customerEmail: varchar("customerEmail", { length: 320 }).notNull(),
  customerPhone: varchar("customerPhone", { length: 30 }).notNull(),
  eventType: varchar("eventType", { length: 100 }),
  eventAddress: text("eventAddress"),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate").notNull(),
  rentalDays: int("rentalDays").notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  depositTotal: decimal("depositTotal", { precision: 10, scale: 2 }).default("0"),
  deliveryFee: decimal("deliveryFee", { precision: 10, scale: 2 }).default("0"),
  totalAmount: decimal("totalAmount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("JOD").notNull(),
  status: mysqlEnum("rentalOrderStatus", [
    "pending", "confirmed", "delivered", "returned", "cancelled"
  ]).default("pending").notNull(),
  paymentStatus: mysqlEnum("rentalPaymentStatus", [
    "unpaid", "deposit_paid", "fully_paid", "refunded"
  ]).default("unpaid").notNull(),
  notes: text("notes"),
  adminNotes: text("adminNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (t) => ({
  customerEmailIdx: index("rental_orders_email_idx").on(t.customerEmail),
  statusIdx: index("rental_orders_status_idx").on(t.status),
  startDateIdx: index("rental_orders_start_date_idx").on(t.startDate),
}));

export type RentalOrder = typeof rentalOrders.$inferSelect;
export type InsertRentalOrder = typeof rentalOrders.$inferInsert;

// ===== RENTAL ORDER ITEMS (عناصر طلب التأجير) =====
export const rentalOrderItems = mysqlTable("rental_order_items", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull().references(() => rentalOrders.id),
  rentalItemId: int("rentalItemId").notNull().references(() => rentalItems.id),
  quantity: int("quantity").notNull().default(1),
  pricePerDay: decimal("pricePerDay", { precision: 10, scale: 2 }).notNull(),
  rentalDays: int("rentalDays").notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type RentalOrderItem = typeof rentalOrderItems.$inferSelect;
export type InsertRentalOrderItem = typeof rentalOrderItems.$inferInsert;

// ===== RENTAL RELATIONS =====
export const rentalItemsRelations = relations(rentalItems, ({ many }) => ({
  orderItems: many(rentalOrderItems),
}));

export const rentalOrdersRelations = relations(rentalOrders, ({ one, many }) => ({
  customer: one(users, { fields: [rentalOrders.customerId], references: [users.id] }),
  items: many(rentalOrderItems),
}));

export const rentalOrderItemsRelations = relations(rentalOrderItems, ({ one }) => ({
  order: one(rentalOrders, { fields: [rentalOrderItems.orderId], references: [rentalOrders.id] }),
  rentalItem: one(rentalItems, { fields: [rentalOrderItems.rentalItemId], references: [rentalItems.id] }),
}));
