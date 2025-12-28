// AVWX API Integration
const AVWX_API_KEY = '0yDARwk-2Ri23C1oIlVFOK_-cc-10NBgHDxPCvCB9W4';
const AVWX_BASE_URL = 'https://avwx.rest/api';

// Regional Fallback Mapping
// Maps smaller airports without METAR/TAF to the nearest major hub
const FALLBACK_MAPPING = {
  'EIWT': 'EIDW', // Weston -> Dublin
  'EIKK': 'EICK', // Kilkenny -> Cork
  'EICM': 'EINN', // Galway -> Shannon
  'EIKY': 'EINN', // Kerry -> Shannon
  'EIWF': 'EICK', // Waterford -> Cork
  'EISG': 'EIDW', // Sligo -> Dublin
  'EIDL': 'EIDW', // Donegal -> Dublin
  'EICN': 'EINN', // Connemara -> Shannon
  'EGAC': 'EGAA', // Belfast City -> Belfast Intl
  'EGAE': 'EGAA', // City of Derry -> Belfast Intl
  'EGCK': 'EGCC', // Caernarfon -> Manchester
  'EGFH': 'EGFF', // Swansea -> Cardiff
  'EGKB': 'EGLL', // Biggin Hill -> Heathrow
  'EGKA': 'EGKK', // Shoreham -> Gatwick
  'EGPN': 'EGPH', // Dundee -> Edinburgh
  'EGEO': 'EGPK', // Oban -> Prestwick
  'EGPR': 'EGPK', // Barra -> Prestwick
  'EGPB': 'EGPA', // Sumburgh -> Kirkwall
  'EGPI': 'EGPA', // Islay -> Kirkwall
  'EHLE': 'EHAM', // Lelystad -> Schiphol
  'EHTE': 'EHAM', // Teuge -> Schiphol
  'EBAW': 'EBBR', // Antwerp -> Brussels
  'EBSP': 'EBBR', // Spa -> Brussels
  'EBOS': 'EBBR', // Ostend -> Brussels
  'LFAT': 'LFQQ', // Le Touquet -> Lille
  'LFAC': 'LFQQ', // Calais -> Lille
  'LFPN': 'LFPG', // Toussus-le-Noble -> Charles de Gaulle
  'LOWZ': 'LOWS', // Zell am See -> Salzburg
  'LSGS': 'LSGG', // Sion -> Geneva
  'LELL': 'LEBL', // Sabadell -> Barcelona
  'LFMD': 'LFMN', // Cannes -> Nice
};

// Fetch METAR for an airport
export async function getMETAR(icao, useFallback = true) {
  try {
    const response = await fetch(`${AVWX_BASE_URL}/metar/${icao}`, {
      headers: { 'Authorization': AVWX_API_KEY }
    });

    if (!response.ok) throw new Error('Failed to fetch METAR');

    const data = await response.json();

    // If we have data, return it
    if (data && data.raw) return data;

    // If no data and fallback exists
    if (useFallback && FALLBACK_MAPPING[icao]) {
      console.log(`No METAR for ${icao}, falling back to ${FALLBACK_MAPPING[icao]}`);
      return getMETAR(FALLBACK_MAPPING[icao], false);
    }

    return null;
  } catch (error) {
    if (useFallback && FALLBACK_MAPPING[icao]) {
      return getMETAR(FALLBACK_MAPPING[icao], false);
    }
    console.error('Error fetching METAR:', error);
    return null;
  }
}

// Fetch TAF for an airport
export async function getTAF(icao, useFallback = true) {
  try {
    const response = await fetch(`${AVWX_BASE_URL}/taf/${icao}`, {
      headers: { 'Authorization': AVWX_API_KEY }
    });

    if (!response.ok) throw new Error('Failed to fetch TAF');

    const data = await response.json();

    if (data && data.raw) return data;

    if (useFallback && FALLBACK_MAPPING[icao]) {
      console.log(`No TAF for ${icao}, falling back to ${FALLBACK_MAPPING[icao]}`);
      return getTAF(FALLBACK_MAPPING[icao], false);
    }

    return null;
  } catch (error) {
    if (useFallback && FALLBACK_MAPPING[icao]) {
      return getTAF(FALLBACK_MAPPING[icao], false);
    }
    console.error('Error fetching TAF:', error);
    return null;
  }
}

// Fetch Station info (includes coordinates for mapping)
export async function getStationInfo(icao) {
  try {
    const response = await fetch(`${AVWX_BASE_URL}/station/${icao}`, {
      headers: { 'Authorization': AVWX_API_KEY }
    });

    if (!response.ok) throw new Error('Failed to fetch station info');

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching station info:', error);
    return null;
  }
}

// Fetch all weather data for a flight
export async function getFlightWeather(departureICAO, arrivalICAO) {
  try {
    const [depMETAR, depTAF, arrMETAR, arrTAF, depStation, arrStation] = await Promise.all([
      getMETAR(departureICAO),
      getTAF(departureICAO),
      getMETAR(arrivalICAO),
      getTAF(arrivalICAO),
      getStationInfo(departureICAO),
      getStationInfo(arrivalICAO)
    ]);

    return {
      departure: {
        metar: depMETAR,
        taf: depTAF,
        station: depStation
      },
      arrival: {
        metar: arrMETAR,
        taf: arrTAF,
        station: arrStation
      }
    };
  } catch (error) {
    console.error('Error fetching flight weather:', error);
    return null;
  }
}

// Format METAR data for display
export function formatMETAR(metar) {
  if (!metar) return 'METAR unavailable';
  return metar.raw || 'No METAR data';
}

// Format TAF data for display
export function formatTAF(taf) {
  if (!taf) return 'TAF unavailable';
  return taf.raw || 'No TAF data';
}

// Parse flight rules from METAR
export function getFlightRules(metar) {
  if (!metar || !metar.flight_rules) return 'UNKNOWN';
  return metar.flight_rules;
}

// Get wind information
export function getWindInfo(metar) {
  if (!metar || !metar.wind_direction || !metar.wind_speed) {
    return 'Wind data unavailable';
  }

  const direction = metar.wind_direction.repr;
  const speed = metar.wind_speed.repr;
  const gust = metar.wind_gust ? ` G${metar.wind_gust.repr}` : '';

  return `${direction}° at ${speed}kt${gust}`;
}

// Get visibility
export function getVisibility(metar) {
  if (!metar || !metar.visibility) {
    return 'Visibility unavailable';
  }

  return `${metar.visibility.repr} SM`;
}

// Get cloud layers
export function getClouds(metar) {
  if (!metar || !metar.clouds || metar.clouds.length === 0) {
    return 'Sky clear';
  }

  return metar.clouds.map(cloud =>
    `${cloud.repr} ${cloud.altitude ? `at ${cloud.altitude}ft` : ''}`
  ).join(', ');
}