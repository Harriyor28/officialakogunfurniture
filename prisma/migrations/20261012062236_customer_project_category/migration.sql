-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CustomerProject" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reference" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "customerUserId" TEXT NOT NULL,
    "categoryId" TEXT,
    "enquiryId" TEXT,
    "quotationId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'CONSULTATION',
    "summary" TEXT,
    "specifications" TEXT,
    "startDate" DATETIME,
    "expectedEndDate" DATETIME,
    "progressPercent" INTEGER NOT NULL DEFAULT 0,
    "nextMilestone" TEXT,
    "internalNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CustomerProject_customerUserId_fkey" FOREIGN KEY ("customerUserId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CustomerProject_enquiryId_fkey" FOREIGN KEY ("enquiryId") REFERENCES "Enquiry" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "CustomerProject_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES "Quotation" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "CustomerProject_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "FurnitureCategory" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_CustomerProject" ("categoryId", "createdAt", "customerUserId", "enquiryId", "expectedEndDate", "id", "internalNotes", "nextMilestone", "progressPercent", "quotationId", "reference", "specifications", "startDate", "status", "summary", "title", "updatedAt") SELECT "categoryId", "createdAt", "customerUserId", "enquiryId", "expectedEndDate", "id", "internalNotes", "nextMilestone", "progressPercent", "quotationId", "reference", "specifications", "startDate", "status", "summary", "title", "updatedAt" FROM "CustomerProject";
DROP TABLE "CustomerProject";
ALTER TABLE "new_CustomerProject" RENAME TO "CustomerProject";
CREATE UNIQUE INDEX "CustomerProject_reference_key" ON "CustomerProject"("reference");
CREATE UNIQUE INDEX "CustomerProject_quotationId_key" ON "CustomerProject"("quotationId");
CREATE INDEX "CustomerProject_customerUserId_idx" ON "CustomerProject"("customerUserId");
CREATE INDEX "CustomerProject_status_idx" ON "CustomerProject"("status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
