-- AlterTable
ALTER TABLE "Tyre" ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "Wheel" ADD COLUMN     "description" TEXT;

-- CreateTable
CREATE TABLE "CartItem" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "productType" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CartItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CartItem_customerId_idx" ON "CartItem"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "CartItem_customerId_productType_productId_key" ON "CartItem"("customerId", "productType", "productId");

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
