import aircraftTypes from '../data/aircraftTypes.json';

// Constants
const FUEL_PRICE_PER_GALLON = 6.50; // Average Avgas/Jet-A blend price
const LANDING_FEE_BASE = 50; // Small airport base
const PILOT_HOURLY_RATE = 75; // Average commercial pilot rate

/**
 * Calculates the financial breakdown for a specific flight and aircraft.
 * @param {Object} flight - The flight object (distance, cargo, etc.)
 * @param {Object} aircraft - The aircraft fleet object (registration, type, etc.)
 * @returns {Object} - Financial breakdown { revenue, fuelCost, landingFee, pilotPay, maintenanceReserve, totalCost, estimatedProfit }
 */
export const calculateFlightFinance = (flight, aircraft) => {
    if (!flight || !aircraft) return null;

    // 1. Get Aircraft Performance Data
    // Try to find exact type match, or fallback to similar category
    const typeData = aircraftTypes.find(t => t.name === aircraft.type) ||
        aircraftTypes.find(t => t.category === aircraft.category) ||
        { specs: { fuel_burn: 15, maintenance_cost_per_hour: 50, cruise: "120 kts" } }; // Fallback

    const fuelBurn = typeData.specs.fuel_burn || 15;
    const maintCostPerHour = typeData.specs.maintenance_cost_per_hour || 50;
    const cruiseSpeed = parseInt(typeData.specs.cruise) || 120; // e.g., "145 kts" -> 145

    // 2. Calculate Flight Metrics
    const distance = flight.distance || 0;
    // Estimated flight time in hours (Distance / Speed) + 0.5 (Taxi/Takeoff/Landing buffer)
    const flightTimeHours = (distance / cruiseSpeed) + 0.3;

    // 3. Calculate Expenses
    const fuelCost = Math.round(flightTimeHours * fuelBurn * FUEL_PRICE_PER_GALLON);
    const pilotPay = Math.round(flightTimeHours * PILOT_HOURLY_RATE);
    const maintenanceReserve = Math.round(flightTimeHours * maintCostPerHour);

    // Landing fees: Higher for "Urgent" (assuming bigger airports?) or just standard
    // Could simulate based on ICAO code length, but let's keep it simple
    const landingFee = flight.route?.toCode && flight.route.toCode.length === 4 ? LANDING_FEE_BASE * 1.5 : LANDING_FEE_BASE;

    const totalCost = fuelCost + pilotPay + maintenanceReserve + landingFee;

    // 4. Calculate Revenue
    let revenue = 0;

    // Determine Flight Type (Logic based on cargo/notes)
    const isPassenger = flight.cargo.passengers > 0;
    const isCargo = !isPassenger && flight.cargo.type !== 'Empty' && flight.cargo.type !== 'Ferry';
    const isMission = flight.priority === 'urgent';

    if (isPassenger) {
        // Ticket price calculation: Base + Distance Factor
        // Short flights per mile is higher
        const ticketPrice = 50 + (distance * 1.5);
        revenue = Math.round(flight.cargo.passengers * ticketPrice);
    } else if (isCargo) {
        // Cargo logic: e.g. "Medical supplies" pays more than "Mail"
        // We treat "cargo" object as 1 unit of cargo for now unless weight specified
        // Default rate $10 per nm for typical load?
        const baseRate = isMission ? 15 : 8; // $/nm
        revenue = Math.round(distance * baseRate);
    } else {
        // Ferry / Empty / Non-revenue
        revenue = 0;
    }

    // Bonus for urgent flights
    if (isMission && revenue > 0) {
        revenue = Math.round(revenue * 1.2);
    }

    // 5. Result
    return {
        revenue,
        expenses: {
            fuel: fuelCost,
            fees: Math.round(landingFee),
            pilot: pilotPay,
            maintenance: maintenanceReserve
        },
        totalCost: Math.round(totalCost),
        profit: Math.round(revenue - totalCost),
        flightTime: flightTimeHours.toFixed(1)
    };
};

/**
 * Format currency helper
 */
export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
    }).format(amount);
};
