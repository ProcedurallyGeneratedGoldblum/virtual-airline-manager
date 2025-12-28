/**
 * NOTAM Decoder Utility
 * Simplifies and decodes cryptic NOTAM (Notice to Air Mission) data.
 * Inspired by Notamify.
 */

const CONTRACTIONS = {
    'RWY': 'Runway',
    'CLSD': 'closed',
    'WIP': 'work in progress',
    'AD': 'aerodrome',
    'APRON': 'parking apron',
    'TWY': 'taxiway',
    'LGT': 'lighting',
    'OPS': 'operations',
    'FREQ': 'frequency',
    'TWR': 'tower',
    'GND': 'ground',
    'DEP': 'departure',
    'ARR': 'arrival',
    'APCH': 'approach',
    'ALT': 'altitude',
    'FL': 'Flight Level',
    'SFC': 'surface',
    'MSL': 'mean sea level',
    'AGL': 'above ground level',
    'NM': 'nautical miles',
    'MIL': 'military',
    'CIV': 'civil',
    'NOTAM': 'Notice to Airmen',
    'DIST': 'distance',
    'AVBL': 'available',
    'UFN': 'until further notice',
    'WEF': 'with effect from',
    'TIL': 'until',
    'WIE': 'with immediate effect',
    'OBST': 'obstacle',
    'CONST': 'construction',
    'MAINT': 'maintenance',
    'INOP': 'inoperative',
    'SER': 'service',
    'ILS': 'Instrument Landing System',
    'VOR': 'VHF Omnidirectional Range',
    'NDB': 'Non-Directional Beacon',
    'DME': 'Distance Measuring Equipment',
    'VFR': 'Visual Flight Rules',
    'IFR': 'Instrument Flight Rules',
    'IMC': 'Instrument Meteorological Conditions',
    'VMC': 'Visual Meteorological Conditions',
    'THR': 'threshold',
    'RLY': 'really',
    'GRASS': 'grass area',
    'UNUSABLE': 'not safe for use'
};

/**
 * Decodes a raw NOTAM string into human-friendly text.
 */
export const decodeNotam = (rawText) => {
    if (!rawText) return "No data available.";

    let decoded = rawText.toUpperCase();

    // Replace contractions
    Object.entries(CONTRACTIONS).forEach(([key, value]) => {
        const regex = new RegExp(`\\b${key}\\b`, 'g');
        decoded = decoded.replace(regex, value.toUpperCase());
    });

    // Clean up casing and formatting
    decoded = decoded.toLowerCase()
        .replace(/\d{2}\/\d{2}\/\d{2}/g, (match) => `[${match}]`) // Highlight dates
        .replace(/!([A-Z]{3})\s/g, "") // Remove ICAO codes like !EIWT
        .trim();

    // Capitalize first letter of sentences
    decoded = decoded.charAt(0).toUpperCase() + decoded.slice(1);

    return decoded;
};

/**
 * Returns a role-based summary (Pilot vs Dispatcher).
 */
export const getBriefingSummary = (notams, role = 'pilot') => {
    if (!notams || notams.length === 0) return "No significant operational restrictions.";

    const categories = {
        runway: [],
        safety: [],
        navigation: [],
        general: []
    };

    notams.forEach(n => {
        const text = n.raw || n.text || "";
        if (text.includes('RWY') || text.includes('THR')) categories.runway.push(n);
        else if (text.includes('OBST') || text.includes('CLSD')) categories.safety.push(n);
        else if (text.includes('ILS') || text.includes('FREQ')) categories.navigation.push(n);
        else categories.general.push(n);
    });

    if (role === 'pilot') {
        let summary = "PILOT BRIEFING: ";
        if (categories.runway.length > 0) summary += "Pay close attention to runway status. ";
        if (categories.safety.length > 0) summary += "Multiple hazards reported in the area. ";
        return summary || "Aerodrome is reporting normal operations.";
    }

    if (role === 'dispatcher') {
        return `DISPATCH SUMMARY: Found ${notams.length} active notices. ${categories.runway.length} affect runway availability.`;
    }

    return "Summary unavailable.";
};

/**
 * Detects severity based on keywords.
 */
export const getNotamSeverity = (text) => {
    const raw = text.toUpperCase();
    if (raw.includes('CLSD') || raw.includes('INOP') || raw.includes('UNUSABLE')) return 'high';
    if (raw.includes('WIP') || raw.includes('MAINT') || raw.includes('OBST')) return 'medium';
    return 'low';
};
