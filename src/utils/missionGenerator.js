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
 * @param {number} missionCountPerAircraft - How many missions to generate per aircraft
 */
export const generateMissions = (fleet, missionCountPerAircraft = 10) => {
    if (!fleet || fleet.length === 0) return [];

    const missions = [];

    // Total missions requested by user is 20-30. 
    // If we have 3 aircraft, 10 each gives 30.

    fleet.forEach((aircraft, aircraftIdx) => {
        // Find starting airport based on aircraft location
        let fromAirport;
        const icaoMatch = aircraft.location?.match(/\(([A-Z]{4})\)/);
        if (icaoMatch) {
            fromAirport = airports.find(a => a.icao === icaoMatch[1]);
        }

        if (!fromAirport) {
            // Fallback to random airport IF for some reason location isn't set
            fromAirport = airports[Math.floor(Math.random() * airports.length)];
        }

        const isAtHomeBase = HOME_BASES.includes(fromAirport.icao);

        // Generate missions for each aircraft
        for (let i = 0; i < missionCountPerAircraft; i++) {
            let toAirport;
            let missionType = 'Standard cargo delivery';
            let priority = Math.random() > 0.85 ? 'urgent' : 'normal';
            let cargoType = CARGO_TYPES[Math.floor(Math.random() * CARGO_TYPES.length)];
            let passengers = Math.random() > 0.4 ? Math.floor(Math.random() * 5) + 1 : 0;
            let distance = 0;

            // ZONE LOGIC
            const roll = Math.random();

            if (fromAirport.country === 'Ireland') {
                if (roll < 0.5) {
                    // Local Irish flight (Short haul)
                    const irishDestinations = airports.filter(a => a.country === 'Ireland' && a.icao !== fromAirport.icao);
                    toAirport = irishDestinations[Math.floor(Math.random() * irishDestinations.length)];
                    missionType = 'Local Irish feeder route';
                    distance = Math.floor(Math.random() * 100) + 40; // 40-140nm
                } else if (roll < 0.9) {
                    // Flight to UK/Wales/Scotland
                    const ukDestinations = airports.filter(a => a.country === 'UK' && a.icao !== fromAirport.icao);
                    toAirport = ukDestinations[Math.floor(Math.random() * ukDestinations.length)];
                    missionType = 'Cross-channel regional flight';
                    distance = Math.floor(Math.random() * 150) + 80; // 80-230nm
                } else {
                    // Flight to Northern Europe (France, Netherlands, Belgium)
                    const euroDestinations = airports.filter(a => a.region === 'Northern Europe' && a.icao !== fromAirport.icao);
                    toAirport = euroDestinations[Math.floor(Math.random() * euroDestinations.length)];
                    missionType = 'European regional operation';
                    distance = Math.floor(Math.random() * 200) + 200; // 200-400nm (The "max" for GA)
                }
            } else if (fromAirport.country === 'UK') {
                if (roll < 0.4) {
                    // Local UK flight
                    const ukDestinations = airports.filter(a => a.country === 'UK' && a.icao !== fromAirport.icao);
                    toAirport = ukDestinations[Math.floor(Math.random() * ukDestinations.length)];
                    missionType = 'Domestic UK flight';
                    distance = Math.floor(Math.random() * 120) + 50;
                } else if (roll < 0.7) {
                    // Flight to Ireland
                    const irishDestinations = airports.filter(a => a.country === 'Ireland');
                    toAirport = irishDestinations[Math.floor(Math.random() * irishDestinations.length)];
                    missionType = 'Channel crossing to Ireland';
                    distance = Math.floor(Math.random() * 150) + 80;
                } else {
                    // To Northern Europe
                    const euroDestinations = airports.filter(a => a.region === 'Northern Europe');
                    toAirport = euroDestinations[Math.floor(Math.random() * euroDestinations.length)];
                    missionType = 'Short-haul Euro connection';
                    distance = Math.floor(Math.random() * 150) + 150;
                }
            } else {
                // If in Europe, mostly local Europe or chance to return to Ireland/UK
                if (roll < 0.6) {
                    const localEuro = airports.filter(a => a.region === fromAirport.region && a.icao !== fromAirport.icao);
                    toAirport = localEuro[Math.floor(Math.random() * localEuro.length)];
                    missionType = 'Regional Euro ops';
                    distance = Math.floor(Math.random() * 100) + 50;
                } else {
                    toAirport = airports.find(a => a.icao === 'EIWT'); // Usually return to base
                    missionType = 'Ferry flight to home base';
                    cargoType = 'Empty (Ferry)';
                    passengers = 0;
                    distance = Math.floor(Math.random() * 200) + 250;
                }
            }

            // Fallback for toAirport
            if (!toAirport) {
                do {
                    toAirport = airports[Math.floor(Math.random() * airports.length)];
                } while (toAirport.icao === fromAirport.icao);
                if (distance === 0) distance = Math.floor(Math.random() * 200) + 50;
            }

            const speed = 120; // Default kts for duration estimation

            missions.push({
                id: `M-${Math.random().toString(36).substr(2, 9)}-${aircraftIdx}-${i}`,
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
