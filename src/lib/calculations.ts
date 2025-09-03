// --- TYPE DEFINITIONS ---
// Defining types here makes this module independent from the database schema.
export type CarType = 'PETROL' | 'DIESEL' | 'HYBRID' | 'ELECTRIC';
export type Diet = 'VEGAN' | 'VEGETARIAN' | 'MIXED' | 'HEAVY_MEAT';

// --- EMISSION FACTORS (in kg CO2e) ---
// Sources: EPA, IPCC, and other scientific studies. These are representative averages.

// 1. Transport
const EMISSION_FACTORS_TRANSPORT = {
    // per km
    CAR: {
        PETROL: 0.192,      // Average petrol car
        DIESEL: 0.171,      // Average diesel car
        HYBRID: 0.120,
        ELECTRIC: 0.050,    // Based on average grid electricity, not zero
    },
    PUBLIC_TRANSPORT: 0.041, // Average for bus/local train per passenger-km
    FLIGHTS: 0.255,          // Average for domestic short-haul flights per passenger-km
    CYCLING_WALKING: 0.0005, // Average for cycling/walking per km
};

// 2. Energy
const EMISSION_FACTORS_ENERGY = {
    // Assuming average power consumption for an office worker's equipment (PC, monitor, lights)
    // This is a simplified model.
    AVG_KWH_PER_OFFICE_HOUR: 0.25, // kWh
};

// 3. Food
const EMISSION_FACTORS_FOOD = {
    // daily emissions
    DIET: {
        HEAVY_MEAT: 10.24,
        MIXED: 7.19,
        VEGETARIAN: 3.81,
        VEGAN: 2.89,
    },
    WATER_BOTTLE: 0.082,     // For a 0.5L plastic bottle (production & transport)
    LOCAL_FOOD_REDUCTION: 0.20 // 20% reduction
};

// 4. Digital
const EMISSION_FACTORS_DIGITAL = {
    PRINTING_PAGE: 0.004,       // per A4 page
    VIDEO_CALL_HOUR: 0.060,     // Data center and network usage
    CLOUD_STORAGE_GB_PER_DAY: 0.0014 // Simplified daily factor for storing 1GB
};

// --- INTERFACES for input data ---
interface TransportData {
    carDistanceKms?: number;
    carType?: CarType | null; // Allow null
    publicTransportKms?: number;
    cyclingWalkingKms?: number;
    flightKms?: number;
}

interface EnergyData {
    officeHours?: number;
    // The emission factor here is for the electricity grid (kg CO2e per kWh)
    emissionFactor?: number;
    electricityBill?: number;
}

interface FoodData {
    diet?: Diet | null; // Allow null
    foodConsumed?: number;
    waterBottlesConsumed?: number;
    ateLocalOrSeasonalFood?: boolean;
}

interface DigitalData {
    pagesPrinted?: number;
    videoCallHours?: number;
    cloudStorageGb?: number;
}

export interface CalculatorInput {
    transport: TransportData;
    energy: EnergyData;
    food: FoodData;
    digital: DigitalData;
}

// --- CALCULATION FUNCTIONS ---

export function calculateEmissions(data: CalculatorInput) {
    // --- Transport Emissions ---
    let carEmissions = 0;
    // ✅ FIX: Only calculate if carType and distance are provided and valid.
    if (data.transport.carType && data.transport.carDistanceKms && data.transport.carDistanceKms > 0) {
        carEmissions = data.transport.carDistanceKms * EMISSION_FACTORS_TRANSPORT.CAR[data.transport.carType];
    }
    const transportEmissions =
        carEmissions +
        ((data.transport.publicTransportKms || 0) * EMISSION_FACTORS_TRANSPORT.PUBLIC_TRANSPORT) +
        ((data.transport.flightKms || 0) * EMISSION_FACTORS_TRANSPORT.FLIGHTS) + ((data.transport.cyclingWalkingKms || 0) *
        EMISSION_FACTORS_TRANSPORT.CYCLING_WALKING);

    // --- Energy Emissions ---
    const energyEmissions =
        (data.energy.officeHours || 0) * EMISSION_FACTORS_ENERGY.AVG_KWH_PER_OFFICE_HOUR * (data.energy.emissionFactor || 0.45)+
        ((data.energy.electricityBill || 0)* (data.energy.emissionFactor || 0.35) ); // Using a global average if not provided
        
    // --- Food Emissions ---
    let dietEmissions = 0;
    // ✅ FIX: Only calculate if a diet has been selected.
    if (data.food.diet) {
        dietEmissions = EMISSION_FACTORS_FOOD.DIET[data.food.diet] * (data.food.foodConsumed || 0);
    }
    let foodEmissions =
        dietEmissions +
        ((data.food.waterBottlesConsumed || 0) * EMISSION_FACTORS_FOOD.WATER_BOTTLE);

    if (data.food.ateLocalOrSeasonalFood) {
        foodEmissions *= (1 - EMISSION_FACTORS_FOOD.LOCAL_FOOD_REDUCTION);
    }

    // --- Digital Emissions ---
    const digitalEmissions =
        ((data.digital.pagesPrinted || 0) * EMISSION_FACTORS_DIGITAL.PRINTING_PAGE) +
        ((data.digital.videoCallHours || 0) * EMISSION_FACTORS_DIGITAL.VIDEO_CALL_HOUR) +
        ((data.digital.cloudStorageGb || 0) * EMISSION_FACTORS_DIGITAL.CLOUD_STORAGE_GB_PER_DAY);

    // --- Total ---
    const totalEmissions = transportEmissions + energyEmissions + foodEmissions + digitalEmissions;

    return {
        transportEmissions,
        energyEmissions,
        foodEmissions,
        digitalEmissions,
        totalEmissions
    };
}

