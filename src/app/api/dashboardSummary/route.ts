import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import {
  getSundayWeekRange,
  calculateStreak,
  getMonthDateRange,
} from "@/lib/dashboard-helpers";

//const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET as string;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

// Helper to get userId from JWT stored in cookies
async function getUserIdFromToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (typeof decoded === "object" && decoded !== null && "userId" in decoded) {
      return (decoded as jwt.JwtPayload).userId as string;
    }
    return null;
  } catch {
    return null;
  }
}

// // Backfill missing days with averaged data
// async function backfillEmissions(userId: string) {
//   const today = new Date();
//   today.setUTCHours(0, 0, 0, 0);

//   const lastEntry = await prisma.emissionEntry.findFirst({
//     where: { userId },
//     orderBy: { date: "desc" },
//   });

//   if (!lastEntry) return;

//   const lastDate = new Date(lastEntry.date);
//   lastDate.setUTCHours(0, 0, 0, 0);

//   const current = new Date(lastDate);
//   current.setDate(current.getDate() + 1);

//   while (current < today) {
//     const pastEntries = await prisma.emissionEntry.findMany({
//       where: { userId },
//       orderBy: { date: "desc" },
//       take: 6,
//     });

//     if (pastEntries.length === 0) break;

//     const avg = (field: keyof typeof pastEntries[0]) =>
//       pastEntries.reduce((sum, e) => sum + (e[field] as number || 0), 0) /
//       pastEntries.length;

//     await prisma.emissionEntry.create({
//       data: {
//         userId,
//         date: new Date(current),
//         transportEmissions: avg("transportEmissions"),
//         foodEmissions: avg("foodEmissions"),
//         energyEmissions: avg("energyEmissions"),
//         digitalEmissions: avg("digitalEmissions"),
//         totalEmissions: avg("totalEmissions"),
//         autoFilled: true,
//       },
//     });

//     current.setDate(current.getDate() + 1);
//   }
// }

export async function GET() {
  const userId = await getUserIdFromToken();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/jobs/backfill`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: userId,
      secret: process.env.INTERNAL_API_SECRET,
    }),
  });

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Backfill missing days
    //await backfillEmissions(userId);

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const endOfToday = new Date(today);
    endOfToday.setUTCHours(23, 59, 59, 999);

    const [allEntries, thisWeekAggregate, todayEmissionsData] =
      await Promise.all([
        prisma.emissionEntry.findMany({
          where: { userId },
          orderBy: { date: "desc" },
        }),
        prisma.emissionEntry.aggregate({
          where: {
            userId,
            date: getSundayWeekRange(),
          },
          _sum: { totalEmissions: true },
        }),
        prisma.emissionEntry.findFirst({
          where: {
            userId,
            date: {
              gte: today,
              lte: endOfToday,
            },
          },
        }),
      ]);

    const thisWeekEmissions = thisWeekAggregate._sum.totalEmissions || 0;
    const streak = calculateStreak(allEntries);

    const [thisMonthAgg, lastMonthAgg] = await Promise.all([
      prisma.emissionEntry.aggregate({
        where: {
          userId,
          date: getMonthDateRange(0),
        },
        _sum: { totalEmissions: true },
      }),
      prisma.emissionEntry.aggregate({
        where: {
          userId,
          date: getMonthDateRange(-1),
        },
        _sum: { totalEmissions: true },
      }),
    ]);

    const thisMonthTotal = thisMonthAgg._sum.totalEmissions || 0;
    const lastMonthTotal = lastMonthAgg._sum.totalEmissions || 0;

    let monthlyReduction = 0;
    if (lastMonthTotal > 0) {
      monthlyReduction =
        ((lastMonthTotal - thisMonthTotal) / lastMonthTotal) * 100;
    }

    const treesSaved = Math.floor((90 - thisWeekEmissions) / 2);

    const response = {
      userName: user.name,
      summary: {
        thisWeekEmissions,
        monthlyReduction,
        treesSaved,
        streak,
      },
      todayEmissions: {
        transportEmissions: todayEmissionsData?.transportEmissions || 0,
        energyEmissions: todayEmissionsData?.energyEmissions || 0,
        foodEmissions: todayEmissionsData?.foodEmissions || 0,
        digitalEmissions: todayEmissionsData?.digitalEmissions || 0,
        totalEmissions: todayEmissionsData?.totalEmissions || 0,
      },
      allEntries: allEntries.map((e) => ({
        date: e.date,
        totalEmissions: e.totalEmissions,
      })),
      thisMonthTotal,
      lastMonthTotal,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
