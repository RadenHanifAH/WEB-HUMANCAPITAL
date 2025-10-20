-- AlterTable
ALTER TABLE `application` ADD COLUMN `experience` VARCHAR(191) NULL,
    ADD COLUMN `score` INTEGER NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `avatar` VARCHAR(191) NULL;
