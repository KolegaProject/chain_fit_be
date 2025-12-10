/*
  Warnings:

  - You are about to drop the `tutorialvideo` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `tutorialvideo` DROP FOREIGN KEY `TutorialVideo_equipmentId_fkey`;

-- DropForeignKey
ALTER TABLE `tutorialvideo` DROP FOREIGN KEY `TutorialVideo_gymId_fkey`;

-- AlterTable
ALTER TABLE `equipment` ADD COLUMN `videoURL` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `tutorialvideo`;
