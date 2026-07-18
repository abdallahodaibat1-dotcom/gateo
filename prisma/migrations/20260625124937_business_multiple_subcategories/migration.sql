-- CreateTable
CREATE TABLE `business_subcategories` (
    `id` VARCHAR(191) NOT NULL,
    `businessId` VARCHAR(191) NOT NULL,
    `subcategoryId` VARCHAR(191) NULL,
    `customName` VARCHAR(191) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `business_subcategories_businessId_idx` ON `business_subcategories`(`businessId`);

-- CreateIndex
CREATE INDEX `business_subcategories_subcategoryId_idx` ON `business_subcategories`(`subcategoryId`);

-- AddForeignKey
ALTER TABLE `business_subcategories` ADD CONSTRAINT `business_subcategories_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `businesses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `business_subcategories` ADD CONSTRAINT `business_subcategories_subcategoryId_fkey` FOREIGN KEY (`subcategoryId`) REFERENCES `subcategories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Migrate existing subcategoryId values to the join table
INSERT INTO `business_subcategories` (`id`, `businessId`, `subcategoryId`, `customName`, `sortOrder`, `createdAt`)
SELECT UUID(), `id`, `subcategoryId`, NULL, 0, NOW()
FROM `businesses`
WHERE `subcategoryId` IS NOT NULL;

-- Migrate existing customSubcategory values to the join table
INSERT INTO `business_subcategories` (`id`, `businessId`, `subcategoryId`, `customName`, `sortOrder`, `createdAt`)
SELECT UUID(), `id`, NULL, `customSubcategory`, 1, NOW()
FROM `businesses`
WHERE `customSubcategory` IS NOT NULL AND `customSubcategory` != '';

-- DropForeignKey
ALTER TABLE `businesses` DROP FOREIGN KEY `businesses_subcategoryId_fkey`;

-- DropIndex
DROP INDEX `businesses_subcategoryId_fkey` ON `businesses`;

-- AlterTable
ALTER TABLE `businesses` DROP COLUMN `subcategoryId`,
    DROP COLUMN `customSubcategory`;
