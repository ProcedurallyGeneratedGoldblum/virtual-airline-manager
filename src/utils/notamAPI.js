import { decodeNotam, getNotamSeverity } from './notamDecoder';

const AVWX_API_KEY = '0yDARwk-2Ri23C1oIlVFOK_-cc-10NBgHDxPCvCB9W4';
const AVWX_BASE_URL = 'https://avwx.rest/api';

const MOCK_NOTAMS = {
    'EIWT': [
        { raw: "RWY 07/25 GRASS AREA UNUSABLE DUE TO EXCESSIVE SURFACE WATER WIP", id: "A123/24" },
        { raw: "AERODROME HOURS OF OPS MON-SUN 0900-1800", id: "B456/24" },
        { raw: "OBSTACLE ERECTED CRANE 1NM SOUTH OF AD 150FT AGL LGTD", id: "C789/24" }
    ],
    'EIDW': [
        { raw: "RWY 10L/28R CLSD FOR SCHEDULED MAINTENANCE 2300-0500 DAILY TIL SEP 30", id: "D101/24" },
        { raw: "ILS RWY 28L INOP WEF IMMEDIATE EFFECT TIL FURTHER NOTICE", id: "D102/24" }
    ],
    'EGKB': [
        { raw: "TWY DELTA WIP LIGHTING UPGRADES EXERCISE CAUTION", id: "E202/24" }
    ],
    'EICK': [
        { raw: "APRON WORK IN PROGRESS BEHIND STAND 5 TIL 1800", id: "F303/24" }
    ]
};

/**
 * Fetches NOTAMs for a specific ICAO code.
 * Falls back to mocks for demo purposes.
 */
export async function getNOTAMs(icao) {
    try {
        // Try real API first
        const response = await fetch(`${AVWX_BASE_URL}/notam/${icao}`, {
            headers: { 'Authorization': AVWX_API_KEY }
        });

        if (response.ok) {
            const data = await response.json();
            if (data && data.length > 0) {
                return data.map(n => ({
                    id: n.raw.split(' ')[0] || Math.random().toString(36).substr(2, 5).toUpperCase(),
                    raw: n.raw,
                    decoded: decodeNotam(n.raw),
                    severity: getNotamSeverity(n.raw),
                    timestamp: new Date().toISOString()
                }));
            }
        }
    } catch (error) {
        console.warn(`AVWX NOTAM failed for ${icao}, using mock if available.`);
    }

    // Fallback to Mocks
    const mocks = MOCK_NOTAMS[icao] || [
        { raw: `${icao} AD OPS NORMAL. NO SIGNIFICANT NOTAMS REPORTED.`, id: "Z999/24" }
    ];

    return mocks.map(m => ({
        id: m.id,
        raw: m.raw,
        decoded: decodeNotam(m.raw),
        severity: getNotamSeverity(m.raw),
        timestamp: new Date().toISOString()
    }));
}

/**
 * Gets a combined briefing for a flight (Departure + Arrival)
 */
export async function getFlightBriefing(depICAO, arrICAO) {
    const [depNotams, arrNotams] = await Promise.all([
        getNOTAMs(depICAO),
        getNOTAMs(arrICAO)
    ]);

    return {
        departure: depNotams,
        arrival: arrNotams,
        generatedAt: new Date().toISOString()
    };
}
