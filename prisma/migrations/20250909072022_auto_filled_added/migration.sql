-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_EmissionEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    "carDistanceKms" REAL,
    "carType" TEXT DEFAULT 'PETROL',
    "publicTransportKms" REAL,
    "flightKms" REAL,
    "cyclingWalkingKms" REAL,
    "officeHours" REAL,
    "electricityBill" REAL,
    "emissionFactor" REAL,
    "diet" TEXT DEFAULT 'MIXED',
    "foodConsumed" INTEGER,
    "waterBottlesConsumed" INTEGER,
    "ateLocalOrSeasonalFood" BOOLEAN NOT NULL DEFAULT false,
    "pagesPrinted" INTEGER,
    "videoCallHours" REAL,
    "cloudStorageGb" REAL,
    "transportEmissions" REAL NOT NULL DEFAULT 0,
    "energyEmissions" REAL NOT NULL DEFAULT 0,
    "foodEmissions" REAL NOT NULL DEFAULT 0,
    "digitalEmissions" REAL NOT NULL DEFAULT 0,
    "totalEmissions" REAL NOT NULL DEFAULT 0,
    "autoFilled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EmissionEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_EmissionEntry" ("ateLocalOrSeasonalFood", "carDistanceKms", "carType", "cloudStorageGb", "createdAt", "cyclingWalkingKms", "date", "diet", "digitalEmissions", "electricityBill", "emissionFactor", "energyEmissions", "flightKms", "foodConsumed", "foodEmissions", "id", "officeHours", "pagesPrinted", "publicTransportKms", "totalEmissions", "transportEmissions", "updatedAt", "userId", "videoCallHours", "waterBottlesConsumed") SELECT "ateLocalOrSeasonalFood", "carDistanceKms", "carType", "cloudStorageGb", "createdAt", "cyclingWalkingKms", "date", "diet", "digitalEmissions", "electricityBill", "emissionFactor", "energyEmissions", "flightKms", "foodConsumed", "foodEmissions", "id", "officeHours", "pagesPrinted", "publicTransportKms", "totalEmissions", "transportEmissions", "updatedAt", "userId", "videoCallHours", "waterBottlesConsumed" FROM "EmissionEntry";
DROP TABLE "EmissionEntry";
ALTER TABLE "new_EmissionEntry" RENAME TO "EmissionEntry";
CREATE UNIQUE INDEX "EmissionEntry_userId_date_key" ON "EmissionEntry"("userId", "date");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
