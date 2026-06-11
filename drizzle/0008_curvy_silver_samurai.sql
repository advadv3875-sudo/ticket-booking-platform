CREATE TABLE `rental_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`nameAr` varchar(255) NOT NULL,
	`description` text,
	`descriptionAr` text,
	`rentalCategory` enum('furniture','lighting','tents','decor','audio_visual','catering','stage','other') NOT NULL DEFAULT 'other',
	`pricePerDay` decimal(10,2) NOT NULL,
	`depositAmount` decimal(10,2) DEFAULT '0',
	`currency` varchar(10) NOT NULL DEFAULT 'JOD',
	`stockQuantity` int NOT NULL DEFAULT 1,
	`minRentalDays` int NOT NULL DEFAULT 1,
	`maxRentalDays` int DEFAULT 30,
	`images` json,
	`coverImage` text,
	`features` json,
	`isAvailable` boolean NOT NULL DEFAULT true,
	`isFeatured` boolean NOT NULL DEFAULT false,
	`deliveryIncluded` boolean NOT NULL DEFAULT false,
	`setupIncluded` boolean NOT NULL DEFAULT false,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `rental_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rental_order_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`rentalItemId` int NOT NULL,
	`quantity` int NOT NULL DEFAULT 1,
	`pricePerDay` decimal(10,2) NOT NULL,
	`rentalDays` int NOT NULL,
	`subtotal` decimal(10,2) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `rental_order_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rental_orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderNumber` varchar(30) NOT NULL,
	`customerId` int,
	`customerName` varchar(255) NOT NULL,
	`customerEmail` varchar(320) NOT NULL,
	`customerPhone` varchar(30) NOT NULL,
	`eventType` varchar(100),
	`eventAddress` text,
	`startDate` timestamp NOT NULL,
	`endDate` timestamp NOT NULL,
	`rentalDays` int NOT NULL,
	`subtotal` decimal(10,2) NOT NULL,
	`depositTotal` decimal(10,2) DEFAULT '0',
	`deliveryFee` decimal(10,2) DEFAULT '0',
	`totalAmount` decimal(10,2) NOT NULL,
	`currency` varchar(10) NOT NULL DEFAULT 'JOD',
	`rentalOrderStatus` enum('pending','confirmed','delivered','returned','cancelled') NOT NULL DEFAULT 'pending',
	`rentalPaymentStatus` enum('unpaid','deposit_paid','fully_paid','refunded') NOT NULL DEFAULT 'unpaid',
	`notes` text,
	`adminNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `rental_orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `rental_orders_orderNumber_unique` UNIQUE(`orderNumber`)
);
--> statement-breakpoint
ALTER TABLE `rental_order_items` ADD CONSTRAINT `rental_order_items_orderId_rental_orders_id_fk` FOREIGN KEY (`orderId`) REFERENCES `rental_orders`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `rental_order_items` ADD CONSTRAINT `rental_order_items_rentalItemId_rental_items_id_fk` FOREIGN KEY (`rentalItemId`) REFERENCES `rental_items`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `rental_orders` ADD CONSTRAINT `rental_orders_customerId_users_id_fk` FOREIGN KEY (`customerId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `rental_items_category_idx` ON `rental_items` (`rentalCategory`);--> statement-breakpoint
CREATE INDEX `rental_items_available_idx` ON `rental_items` (`isAvailable`);--> statement-breakpoint
CREATE INDEX `rental_items_featured_idx` ON `rental_items` (`isFeatured`);--> statement-breakpoint
CREATE INDEX `rental_orders_email_idx` ON `rental_orders` (`customerEmail`);--> statement-breakpoint
CREATE INDEX `rental_orders_status_idx` ON `rental_orders` (`rentalOrderStatus`);--> statement-breakpoint
CREATE INDEX `rental_orders_start_date_idx` ON `rental_orders` (`startDate`);