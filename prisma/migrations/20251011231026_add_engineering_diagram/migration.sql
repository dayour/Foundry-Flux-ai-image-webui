-- CreateTable
CREATE TABLE "EngineeringDiagram" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "elements" TEXT,
    "annotations" TEXT,
    "config" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "svgUrl" TEXT,
    "dxfUrl" TEXT,
    "pdfUrl" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "tags" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EngineeringDiagram_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "EngineeringDiagram_userId_idx" ON "EngineeringDiagram"("userId");

-- CreateIndex
CREATE INDEX "EngineeringDiagram_type_idx" ON "EngineeringDiagram"("type");

-- CreateIndex
CREATE INDEX "EngineeringDiagram_category_idx" ON "EngineeringDiagram"("category");
