// AVWX API Integration
const AVWX_API_KEY = '0yDARwk-2Ri23C1oIlVFOK_-cc-10NBgHDxPCvCB9W4'; // Replace with your actual API key
const AVWX_BASE_URL = 'https://avwx.rest/api';

// Fetch METAR for an airport
export async function getMETAR(icao) {
  try {
    const response = await fetch(`${AVWX_BASE_URL}/metar/${icao}`, {
      headers: {
        'Authorization': AVWX_API_KEY
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch METAR');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching METAR:', error);
    return null;
  }
}

// Fetch TAF for an airport
export async function getTAF(icao) {
  try {
    const response = await fetch(`${AVWX_BASE_URL}/taf/${icao}`, {
      headers: {
        'Authorization': AVWX_API_KEY
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch TAF');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching TAF:', error);
    return null;
  }
}

// Fetch Station info (includes coordinates for mapping)
export async function getStationInfo(icao) {
  try {
    const response = await fetch(`${AVWX_BASE_URL}/station/${icao}`, {
      headers: {
        'Authorization': AVWX_API_KEY
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch station info');
    }
    
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

// Force recompile