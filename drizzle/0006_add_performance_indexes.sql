CREATE INDEX `idx_events_status` ON `events` (`status`);--> statement-breakpoint
CREATE INDEX `idx_events_start_date` ON `events` (`startDate`);--> statement-breakpoint
CREATE INDEX `idx_events_is_featured` ON `events` (`isFeatured`);--> statement-breakpoint
CREATE INDEX `idx_events_status_featured_date` ON `events` (`status`,`isFeatured`,`startDate`);--> statement-breakpoint
CREATE INDEX `idx_notifications_status` ON `notifications` (`status`);--> statement-breakpoint
CREATE INDEX `idx_notifications_type_status` ON `notifications` (`type`,`status`);--> statement-breakpoint
CREATE INDEX `idx_notifications_recipient_type` ON `notifications` (`recipientType`);--> statement-breakpoint
CREATE INDEX `idx_orders_customer_email` ON `orders` (`customerEmail`);--> statement-breakpoint
CREATE INDEX `idx_orders_status` ON `orders` (`status`);--> statement-breakpoint
CREATE INDEX `idx_orders_created_at` ON `orders` (`createdAt`);--> statement-breakpoint
CREATE INDEX `idx_orders_gateway_order_id` ON `orders` (`gatewayOrderId`);--> statement-breakpoint
CREATE INDEX `idx_orders_status_created_at` ON `orders` (`status`,`createdAt`);--> statement-breakpoint
CREATE INDEX `idx_ticket_types_event_active` ON `ticket_types` (`eventId`,`isActive`,`sortOrder`);--> statement-breakpoint
CREATE INDEX `idx_tickets_status` ON `tickets` (`status`);--> statement-breakpoint
CREATE INDEX `idx_tickets_holder_email` ON `tickets` (`holderEmail`);