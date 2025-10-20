/*
  Warnings:

  - You are about to drop the column `experience` on the `application` table. All the data in the column will be lost.
  - You are about to drop the column `score` on the `application` table. All the data in the column will be lost.
  - You are about to drop the column `avatar` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `application` DROP COLUMN `experience`,
    DROP COLUMN `score`;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `avatar`;
