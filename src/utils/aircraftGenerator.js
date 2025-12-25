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

    // TTAF is strictly airframe hours
    const ttaf = airframeHours;

    // Component Logic
    // Engine SMOH (Since Major Overhaul)
    // Most piston engines have TBO of 2000 hours
    const engineTbo = 2000;

    // Simulate engine history:
    // If airframe hours < TBO, engine is likely original (SMOH = TTAF)
    // If airframe hours > TBO, engine has likely been overhauled/replaced at least once
    let smoh = 0;
    let engineTsn = 0; // Time Since New on engine

    if (ttaf < engineTbo) {
      // Low time airframe, likely original engine
      smoh = ttaf;
      engineTsn = ttaf;
    } else {
      // High time airframe, engine has been overhauled
      // Randomly decide where we are in the current cycle
      smoh = randomInRange(0, engineTbo + 200, i * 111); // Allow slightly over TBO

      // TSN for engine could be same as TTAF (original casing overhauled) or less (replaced)
      // We'll simplify and say for 80% of cases it's original engine overhauled
      if (seededRandom(i * 999) > 0.2) {
        engineTsn = ttaf;
      } else {
        // Updated engine
        engineTsn = smoh + (Math.floor(ttaf / engineTbo) * engineTbo);
      }
    }

    const engineCondition = Math.max(0, 100 - (smoh / engineTbo * 100));

    // Avionics Generation
    const avionicsOptions = [
      "Garmin GNS 430W", "Garmin GNS 530W", "Garmin GTN 650", "Garmin GTN 750",
      "Bendix/King KX155", "Bendix/King KT76A", "Bendix/King KAP140",
      "Garmin G1000 NXi", "Aspen EFD1000", "Stratus ESG", "Garmin GTX 345"
    ];

    // Simple logic: Newer planes get newer tech, older planes get mix unless retrofitted
    let avionicsList = [];
    if (year > 2005) {
      avionicsList = ["Garmin G1000 NXi", "Garmin GFC 700 Autopilot", "Garmin GTX 345"];
    } else {
      // Older planes, pick 2-4 random avionics
      const count = randomInRange(2, 4, i * 777);
      for (let k = 0; k < count; k++) {
        const av = randomFromArray(avionicsOptions, i * 888 + k);
        if (!avionicsList.includes(av)) avionicsList.push(av);
      }
    }

    // Avionics Condition (random)
    const avionicsCondition = randomInRange(40, 100, i * 222);

    // Interior/Exterior (random)
    const interiorCondition = randomInRange(20, 100, i * 333);
    const exteriorCondition = randomInRange(20, 100, i * 444);

    // Last Annual Date
    const monthsAgo = randomInRange(0, 11, i * 666);
    const lastAnnualDate = new Date();
    lastAnnualDate.setMonth(lastAnnualDate.getMonth() - monthsAgo);

    // Serial Number
    const serialNumber = `${year}-${Math.floor(seededRandom(i * 555) * 10000).toString().padStart(4, '0')}`;

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
    // Use SMOH for value calculation
    const engineLifeRemaining = Math.max(0, (engineTbo - smoh) / engineTbo);
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
      serialNumber,
      category: template.category,
      price: Math.round(price),
      location: `${location.name}, ${location.country} (${location.icao})`,
      hours: ttaf, // Keep for backward compatibility but use TTAF in UI
      image: template.image || (template.category === 'turboprop' ? '🛩️' : '✈️'),
      condition, // Legacy support
      conditionDetails: { // New detailed condition
        engine: {
          smoh: smoh,
          tsn: engineTsn,
          tbo: engineTbo,
          condition: Math.round(engineCondition),
          model: template.category === 'single-piston' ? 'O-320-D2J' : 'IO-540-K1G5' // Simplified placeholder logic
        },
        airframe: {
          ttaf: ttaf,
          hours: ttaf,
          condition: Math.round(exteriorCondition),
          lastAnnual: lastAnnualDate.toISOString().split('T')[0]
        },
        avionics: {
          list: avionicsList,
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