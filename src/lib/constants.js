export const FUEL_PRICES = {
    AVGAS: 5.50, // $ per gallon
    'JET-A1': 4.20 // $ per gallon
};

export const FUEL_TYPES = {
    AVGAS: 'AVGAS',
    'JET-A1': 'JET-A1'
};

export const CATEGORY_TO_FUEL = {
    'single-piston': FUEL_TYPES.AVGAS,
    'twin-piston': FUEL_TYPES.AVGAS,
    'turboprop': FUEL_TYPES['JET-A1'],
    'jet': FUEL_TYPES['JET-A1']
};
