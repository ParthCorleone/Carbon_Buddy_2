import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { calculateEmissions, CalculatorInput } from '@/lib/calculations';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-default-secret-key';

// --- Helper to get userId from JWT ---
async function getUserIdFromToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded.userId;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserIdFromToken();
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const rawData: CalculatorInput = await request.json();

    // 1. Calculate emissions (category + total)
    const calculated = calculateEmissions(rawData);

    // 2. Prepare DB entry
    // Use today's date at midnight UTC
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const entryData = {
      userId,
      date: today,

      // Raw inputs
      carDistanceKms: rawData.transport.carDistanceKms,
      carType: rawData.transport.carType,
      publicTransportKms: rawData.transport.publicTransportKms,
      flightKms: rawData.transport.flightKms,
      cyclingWalkingKms: rawData.transport.cyclingWalkingKms,
      officeHours: rawData.energy.officeHours,
      electricityBill: rawData.energy.electricityBill,
      emissionFactor: rawData.energy.emissionFactor,
      diet: rawData.food.diet,
      waterBottlesConsumed: rawData.food.waterBottlesConsumed,
      ateLocalOrSeasonalFood: rawData.food.ateLocalOrSeasonalFood,
      pagesPrinted: rawData.digital.pagesPrinted,
      videoCallHours: rawData.digital.videoCallHours,
      cloudStorageGb: rawData.digital.cloudStorageGb,

      // Calculated emissions
      transportEmissions: calculated.transportEmissions,
      energyEmissions: calculated.energyEmissions,
      foodEmissions: calculated.foodEmissions,
      digitalEmissions: calculated.digitalEmissions,
      totalEmissions: calculated.totalEmissions,
    };

    // 3. Upsert (update if entry exists for today, else create)
    const result = await prisma.emissionEntry.upsert({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
      update: entryData,
      create: entryData,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('EMISSIONS_API_ERROR', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
