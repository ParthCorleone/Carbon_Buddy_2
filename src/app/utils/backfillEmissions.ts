import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function backfillEmissions(userId: string) {
  const today = new Date();
  today.setHours(0,0,0,0);

  // Get last entry
  const lastEntry = await prisma.emissionEntry.findFirst({
    where: { userId },
    orderBy: { date: "desc" },
  });

  let lastDate = lastEntry ? new Date(lastEntry.date) : null;
  if (lastDate) lastDate.setHours(0,0,0,0);

  // If no entries exist, nothing to backfill yet
  if (!lastDate) return;

  // Calculate missing days (up to yesterday)
  let current = new Date(lastDate);
  current.setDate(current.getDate() + 1);

  while (current < today) {
    // fetch past 5-6 entries to compute avg
    const pastEntries = await prisma.emissionEntry.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 6,
    });

    if (pastEntries.length === 0) break;

    const avg = (field: keyof typeof pastEntries[0]) =>
      pastEntries.reduce((sum, e) => sum + (e[field] as number), 0) / pastEntries.length;

    await prisma.emissionEntry.create({
      data: {
        userId,
        date: new Date(current),
        transportEmissions: avg("transportEmissions"),
        foodEmissions: avg("foodEmissions"),
        energyEmissions: avg("energyEmissions"),
        digitalEmissions: avg("digitalEmissions"),
        totalEmissions: avg("totalEmissions"),
      },
    });

    current.setDate(current.getDate() + 1);
  }
}
