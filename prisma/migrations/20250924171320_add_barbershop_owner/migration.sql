/*
  Warnings:

  - A unique constraint covering the columns `[ownerId]` on the table `Barbershop` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `ownerId` to the `Barbershop` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Barbershop" ADD COLUMN     "ownerId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Barbershop_ownerId_key" ON "public"."Barbershop"("ownerId");

-- AddForeignKey
ALTER TABLE "public"."Barbershop" ADD CONSTRAINT "Barbershop_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
