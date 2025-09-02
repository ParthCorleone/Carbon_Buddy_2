-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "EmissionEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    "carDistanceKms" REAL,
    "carType" TEXT,
    "publicTransportKms" REAL,
    "flightKms" REAL,
    "cyclingWalkingKms" REAL,
    "officeHours" REAL,
    "electricityBill" REAL,
    "emissionFactor" REAL,
    "diet" TEXT,
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EmissionEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "EmissionEntry_userId_date_key" ON "EmissionEntry"("userId", "date");
