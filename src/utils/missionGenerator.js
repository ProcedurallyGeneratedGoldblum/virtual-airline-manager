import airports from '../data/airports.json';

const CARGO_TYPES = [
    'Medical supplies', 'Island supplies', 'VIP courier', 'Whisky distillery samples',
    'Aircraft Parts', 'Ski Equipment', 'Fresh Seafood', 'Mail', 'Specialized Machinery',
    'E-commerce packages', 'Flowers', 'Urgent documents', 'Laboratory samples'
];

const WEATHER_TYPES = ['VFR', 'MVFR', 'IFR', 'LIFR'];
const HOME_BASES = ['EIWT']; // Weston as the main base

/**
 * Generates a random realistic flight duration string based on distance
 */
const calculateDuration = (distance, speed) => {
    const hours = distance / speed;
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);

    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
};

/**
 * Generates a list of missions for the given fleet
 * @param {Array} fleet - Array of aircraft in the fleet
 * @param {number} missionCountPerAircraft - How many missions to generate per plane
 */
export const generateMissions = (fleet, missionCountPerAircraft = 3) => {
    if (!fleet || fleet.length === 0) return [];

    const missions = [];

    fleet.forEach(aircraft => {
        // Find starting airport based on aircraft location (matches ICAO in some cases)
        let fromAirport;
        const icaoMatch = aircraft.location?.match(/\(([A-Z]{4})\)/);
        if (icaoMatch) {
            fromAirport = airports.find(a => a.icao === icaoMatch[1]);
        }

        if (!fromAirport) {
            // Fallback to random airport
            fromAirport = airports[Math.floor(Math.random() * airports.length)];
        }

        const isAtHomeBase = HOME_BASES.includes(fromAirport.icao);

        // Generate missions for each aircraft
        for (let i = 0; i < missionCountPerAircraft; i++) {
            let toAirport;
            let missionType = 'Standard cargo delivery';
            let priority = Math.random() > 0.8 ? 'urgent' : 'normal';
            let cargoType = CARGO_TYPES[Math.floor(Math.random() * CARGO_TYPES.length)];
            let passengers = Math.random() > 0.5 ? Math.floor(Math.random() * 5) + 1 : 0;

            if (isAtHomeBase) {
                // If at Weston, provide a mix of local and longer regional flights (UK, Wales, Scotland)
                const roll = Math.random();
                if (roll < 0.3) {
                    // Local Irish flight
                    const irishDestinations = airports.filter(a => a.country === 'Ireland' && a.icao !== fromAirport.icao);
                    toAirport = irishDestinations[Math.floor(Math.random() * irishDestinations.length)];
                    missionType = 'Local Irish feeder route';
                } else if (roll < 0.6) {
                    // Flight to Wales or UK West Coast
                    const ukDestinations = airports.filter(a => (a.region === 'Wales' || a.region === 'North West England') && a.icao !== fromAirport.icao);
                    if (ukDestinations.length > 0) {
                        toAirport = ukDestinations[Math.floor(Math.random() * ukDestinations.length)];
                        missionType = 'Cross-channel regional flight';
                    }
                } else {
                    // Longer flight to Scotland or deeper UK
                    const longDestinations = airports.filter(a => (a.region === 'Scottish Highlands' || a.region === 'Northern Ireland' || a.region === 'UK & Ireland') && a.icao !== fromAirport.icao);
                    if (longDestinations.length > 0) {
                        toAirport = longDestinations[Math.floor(Math.random() * longDestinations.length)];
                        missionType = 'Inter-regional hub connection';
                    }
                }
            } else {
                // If not at Weston, offer a chance to return home (Ferry/Return)
                if (Math.random() > 0.6) {
                    toAirport = airports.find(a => a.icao === 'EIWT');
                    missionType = aircraft.status === 'available' ? 'Ferry flight to home base' : 'Return flight to hub';
                    cargoType = 'Empty (Ferry)';
                    passengers = 0;
                    priority = 'normal';
                } else {
                    // Generic flight to another airport in the same region or random
                    const regionalAirports = airports.filter(a => a.country === fromAirport.country && a.icao !== fromAirport.icao);
                    if (regionalAirports.length > 0 && Math.random() > 0.4) {
                        toAirport = regionalAirports[Math.floor(Math.random() * regionalAirports.length)];
                        missionType = 'Regional operations';
                    } else {
                        do {
                            toAirport = airports[Math.floor(Math.random() * airports.length)];
                        } while (toAirport.icao === fromAirport.icao);
                    }
                }
            }

            // Fallback for toAirport if something went wrong
            if (!toAirport) {
                do {
                    toAirport = airports[Math.floor(Math.random() * airports.length)];
                } while (toAirport.icao === fromAirport.icao);
            }

            // Generate random distance (simulated)
            const distance = Math.floor(Math.random() * 300) + 40; // 40-340 nm
            const speed = 120; // Default speed for duration calculation

            missions.push({
                id: `M-${Math.random().toString(36).substr(2, 9)}`,
                flightNumber: `FL${Math.floor(Math.random() * 900) + 100}`,
                aircraft: aircraft.type || aircraft.name,
                status: 'available',
                priority: priority,
                route: {
                    from: fromAirport.name,
                    fromCode: fromAirport.icao,
                    to: toAirport.name,
                    toCode: toAirport.icao
                },
                duration: calculateDuration(distance, speed),
                distance: distance,
                cargo: {
                    type: passengers > 0 ? 'Passengers' : cargoType,
                    passengers: passengers
                },
                weather: WEATHER_TYPES[Math.floor(Math.random() * WEATHER_TYPES.length)],
                notes: missionType + (priority === 'urgent' ? ' - ⚠️ Urgent!' : '')
            });
        }
    });

    return missions;
};
