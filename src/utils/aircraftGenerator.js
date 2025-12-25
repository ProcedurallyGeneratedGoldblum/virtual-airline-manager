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

  const melItems = [
    { item: 'Landing Light', impact: 0.01, type: 'minor' },
    { item: 'Nav Light', impact: 0.01, type: 'minor' },
    { item: 'Right Brake (Soft)', impact: 0.05, type: 'major' },
    { item: 'Left Brake (Soft)', impact: 0.05, type: 'major' },
    { item: 'Strobe Light', impact: 0.01, type: 'minor' },
    { item: 'Pitot Heat', impact: 0.03, type: 'minor' },
    { item: 'Turn Coordinator', impact: 0.05, type: 'major' },
    { item: 'VSI', impact: 0.02, type: 'minor' },
    { item: 'Com 2 Radio', impact: 0.05, type: 'minor' },
    { item: 'Transponder (Mode C intermittent)', impact: 0.05, type: 'major' }
  ];

  for (let i = 0; i < count; i++) {
    const template = randomFromArray(aircraftTemplates, i * 123);
    const year = randomInRange(template.yearRange[0], template.yearRange[1], i * 456);
    const location = randomFromArray(europeanLocations, i * 321);

    // Age and Base Calculation
    const age = 2024 - year;
    const avgHoursPerYear = randomInRange(50, 200, i * 987);
    const airframeHours = Math.round(age * avgHoursPerYear);

    // Component Logic
    const engineHours = Math.round(randomInRange(0, 2000, i * 111)); // 2000 is usually TBO
    const engineCondition = Math.max(0, 100 - (engineHours / 2000 * 100));
    
    // Avionics Condition (random)
    const avionicsCondition = randomInRange(40, 100, i * 222);
    
    // Interior/Exterior (random)
    const interiorCondition = randomInRange(20, 100, i * 333);
    const exteriorCondition = randomInRange(20, 100, i * 444);

    // Calculate Overall Condition String
    const avgCondition = (engineCondition + avionicsCondition + interiorCondition + exteriorCondition) / 4;
    let condition = 'Fair';
    if (avgCondition > 90) condition = 'Excellent';
    else if (avgCondition > 75) condition = 'Very Good';
    else if (avgCondition > 60) condition = 'Good';
    else if (avgCondition > 40) condition = 'Fair';
    else condition = 'Poor';

    // Generate MEL Items
    const existingMEL = [];
    if (condition === 'Fair' || condition === 'Poor' || condition === 'Good') {
      const numIssues = condition === 'Poor' ? randomInRange(2, 5, i * 555) : randomInRange(0, 2, i * 555);
      for (let j = 0; j < numIssues; j++) {
        const issue = randomFromArray(melItems, i * 555 + j);
        if (!existingMEL.find(m => m.item === issue.item)) {
          existingMEL.push(issue);
        }
      }
    }

    // Advanced Pricing Logic
    const priceVariance = (seededRandom(i * 654) - 0.5) * template.priceVariance;
    let price = template.basePrice + priceVariance;

    // Depreciation factors
    price = price * (1 - (age * 0.01)); // 1% per year age depreciation
    
    // TBO Impact (Engine is expensive)
    // Assume engine overhaul is ~20-30% of plane value for cheap planes, less for jets
    const engineLifeRemaining = Math.max(0, (2000 - engineHours) / 2000);
    const engineValueFactor = 0.7 + (0.3 * engineLifeRemaining); // Engine worth 30% of value
    price = price * engineValueFactor;

    // Condition Impact
    price = price * (avgCondition / 100);

    // MEL Impact
    existingMEL.forEach(mel => {
      price = price * (1 - mel.impact);
    });

    // Ensure minimum price (scrap value)
    price = Math.max(price, 10000);

    const description = randomFromArray(template.descriptions, i * 147);

    aircraft.push({
      id: `AC-${Date.now()}-${i}`, // Unique ID
      name: template.name,
      manufacturer: template.manufacturer,
      year,
      category: template.category,
      price: Math.round(price),
      location: `${location.name}, ${location.country} (${location.icao})`,
      hours: airframeHours,
      image: template.image || (template.category === 'turboprop' ? '🛩️' : '✈️'),
      condition, // Legacy support
      conditionDetails: { // New detailed condition
        engine: {
          hours: engineHours,
          condition: Math.round(engineCondition),
          tbo: 2000
        },
        airframe: {
          hours: airframeHours,
          condition: Math.round(exteriorCondition)
        },
        avionics: {
          condition: Math.round(avionicsCondition)
        },
        interior: {
          condition: Math.round(interiorCondition)
        }
      },
      melList: existingMEL,
      description,
      specs: template.specs
    });
  }

  return aircraft;
}

// Generate and export a default set
export const defaultAircraft = generateAircraft(30);