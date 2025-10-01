/*
  Warnings:

  - You are about to drop the column `barberId` on the `Service` table. All the data in the column will be lost.
  - Added the required column `barberId` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `barbershopId` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `barbershopId` to the `Service` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Service" DROP CONSTRAINT "Service_barberId_fkey";

-- AlterTable
ALTER TABLE "public"."Booking" ADD COLUMN     "barberId" TEXT NOT NULL,
ADD COLUMN     "barbershopId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Service" DROP COLUMN "barberId",
ADD COLUMN     "barbershopId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "public"."_BarberServices" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_BarberServices_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_BarberServices_B_index" ON "public"."_BarberServices"("B");

-- AddForeignKey
ALTER TABLE "public"."Service" ADD CONSTRAINT "Service_barbershopId_fkey" FOREIGN KEY ("barbershopId") REFERENCES "public"."Barbershop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Booking" ADD CONSTRAINT "Booking_barberId_fkey" FOREIGN KEY ("barberId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Booking" ADD CONSTRAINT "Booking_barbershopId_fkey" FOREIGN KEY ("barbershopId") REFERENCES "public"."Barbershop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_BarberServices" ADD CONSTRAINT "_BarberServices_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_BarberServices" ADD CONSTRAINT "_BarberServices_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
