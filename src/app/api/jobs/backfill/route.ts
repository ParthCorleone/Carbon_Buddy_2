// app/api/jobs/backfill/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// This is the SAME backfill logic from your original code, now isolated.
async function backfillEmissions(userId: string) {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const lastEntry = await prisma.emissionEntry.findFirst({
    where: { userId },
    orderBy: { date: "desc" },
  });

  if (!lastEntry) return;

  const lastDate = new Date(lastEntry.date);
  lastDate.setUTCHours(0, 0, 0, 0);

  if(lastDate >= today) return;

  // Optimization: Fetch the initial 6 entries once before the loop.
  const pastEntries = await prisma.emissionEntry.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    take: 6,
  });

  if (pastEntries.length === 0) return;

  const avg = (field: keyof typeof pastEntries[0]) =>
    pastEntries.reduce((sum, e) => sum + (Number(e[field]) || 0), 0) /
    pastEntries.length;

  const avgData = {
    transportEmissions: avg("transportEmissions"),
    foodEmissions: avg("foodEmissions"),
    energyEmissions: avg("energyEmissions"),
    digitalEmissions: avg("digitalEmissions"),
    totalEmissions: avg("totalEmissions"),
  };
  
  const entriesToCreate = [];
  const current = new Date(lastDate);
  current.setDate(current.getDate() + 1);

  while (current < today) {
    entriesToCreate.push({
      userId,
      date: new Date(current),
      ...avgData,
      autoFilled: true,
    });
    current.setDate(current.getDate() + 1);
  }

  // Optimization: Create all missing entries in a single database transaction.
  if (entriesToCreate.length > 0) {
    await prisma.emissionEntry.createMany({
      data: entriesToCreate,
      skipDuplicates: true, // Prevents errors if an entry somehow already exists
    });
  }
}

export async function POST(request: Request) {
  const { userId, secret } = await request.json();

  // 🔐 Security Check: Protect the endpoint
  if (secret !== process.env.INTERNAL_API_SECRET) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (!userId) {
    return NextResponse.json({ message: "User ID is required" }, { status: 400 });
  }

  try {
    // We can run this with await here because the client is not waiting for this response.
    await backfillEmissions(userId);
    return NextResponse.json({ message: "Backfill process completed." });
  } catch (error) {
    console.error("Backfill Job Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error during backfill" },
      { status: 500 }
    );
  }
}