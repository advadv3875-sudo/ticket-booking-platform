CREATE TABLE `events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizerId` int,
	`title` varchar(255) NOT NULL,
	`titleAr` varchar(255),
	`slug` varchar(255) NOT NULL,
	`description` text,
	`descriptionAr` text,
	`category` enum('conference','exhibition','wedding','concert','corporate','cultural','sports','other') NOT NULL DEFAULT 'other',
	`status` enum('draft','published','cancelled','completed') NOT NULL DEFAULT 'draft',
	`coverImage` text,
	`galleryImages` json DEFAULT ('[]'),
	`venue` varchar(500),
	`venueAr` varchar(500),
	`city` varchar(100) DEFAULT 'Amman',
	`country` varchar(100) DEFAULT 'Jordan',
	`startDate` timestamp NOT NULL,
	`endDate` timestamp NOT NULL,
	`currency` enum('JOD','EUR','USD','AED','SAR','GBP') NOT NULL DEFAULT 'JOD',
	`isFeatured` boolean DEFAULT false,
	`totalCapacity` int DEFAULT 0,
	`soldCount` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `events_id` PRIMARY KEY(`id`),
	CONSTRAINT `events_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`invoiceNumber` varchar(50) NOT NULL,
	`pdfUrl` text,
	`pdfKey` varchar(255),
	`emailSentAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `invoices_id` PRIMARY KEY(`id`),
	CONSTRAINT `invoices_invoiceNumber_unique` UNIQUE(`invoiceNumber`)
);
--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`ticketTypeId` int NOT NULL,
	`quantity` int NOT NULL,
	`unitPrice` decimal(10,2) NOT NULL,
	`totalPrice` decimal(10,2) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `order_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderNumber` varchar(50) NOT NULL,
	`customerId` int,
	`customerEmail` varchar(320) NOT NULL,
	`customerFullName` varchar(255) NOT NULL,
	`customerPhone` varchar(30),
	`eventId` int NOT NULL,
	`currency` enum('JOD','EUR','USD','AED','SAR','GBP') NOT NULL,
	`subtotalAmount` decimal(10,2) NOT NULL,
	`feesAmount` decimal(10,2) DEFAULT '0',
	`totalAmount` decimal(10,2) NOT NULL,
	`paymentMethod` enum('card','unionpay','sepa','payomentic','2checkout','applepay','googlepay','paypal','alipay','wechatpay','telr','hyperpaywallet','amex','bank_transfer') NOT NULL,
	`status` enum('pending_payment','pending_settlement','paid','failed','expired','cancelled','refunded') NOT NULL DEFAULT 'pending_payment',
	`gatewayOrderId` varchar(255),
	`gatewayPaymentUrl` text,
	`notes` text,
	`expiresAt` timestamp,
	`paidAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `orders_orderNumber_unique` UNIQUE(`orderNumber`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`gatewayTransactionId` varchar(255),
	`gateway` varchar(50) NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`currency` varchar(3) NOT NULL,
	`status` enum('pending','confirmed','failed','refunded') NOT NULL,
	`gatewayResponse` text,
	`webhookData` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payments_id` PRIMARY KEY(`id`),
	CONSTRAINT `payments_gatewayTransactionId_unique` UNIQUE(`gatewayTransactionId`)
);
--> statement-breakpoint
CREATE TABLE `ticket_types` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`nameAr` varchar(255),
	`description` text,
	`descriptionAr` text,
	`price` decimal(10,2) NOT NULL,
	`currency` enum('JOD','EUR','USD','AED','SAR','GBP') NOT NULL DEFAULT 'JOD',
	`totalQuantity` int NOT NULL,
	`soldQuantity` int NOT NULL DEFAULT 0,
	`heldQuantity` int NOT NULL DEFAULT 0,
	`maxPerOrder` int DEFAULT 10,
	`isActive` boolean DEFAULT true,
	`sortOrder` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ticket_types_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tickets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ticketNumber` varchar(50) NOT NULL,
	`orderId` int NOT NULL,
	`orderItemId` int NOT NULL,
	`ticketTypeId` int NOT NULL,
	`eventId` int NOT NULL,
	`holderName` varchar(255),
	`holderEmail` varchar(320),
	`qrCode` text,
	`qrCodeData` varchar(500),
	`status` enum('active','used','cancelled','expired') NOT NULL DEFAULT 'active',
	`checkedInAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tickets_id` PRIMARY KEY(`id`),
	CONSTRAINT `tickets_ticketNumber_unique` UNIQUE(`ticketNumber`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','organizer','admin') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(30);--> statement-breakpoint
ALTER TABLE `events` ADD CONSTRAINT `events_organizerId_users_id_fk` FOREIGN KEY (`organizerId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_orderId_orders_id_fk` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_orderId_orders_id_fk` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_ticketTypeId_ticket_types_id_fk` FOREIGN KEY (`ticketTypeId`) REFERENCES `ticket_types`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `orders` ADD CONSTRAINT `orders_customerId_users_id_fk` FOREIGN KEY (`customerId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `orders` ADD CONSTRAINT `orders_eventId_events_id_fk` FOREIGN KEY (`eventId`) REFERENCES `events`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payments` ADD CONSTRAINT `payments_orderId_orders_id_fk` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ticket_types` ADD CONSTRAINT `ticket_types_eventId_events_id_fk` FOREIGN KEY (`eventId`) REFERENCES `events`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tickets` ADD CONSTRAINT `tickets_orderId_orders_id_fk` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tickets` ADD CONSTRAINT `tickets_orderItemId_order_items_id_fk` FOREIGN KEY (`orderItemId`) REFERENCES `order_items`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tickets` ADD CONSTRAINT `tickets_ticketTypeId_ticket_types_id_fk` FOREIGN KEY (`ticketTypeId`) REFERENCES `ticket_types`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tickets` ADD CONSTRAINT `tickets_eventId_events_id_fk` FOREIGN KEY (`eventId`) REFERENCES `events`(`id`) ON DELETE no action ON UPDATE no action;