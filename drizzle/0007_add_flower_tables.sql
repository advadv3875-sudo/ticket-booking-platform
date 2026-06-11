CREATE TABLE `flower_orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderNumber` varchar(30) NOT NULL,
	`customerId` int,
	`customerName` varchar(255) NOT NULL,
	`customerEmail` varchar(320) NOT NULL,
	`customerPhone` varchar(30),
	`deliveryType` enum('pickup','delivery') NOT NULL DEFAULT 'delivery',
	`deliveryAddress` text,
	`deliveryCity` varchar(100),
	`deliveryDate` timestamp,
	`deliveryNotes` text,
	`giftMessage` text,
	`recipientName` varchar(255),
	`items` json NOT NULL,
	`subtotal` decimal(10,2) NOT NULL,
	`deliveryFee` decimal(10,2) NOT NULL DEFAULT '0',
	`discountAmount` decimal(10,2) DEFAULT '0',
	`totalAmount` decimal(10,2) NOT NULL,
	`currency` enum('JOD','USD','EUR','AED','SAR') NOT NULL DEFAULT 'JOD',
	`paymentMethod` enum('cash_on_delivery','bank_transfer','paypal','stripe','other') NOT NULL DEFAULT 'cash_on_delivery',
	`paymentStatus` enum('pending','paid','failed','refunded') NOT NULL DEFAULT 'pending',
	`status` enum('pending','confirmed','preparing','out_for_delivery','delivered','cancelled') NOT NULL DEFAULT 'pending',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `flower_orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `flower_orders_orderNumber_unique` UNIQUE(`orderNumber`)
);
--> statement-breakpoint
CREATE TABLE `flower_products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`nameAr` varchar(255),
	`slug` varchar(255) NOT NULL,
	`description` text,
	`descriptionAr` text,
	`category` enum('natural','artificial','bouquet','arrangement','wreath','gift_box','other') NOT NULL DEFAULT 'natural',
	`flowerType` enum('roses','tulips','orchids','lilies','sunflowers','mixed','artificial_silk','artificial_foam','other') NOT NULL DEFAULT 'roses',
	`price` decimal(10,2) NOT NULL,
	`originalPrice` decimal(10,2),
	`currency` enum('JOD','USD','EUR','AED','SAR') NOT NULL DEFAULT 'JOD',
	`coverImage` text,
	`images` json,
	`stockQuantity` int NOT NULL DEFAULT 0,
	`isAvailable` boolean NOT NULL DEFAULT true,
	`isFeatured` boolean NOT NULL DEFAULT false,
	`tags` json,
	`occasionTags` json,
	`colors` json,
	`sortOrder` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `flower_products_id` PRIMARY KEY(`id`),
	CONSTRAINT `flower_products_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
ALTER TABLE `flower_orders` ADD CONSTRAINT `flower_orders_customerId_users_id_fk` FOREIGN KEY (`customerId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `idx_flower_orders_email` ON `flower_orders` (`customerEmail`);--> statement-breakpoint
CREATE INDEX `idx_flower_orders_status` ON `flower_orders` (`status`);--> statement-breakpoint
CREATE INDEX `idx_flower_orders_created_at` ON `flower_orders` (`createdAt`);--> statement-breakpoint
CREATE INDEX `idx_flower_products_category` ON `flower_products` (`category`);--> statement-breakpoint
CREATE INDEX `idx_flower_products_available` ON `flower_products` (`isAvailable`);--> statement-breakpoint
CREATE INDEX `idx_flower_products_featured` ON `flower_products` (`isFeatured`);--> statement-breakpoint
CREATE INDEX `idx_flower_products_cat_avail` ON `flower_products` (`category`,`isAvailable`);