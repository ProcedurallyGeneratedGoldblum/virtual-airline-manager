// Aircraft generator using external JSON data
import aircraftTemplates from '../data/aircraftTypes.json';
import europeanLocations from '../data/airports.json';

const conditions = ['Excellent', 'Very Good', 'Good', 'Fair'];

// Random number generator with seed for consistency
function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function randomInRange(min, max, seed) {
  return Math.floor(seededRandom(seed) * (max - min + 1)) + min;
}

function randomFromArray(array, seed) {
  return array[Math.floor(seededRandom(seed) * array.length)];
}

export function generateAircraft(count = 20) {
  const aircraft = [];

  for (let i = 0; i < count; i++) {
    const template = randomFromArray(aircraftTemplates, i * 123);
    const year = randomInRange(template.yearRange[0], template.yearRange[1], i * 456);
    const condition = randomFromArray(conditions, i * 789);
    const location = randomFromArray(europeanLocations, i * 321);

    // Calculate price based on year, condition, and variance
    const age = 2024 - year;
    const ageDepreciation = 1 - (age * 0.015); // 1.5% per year
    const conditionMultiplier = {
      'Excellent': 1.0,
      'Very Good': 0.9,
      'Good': 0.75,
      'Fair': 0.6
    }[condition];

    const priceVariance = (seededRandom(i * 654) - 0.5) * template.priceVariance;
    const price = Math.round(
      (template.basePrice + priceVariance) * ageDepreciation * conditionMultiplier
    );

    // Calculate hours based on age and usage
    const avgHoursPerYear = randomInRange(50, 200, i * 987);
    const hours = age * avgHoursPerYear;

    const description = randomFromArray(template.descriptions, i * 147);

    aircraft.push({
      id: i + 1,
      name: template.name,
      manufacturer: template.manufacturer,
      year,
      category: template.category,
      price: Math.max(price, 50000), // Minimum price
      location: `${location.name}, ${location.country} (${location.icao})`,
      hours,
      image: template.image || (template.category === 'turboprop' ? '🛩️' : '✈️'),
      condition,
      description,
      specs: template.specs
    });
  }

  return aircraft;
}

// Generate and export a default set
export const defaultAircraft = generateAircraft(30);