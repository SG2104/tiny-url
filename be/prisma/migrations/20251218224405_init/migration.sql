-- AlterTable
ALTER TABLE "urls" ADD COLUMN     "user_id" INTEGER;

-- CreateIndex
CREATE INDEX "idx_urls_user_id" ON "urls"("user_id");

-- AddForeignKey
ALTER TABLE "urls" ADD CONSTRAINT "urls_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
