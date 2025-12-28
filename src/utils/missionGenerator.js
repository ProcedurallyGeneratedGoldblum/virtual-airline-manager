import airports from '../data/airports.json';

const CARGO_TYPES = [
    'Medical supplies', 'Island supplies', 'VIP courier', 'Whisky distillery samples',
    'Aircraft Parts', 'Ski Equipment', 'Fresh Seafood', 'Mail', 'Specialized Machinery',
    'E-commerce packages', 'Flowers', 'Urgent documents', 'Laboratory samples'
];

const WEATHER_TYPES = ['VFR', 'MVFR', 'IFR', 'LIFR'];

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
export const generateMissions = (fleet, missionCountPerAircraft = 2) => {
    if (!fleet || fleet.length === 0) return [];

    const missions = [];

    fleet.forEach(aircraft => {
        // Generate missions for each aircraft
        for (let i = 0; i < missionCountPerAircraft; i++) {
            // Find starting airport based on aircraft location (matches ICAO in some cases)
            // Current location format: "City, Country (ICAO)" or just "Unknown"
            let fromAirport;
            const icaoMatch = aircraft.location?.match(/\(([A-Z]{4})\)/);
            if (icaoMatch) {
                fromAirport = airports.find(a => a.icao === icaoMatch[1]);
            }

            if (!fromAirport) {
                // Fallback to random airport
                fromAirport = airports[Math.floor(Math.random() * airports.length)];
            }

            // Pick random destination (different from origin)
            let toAirport;
            do {
                toAirport = airports[Math.floor(Math.random() * airports.length)];
            } while (toAirport.icao === fromAirport.icao);

            // Generate random distance (simulated)
            const distance = Math.floor(Math.random() * 400) + 50; // 50-450 nm
            const speed = 120; // Default speed for duration calculation

            const priority = Math.random() > 0.8 ? 'urgent' : 'normal';
            const passengers = Math.random() > 0.5 ? Math.floor(Math.random() * 5) + 1 : 0;

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
                    type: passengers > 0 ? 'Passengers' : CARGO_TYPES[Math.floor(Math.random() * CARGO_TYPES.length)],
                    passengers: passengers
                },
                weather: WEATHER_TYPES[Math.floor(Math.random() * WEATHER_TYPES.length)],
                notes: priority === 'urgent' ? '⚠️ High priority mission - time sensitive' : 'Standard cargo delivery'
            });
        }
    });

    return missions;
};
