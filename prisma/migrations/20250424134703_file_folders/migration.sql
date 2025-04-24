/*
  Warnings:

  - Added the required column `storage_path` to the `files` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storage_path` to the `folders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "files" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "storage_path" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "folders" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "storage_path" TEXT NOT NULL;
