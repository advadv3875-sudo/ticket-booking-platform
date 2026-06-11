CREATE TABLE `announcement_banners` (
	`id` int AUTO_INCREMENT NOT NULL,
	`message` text NOT NULL,
	`messageAr` text,
	`type` enum('info','success','warning','promo') NOT NULL DEFAULT 'info',
	`ctaText` varchar(100),
	`ctaUrl` varchar(500),
	`isActive` boolean NOT NULL DEFAULT true,
	`startsAt` timestamp,
	`endsAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `announcement_banners_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`recipientEmail` varchar(320),
	`recipientType` enum('customer','admin','organizer') NOT NULL,
	`type` enum('booking_confirmed','payment_success','payment_failed','event_reminder_1day','event_reminder_1week','low_stock','sold_out','new_booking_admin','custom') NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`orderId` int,
	`eventId` int,
	`channel` enum('email','push','in_app','sms') NOT NULL,
	`status` enum('pending','sent','failed','read') NOT NULL DEFAULT 'pending',
	`sentAt` timestamp,
	`readAt` timestamp,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `push_subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`endpoint` text NOT NULL,
	`p256dh` text NOT NULL,
	`auth` varchar(255) NOT NULL,
	`userEmail` varchar(320),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `push_subscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_orderId_orders_id_fk` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_eventId_events_id_fk` FOREIGN KEY (`eventId`) REFERENCES `events`(`id`) ON DELETE no action ON UPDATE no action;