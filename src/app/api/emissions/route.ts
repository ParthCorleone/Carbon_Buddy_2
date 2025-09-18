import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { calculateEmissions, CalculatorInput } from '@/lib/calculations';

//const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET as string;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET must be defined in environment variables");
}

// Helper to extract userId from JWT token stored in cookie
async function getUserIdFromToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
    return decoded && typeof decoded === 'object' ? decoded.userId as string : null;
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

    // Calculate emissions based on the input
    const calculated = calculateEmissions(rawData);

    // Use today's date at midnight UTC
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // Prepare entry data, ensure alignment with PostgreSQL types
    const entryData = {
      userId,                   // UUID in PostgreSQL
      date: today,               // timestamp without time zone

      // Raw inputs (nullable fields can be undefined if not provided)
      carDistanceKms: rawData.transport.carDistanceKms ?? null,
      carType: rawData.transport.carType ?? null,
      publicTransportKms: rawData.transport.publicTransportKms ?? null,
      flightKms: rawData.transport.flightKms ?? null,
      cyclingWalkingKms: rawData.transport.cyclingWalkingKms ?? null,
      officeHours: rawData.energy.officeHours ?? null,
      electricityBill: rawData.energy.electricityBill ?? null,
      emissionFactor: rawData.energy.emissionFactor ?? null,
      diet: rawData.food.diet ?? null,
      foodConsumed: rawData.food.foodConsumed ?? null,
      waterBottlesConsumed: rawData.food.waterBottlesConsumed ?? null,
      ateLocalOrSeasonalFood: typeof rawData.food.ateLocalOrSeasonalFood === 'boolean' ? rawData.food.ateLocalOrSeasonalFood : undefined,
      pagesPrinted: rawData.digital.pagesPrinted ?? null,
      videoCallHours: rawData.digital.videoCallHours ?? null,
      cloudStorageGb: rawData.digital.cloudStorageGb ?? null,

      // Calculated emissions (default to 0 if undefined)
      transportEmissions: calculated.transportEmissions ?? 0,
      energyEmissions: calculated.energyEmissions ?? 0,
      foodEmissions: calculated.foodEmissions ?? 0,
      digitalEmissions: calculated.digitalEmissions ?? 0,
      totalEmissions: calculated.totalEmissions ?? 0,
    };

    // Upsert the entry for today's date
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
