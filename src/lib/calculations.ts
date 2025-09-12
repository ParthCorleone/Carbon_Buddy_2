export type CarType = 'PETROL' | 'DIESEL' | 'HYBRID' | 'ELECTRIC';
export type Diet = 'VEGAN' | 'VEGETARIAN' | 'MIXED' | 'HEAVY_MEAT';

// Sources: EPA, IPCC, and other scientific studies. These are representative averages.

// 1. Transport
const EMISSION_FACTORS_TRANSPORT = {
    CAR: {
        PETROL: 0.179,
        DIESEL: 0.173,
        HYBRID: 0.126,
        ELECTRIC: 0.035,
    },
    PUBLIC_TRANSPORT: 0.015,
    FLIGHTS: 0.121,    
    CYCLING_WALKING: 0.0005,
};

const EMISSION_FACTORS_ENERGY = {
    AVG_KWH_PER_OFFICE_HOUR: 0.25,
};

const EMISSION_FACTORS_FOOD = {
    DIET: {
        HEAVY_MEAT: 13.88,
        MIXED: 3.26,
        VEGETARIAN: 1.80,
        VEGAN: 1.35,
    },
    WATER_BOTTLE: 0.021,
    LOCAL_FOOD_REDUCTION: 0.12
};

const EMISSION_FACTORS_DIGITAL = {
    PRINTING_PAGE: 0.005,
    VIDEO_CALL_HOUR: 0.060,
    CLOUD_STORAGE_GB_PER_DAY: 0.0003
};

interface TransportData {
    carDistanceKms?: number;
    carType?: CarType | null;
    publicTransportKms?: number;
    cyclingWalkingKms?: number;
    flightKms?: number;
}

interface EnergyData {
    officeHours?: number;
    emissionFactor?: number;
    electricityBill?: number;
}

interface FoodData {
    diet?: Diet | null;
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


export function calculateEmissions(data: CalculatorInput) {
    let carEmissions = 0;
    if (data.transport.carType && data.transport.carDistanceKms && data.transport.carDistanceKms > 0) {
        carEmissions = data.transport.carDistanceKms * EMISSION_FACTORS_TRANSPORT.CAR[data.transport.carType];
    }
    const transportEmissions =
        carEmissions +
        ((data.transport.publicTransportKms || 0) * EMISSION_FACTORS_TRANSPORT.PUBLIC_TRANSPORT) +
        ((data.transport.flightKms || 0) * EMISSION_FACTORS_TRANSPORT.FLIGHTS) + ((data.transport.cyclingWalkingKms || 0) *
        EMISSION_FACTORS_TRANSPORT.CYCLING_WALKING);

    const energyEmissions =
        (data.energy.officeHours || 0) * EMISSION_FACTORS_ENERGY.AVG_KWH_PER_OFFICE_HOUR * (data.energy.emissionFactor || 0.82)+
        ((data.energy.electricityBill || 0)* (data.energy.emissionFactor || 0.82) );

    let dietEmissions = 0;
    if (data.food.diet) {
        dietEmissions = EMISSION_FACTORS_FOOD.DIET[data.food.diet] * (data.food.foodConsumed || 0);
    }
    let foodEmissions =
        dietEmissions +
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

