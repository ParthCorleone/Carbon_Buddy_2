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
        PETROL: 0.192,       // Average petrol car
        DIESEL: 0.171,       // Average diesel car
        HYBRID: 0.120,
        ELECTRIC: 0.050,     // Based on average grid electricity, not zero
    },
    PUBLIC_TRANSPORT: 0.041, // Average for bus/local train per passenger-km
    FLIGHTS: 0.255,          // Average for domestic short-haul flights per passenger-km
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
    PRINTING_PAGE: 0.004,    // per A4 page
    VIDEO_CALL_HOUR: 0.060,  // Data center and network usage
    CLOUD_STORAGE_GB_PER_DAY: 0.0014 // Simplified daily factor for storing 1GB
};

// --- INTERFACES for input data ---
interface TransportData {
    [x: string]: any;
    carDistanceKms?: number;
    carType?: CarType;
    publicTransportKms?: number;
    flightKms?: number;
}

interface EnergyData {
    [x: string]: any;
    officeHours?: number;
    // The emission factor here is for the electricity grid (kg CO2e per kWh)
    emissionFactor?: number; 
}

interface FoodData {
    diet?: Diet;
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
    const transportEmissions = 
        ((data.transport.carDistanceKms || 0) * (EMISSION_FACTORS_TRANSPORT.CAR[data.transport.carType || 'PETROL'])) +
        ((data.transport.publicTransportKms || 0) * EMISSION_FACTORS_TRANSPORT.PUBLIC_TRANSPORT) +
        ((data.transport.flightKms || 0) * EMISSION_FACTORS_TRANSPORT.FLIGHTS);

    const energyEmissions = 
        (data.energy.officeHours || 0) * EMISSION_FACTORS_ENERGY.AVG_KWH_PER_OFFICE_HOUR * (data.energy.emissionFactor || 0.45); // Using a global average if not provided

    let foodEmissions = 
        (EMISSION_FACTORS_FOOD.DIET[data.food.diet || 'MIXED']) +
        ((data.food.waterBottlesConsumed || 0) * EMISSION_FACTORS_FOOD.WATER_BOTTLE);
        
    if (data.food.ateLocalOrSeasonalFood) {
        foodEmissions *= (1 - EMISSION_FACTORS_FOOD.LOCAL_FOOD_REDUCTION);
    }

    const digitalEmissions = 
        ((data.digital.pagesPrinted || 0) * EMISSION_FACTORS_DIGITAL.PRINTING_PAGE) +
        ((data.digital.videoCallHours || 0) * EMISSION_FACTORS_DIGITAL.VIDEO_CALL_HOUR) +
        ((data.digital.cloudStorageGb || 0) * EMISSION_FACTORS_DIGITAL.CLOUD_STORAGE_GB_PER_DAY);

    const totalEmissions = transportEmissions + energyEmissions + foodEmissions + digitalEmissions;

    return {
        transportEmissions,
        energyEmissions,
        foodEmissions,
        digitalEmissions,
        totalEmissions
    };
}

