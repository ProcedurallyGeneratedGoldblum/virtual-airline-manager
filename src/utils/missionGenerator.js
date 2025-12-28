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
const calculateDuration = (distance, speed = 120) => {
    const hours = distance / speed;
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);

    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
};

/**
 * Generates a list of missions for the given fleet
 */
export const generateMissions = (fleet, missionsPerAircraft = 10) => {
    if (!fleet || fleet.length === 0) return [];

    const missions = [];

    fleet.forEach((aircraft, aircraftIdx) => {
        // Find starting airport based on aircraft location
        let fromAirport;
        const icaoMatch = aircraft.location?.match(/\(([A-Z]{4})\)/);
        if (icaoMatch) {
            fromAirport = airports.find(a => a.icao === icaoMatch[1]);
        }

        if (!fromAirport) {
            // Default to Weston if unknown
            fromAirport = airports.find(a => a.icao === 'EIWT') || airports[0];
        }

        // Logic for toAirport selection based on current location
        for (let i = 0; i < missionsPerAircraft; i++) {
            let toAirport;
            let distance = 0;
            let missionNote = "";
            const roll = Math.random();

            if (fromAirport.region === 'Ireland') {
                if (roll < 0.7) {
                    // Local Ireland (Very short)
                    const pool = airports.filter(a => a.region === 'Ireland' && a.icao !== fromAirport.icao);
                    toAirport = pool[Math.floor(Math.random() * pool.length)];
                    distance = Math.floor(Math.random() * 80) + 20; // 20-100nm
                    missionNote = "Domestic Ireland operation";
                } else if (roll < 0.95) {
                    // UK (Shortish cross-channel)
                    const pool = airports.filter(a => a.region === 'UK');
                    toAirport = pool[Math.floor(Math.random() * pool.length)];
                    distance = Math.floor(Math.random() * 150) + 100; // 100-250nm
                    missionNote = "Irish Sea crossing";
                } else {
                    // Northern France / Benelux (Rare long regional)
                    const pool = airports.filter(a => a.region === 'North-West Europe' || a.region === 'Benelux');
                    toAirport = pool[Math.floor(Math.random() * pool.length)];
                    distance = Math.floor(Math.random() * 100) + 300; // 300-400nm
                    missionNote = "Regional European connection";
                }
            } else if (fromAirport.region === 'UK') {
                if (roll < 0.6) {
                    // Domestic UK
                    const pool = airports.filter(a => a.region === 'UK' && a.icao !== fromAirport.icao);
                    toAirport = pool[Math.floor(Math.random() * pool.length)];
                    distance = Math.floor(Math.random() * 100) + 40;
                    missionNote = "Domestic UK flight";
                } else if (roll < 0.9) {
                    // To Ireland
                    const pool = airports.filter(a => a.region === 'Ireland');
                    toAirport = pool[Math.floor(Math.random() * pool.length)];
                    distance = Math.floor(Math.random() * 120) + 80;
                    missionNote = "Return flight to Ireland";
                } else {
                    // To Northern Europe
                    const pool = airports.filter(a => a.region === 'North-West Europe' || a.region === 'Benelux');
                    toAirport = pool[Math.floor(Math.random() * pool.length)];
                    distance = Math.floor(Math.random() * 100) + 150;
                    missionNote = "Channel cross to Europe";
                }
            } else if (fromAirport.region === 'Central Europe') {
                // Plane is stuck in Austria/Switzerland area
                if (roll < 0.4) {
                    // Stay there (local alps)
                    const pool = airports.filter(a => a.region === 'Central Europe' && a.icao !== fromAirport.icao);
                    toAirport = pool[Math.floor(Math.random() * pool.length)];
                    distance = Math.floor(Math.random() * 60) + 30;
                    missionNote = "Alps regional operation";
                } else {
                    // FERRY HOME (Very high weight to get them home)
                    toAirport = airports.find(a => a.icao === 'EIWT');
                    distance = 700; // Realistic distance for duration but we'll cap duration if needed
                    missionNote = "⚠️ Long distance ferry home to Weston";
                }
            } else {
                // Fallback for any other regions (Benelux, France, etc)
                if (roll < 0.6) {
                    const pool = airports.filter(a => a.region === fromAirport.region && a.icao !== fromAirport.icao);
                    toAirport = pool[Math.floor(Math.random() * pool.length)] || airports.find(a => a.icao === 'EIWT');
                    distance = Math.floor(Math.random() * 100) + 50;
                } else {
                    toAirport = airports.find(a => a.icao === 'EIWT');
                    distance = 450;
                    missionNote = "Return to base ferry";
                }
            }

            // Final safety catch
            if (!toAirport) toAirport = airports[0];
            if (distance === 0) distance = Math.floor(Math.random() * 100) + 50;

            const priority = Math.random() > 0.8 ? 'urgent' : 'normal';

            missions.push({
                id: `M-${Math.random().toString(36).substr(2, 9)}-${aircraftIdx}-${i}`,
                flightNumber: `FL${Math.floor(Math.random() * 800) + 100}`,
                aircraft: aircraft.type || aircraft.name,
                status: 'available',
                priority,
                route: {
                    from: fromAirport.name,
                    fromCode: fromAirport.icao,
                    to: toAirport.name,
                    toCode: toAirport.icao
                },
                duration: calculateDuration(distance),
                distance: distance,
                cargo: {
                    type: passengers > 0 ? 'Passengers' : cargoType,
                    passengers: passengers
                },
                weather: WEATHER_TYPES[Math.floor(Math.random() * WEATHER_TYPES.length)],
                notes: missionNote || "Standard logistics mission"
            });
        }
    });

    return missions;
};
