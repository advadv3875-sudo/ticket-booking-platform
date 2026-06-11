ALTER TABLE `coupons` MODIFY COLUMN `used_count` int NOT NULL DEFAULT 0;--> statement-breakpoint
ALTER TABLE `coupons` MODIFY COLUMN `is_active` boolean NOT NULL DEFAULT true;