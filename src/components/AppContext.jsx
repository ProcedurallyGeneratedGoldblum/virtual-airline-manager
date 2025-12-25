import React, { createContext, useContext, useState, useEffect } from 'react';
import aircraftTypes from '../data/aircraftTypes.json';
import { calculateFlightFinance } from '../utils/flightCalculations';

const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  // Helper to load from localStorage
  const loadState = (key, fallback) => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : fallback;
    } catch (e) {
      console.warn(`Failed to load ${key} from localStorage`, e);
      return fallback;
    }
  };

  // Company State
  const [company, setCompany] = useState(() => loadState('vam_company', {
    name: '',
    callsign: '',
    founded: '',
    headquarters: '',
    description: '',
    motto: '',
    focusArea: 'bush',
    pilots: 1,
    aircraft: 3,
    totalFlights: 0,
    totalEarnings: 0,
    flightHours: 0,
    balance: 5000000, // Initial balance
    established: new Date().toISOString().split('T')[0]
  }));

  // Migration for existing saves
  useEffect(() => {
    if (company.balance === undefined) {
      setCompany(prev => ({ ...prev, balance: 5000000 }));
    }
  }, []);

  // Pilot State
  const [pilot, setPilot] = useState(() => loadState('vam_pilot', {
    name: '',
    callsign: '',
    rank: 'Junior Pilot',
    license: '',
    joinDate: new Date().toISOString().split('T')[0],
    totalFlights: 0,
    totalHours: 0,
    totalDistance: 0,
    totalEarnings: 0,
    rating: 0,
    onTimePercentage: 0,
    safetyRating: 100,
    experience: 0,
    nextRankXP: 1000,
  }));

  // Fleet State - Starting aircraft based at regional European airfields
  const [fleet, setFleet] = useState(() => loadState('vam_fleet', [
    {
      id: 1,
      registration: 'EI-CAR',
      type: 'Cessna 208 Caravan',
      status: 'available',
      location: 'Weston (EIWT)',
      totalHours: 1250.5,
      hoursSinceInspection: 45.2,
      nextInspectionDue: 54.8,
      lastFlight: '2024-12-18',
      condition: 'excellent',
      lockedBy: null,
      currentFlight: null
    },
    {
      id: 2,
      registration: 'G-BUSH',
      type: 'DHC-2 Beaver',
      status: 'available',
      location: 'Oban (EGEO)',
      totalHours: 8420.3,
      hoursSinceInspection: 82.1,
      nextInspectionDue: 17.9,
      lastFlight: '2024-12-21',
      condition: 'good',
      lockedBy: null,
      currentFlight: null
    },
    {
      id: 3,
      registration: 'F-GCUB',
      type: 'Piper PA-18 Super Cub',
      status: 'maintenance',
      location: 'Toussus-le-Noble (LFPN)',
      totalHours: 3200.7,
      hoursSinceInspection: 5.0,
      nextInspectionDue: 95.0,
      lastFlight: '2024-12-15',
      condition: 'fair',
      maintenanceNotes: 'Oil change and 100-hour inspection',
      lockedBy: null,
      currentFlight: null
    }
  ]));

  // Active Flights State
  const [activeFlights, setActiveFlights] = useState(() => loadState('vam_activeFlights', []));

  // Completed Flights State (Flight Log)
  const [completedFlights, setCompletedFlights] = useState(() => loadState('vam_completedFlights', []));

  // Available Flights State (Dispatch Center) - Regional European routes
  const [availableFlights, setAvailableFlights] = useState([
    {
      id: 'F001',
      flightNumber: 'EUR001',
      aircraft: 'Cessna 208 Caravan',
      status: 'available',
      priority: 'urgent',
      route: {
        from: 'Weston',
        fromCode: 'EIWT',
        to: 'Galway',
        toCode: 'EICM'
      },
      duration: '40m',
      distance: 95,
      cargo: {
        type: 'Medical supplies',
        passengers: 2
      },
      weather: 'VFR',
      notes: 'Priority delivery to West Ireland clinic'
    },
    {
      id: 'F002',
      flightNumber: 'EUR002',
      aircraft: 'DHC-2 Beaver',
      status: 'available',
      priority: 'normal',
      route: {
        from: 'Oban',
        fromCode: 'EGEO',
        to: 'Barra',
        toCode: 'EGPR'
      },
      duration: '35m',
      distance: 70,
      cargo: {
        type: 'Island supplies',
        passengers: 3
      },
      weather: 'MVFR',
      notes: '⚠️ Beach runway - tides dependent landing'
    },
    {
      id: 'F003',
      flightNumber: 'EUR003',
      aircraft: 'Piper PA-18 Super Cub',
      status: 'available',
      priority: 'normal',
      route: {
        from: 'Toussus-le-Noble',
        fromCode: 'LFPN',
        to: 'Megève',
        toCode: 'LFHM'
      },
      duration: '2h 30m',
      distance: 280,
      cargo: {
        type: 'VIP courier',
        passengers: 1
      },
      weather: 'VFR',
      notes: '⛷️ Alpine altiport - mountain flying experience required'
    },
    {
      id: 'F004',
      flightNumber: 'EUR004',
      aircraft: 'Cessna 182',
      status: 'available',
      priority: 'urgent',
      route: {
        from: 'Biggin Hill',
        fromCode: 'EGKB',
        to: 'Islay',
        toCode: 'EGPI'
      },
      duration: '2h 15m',
      distance: 340,
      cargo: {
        type: 'Whisky distillery samples',
        passengers: 0
      },
      weather: 'IFR',
      notes: '🥃 Time-sensitive delivery for whisky export'
    },
    {
      id: 'F005',
      flightNumber: 'EUR005',
      aircraft: 'Cessna 208 Caravan',
      status: 'available',
      priority: 'urgent',
      route: {
        from: 'Hamburg Finkenwerder',
        fromCode: 'EDHI',
        to: 'Egelsbach',
        toCode: 'EDFE'
      },
      duration: '1h 45m',
      distance: 230,
      cargo: {
        type: 'Aircraft Parts',
        passengers: 0
      },
      weather: 'VFR',
      notes: 'Spare parts for Aero Club maintenance'
    },
    {
      id: 'F006',
      flightNumber: 'EUR006',
      aircraft: 'Pilatus PC-6',
      status: 'available',
      priority: 'normal',
      route: {
        from: 'Sion',
        fromCode: 'LSGS',
        to: 'Samedan',
        toCode: 'LSZS'
      },
      duration: '45m',
      distance: 85,
      cargo: {
        type: 'Ski Equipment',
        passengers: 4
      },
      weather: 'VFR',
      notes: '🏔️ High altitude operations - Check density altitude'
    },
    {
      id: 'F007',
      flightNumber: 'EUR007',
      aircraft: 'Beechcraft Baron 58',
      status: 'available',
      priority: 'normal',
      route: {
        from: 'Cannes',
        fromCode: 'LFMD',
        to: 'Sabadell',
        toCode: 'LELL'
      },
      duration: '1h 30m',
      distance: 210,
      cargo: {
        type: 'VIP Passengers',
        passengers: 3
      },
      weather: 'VFR',
      notes: 'Coastal scenic route requested'
    },
    {
      id: 'F008',
      flightNumber: 'EUR008',
      aircraft: 'Cessna 172',
      status: 'available',
      priority: 'normal',
      route: {
        from: 'Innsbruck',
        fromCode: 'LOWI',
        to: 'Zell am See',
        toCode: 'LOWZ'
      },
      duration: '50m',
      distance: 60,
      cargo: {
        type: 'Local Mail',
        passengers: 0
      },
      weather: 'MVFR',
      notes: 'Valley flying required due to low ceiling'
    },
    {
      id: 'F009',
      flightNumber: 'EUR009',
      aircraft: 'Piper PA-28',
      status: 'available',
      priority: 'urgent',
      route: {
        from: 'Dundee',
        fromCode: 'EGPN',
        to: 'Oban',
        toCode: 'EGEO'
      },
      duration: '1h 10m',
      distance: 90,
      cargo: {
        type: 'Fresh Seafood',
        passengers: 0
      },
      weather: 'IFR',
      notes: 'Expected icing conditions enroute'
    }
  ]);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('vam_company', JSON.stringify(company));
  }, [company]);

  useEffect(() => {
    localStorage.setItem('vam_pilot', JSON.stringify(pilot));
  }, [pilot]);

  useEffect(() => {
    localStorage.setItem('vam_fleet', JSON.stringify(fleet));
  }, [fleet]);

  useEffect(() => {
    localStorage.setItem('vam_activeFlights', JSON.stringify(activeFlights));
  }, [activeFlights]);

  useEffect(() => {
    localStorage.setItem('vam_completedFlights', JSON.stringify(completedFlights));
  }, [completedFlights]);


  // Flight being completed (for post-flight briefing)
  const [flightToComplete, setFlightToComplete] = useState(null);

  // Lock aircraft for a flight
  const lockAircraft = (aircraftId, flightId) => {
    setFleet(prevFleet =>
      prevFleet.map(aircraft =>
        aircraft.id === aircraftId
          ? {
            ...aircraft,
            status: 'in-flight',
            lockedBy: flightId,
            currentFlight: flightId
          }
          : aircraft
      )
    );
  };

  // Accept a flight
  const acceptFlight = (flight, selectedAircraft) => {
    const flightId = `FLIGHT-${Date.now()}`;

    const newActiveFlight = {
      ...flight,
      id: flightId,
      aircraftId: selectedAircraft.id,
      aircraftRegistration: selectedAircraft.registration,
      acceptedAt: new Date().toISOString(),
      status: 'in-progress'
    };

    // Add to active flights
    setActiveFlights(prev => [...prev, newActiveFlight]);

    // Lock the aircraft
    lockAircraft(selectedAircraft.id, flightId);

    // Remove from available flights
    setAvailableFlights(prev => prev.filter(f => f.id !== flight.id));

    return flightId;
  };

  // Complete a flight (start post-flight briefing)
  const startPostFlightBriefing = (flightId) => {
    const flight = activeFlights.find(f => f.id === flightId);
    if (flight) {
      setFlightToComplete(flight);
    }
  };

  // Update pilot stats after a flight
  const updatePilotStats = (flight, briefingData) => {
    const flightHours = parseFloat(briefingData.actualDuration) || 0;
    const distance = flight.distance || 0;
    const earnings = briefingData.earnings || 0;

    // XP Calculation: 10xp per flight + 1xp per nm
    const xpEarned = 10 + distance;

    setPilot(prev => {
      const newTotalFlights = prev.totalFlights + 1;
      const newTotalHours = prev.totalHours + flightHours;
      const newTotalDistance = prev.totalDistance + distance;
      const newTotalEarnings = prev.totalEarnings + earnings;
      const newExperience = prev.experience + xpEarned;

      // Simple rating update logic (average of 5.0)
      // If rating is 0, start with 5.0. Otherwise average it.
      // Assuming every flight is a 5-star for now unless defects?
      const currentFlightRating = briefingData.severity === 'major' ? 3.0 : 5.0;
      const newRating = prev.totalFlights === 0
        ? currentFlightRating
        : ((prev.rating * prev.totalFlights) + currentFlightRating) / (prev.totalFlights + 1);

      // On-time: Check if actualDuration <= estimated duration (simplified check)
      // For now, assume on-time if within +10% of planned
      // We'll just assume true for this iteration unless briefing says otherwise
      const isOnTime = briefingData.onTime !== false;
      const onTimeCount = Math.round((prev.onTimePercentage / 100) * prev.totalFlights) + (isOnTime ? 1 : 0);
      const newOnTimePercentage = Math.round((onTimeCount / newTotalFlights) * 100);

      return {
        ...prev,
        totalFlights: newTotalFlights,
        totalHours: parseFloat(newTotalHours.toFixed(1)),
        totalDistance: newTotalDistance,
        totalEarnings: newTotalEarnings,
        rating: parseFloat(newRating.toFixed(1)),
        onTimePercentage: newOnTimePercentage,
        experience: newExperience
      };
    });
  };

  // Submit post-flight briefing and complete flight
  const completeFlightWithBriefing = (flightId, briefingData) => {
    const flight = activeFlights.find(f => f.id === flightId);

    if (!flight) return;

    const aircraft = fleet.find(a => a.id === flight.aircraftId);

    // Calculate new aircraft hours
    const flightHours = parseFloat(briefingData.actualDuration) || 0;

    // Determine new aircraft status based on defects
    let newAircraftStatus = 'available';
    let newCondition = aircraft.condition;
    let maintenanceNotes = null;

    if (briefingData.technicalDefects && briefingData.technicalDefects.trim() !== '') {
      newAircraftStatus = 'maintenance';
      maintenanceNotes = briefingData.technicalDefects;

      // Degrade condition if there were defects
      if (briefingData.severity === 'major') {
        if (aircraft.condition === 'excellent') newCondition = 'good';
        else if (aircraft.condition === 'good') newCondition = 'fair';
        else if (aircraft.condition === 'fair') newCondition = 'poor';
      }
    }

    // Update aircraft in fleet
    setFleet(prevFleet =>
      prevFleet.map(a =>
        a.id === aircraft.id
          ? {
            ...a,
            status: newAircraftStatus,
            location: `${flight.route.to} (${flight.route.toCode})`,
            totalHours: a.totalHours + flightHours,
            hoursSinceInspection: a.hoursSinceInspection + flightHours,
            nextInspectionDue: a.nextInspectionDue - flightHours,
            lastFlight: new Date().toISOString().split('T')[0],
            condition: newCondition,
            maintenanceNotes: maintenanceNotes,
            lockedBy: null,
            currentFlight: null
          }
          : a
      )
    );

    // Create completed flight record
    const completedFlight = {
      id: completedFlights.length + 1,
      flightId: flight.id,
      flightNumber: flight.aircraftRegistration,
      route: `${flight.route.fromCode} → ${flight.route.toCode}`,
      aircraft: flight.aircraftRegistration,
      type: aircraft.type,
      date: new Date().toISOString().split('T')[0],
      duration: briefingData.actualDuration,
      distance: flight.distance,
      earnings: briefingData.earnings || 0,
      status: 'completed',
      briefing: briefingData
    };

    // Add to completed flights
    setCompletedFlights(prev => [...prev, completedFlight]);

    // Update Pilot Stats
    updatePilotStats(flight, briefingData);

    // Remove from active flights
    setActiveFlights(prev => prev.filter(f => f.id !== flightId));

    // Calculate final financials
    const finance = calculateFlightFinance(flight, aircraft);
    // If actual duration differed significantly, we might want to adjust expenses (fuel/pilot), 
    // but calculateFlightFinance uses flight.distance mainly. 
    // Let's stick to the generated finance object for consistency, or ideally recalculate with actual hours.
    // For now, we'll use the calculated profit as the realized gain.
    const netProfit = finance ? finance.profit : (briefingData.earnings || 0);
    const revenue = finance ? finance.revenue : (briefingData.earnings || 0);

    // Update company stats
    setCompany(prev => ({
      ...prev,
      totalFlights: prev.totalFlights + 1,
      totalEarnings: prev.totalEarnings + revenue,
      flightHours: prev.flightHours + flightHours,
      balance: prev.balance + netProfit
    }));

    // Clear flight to complete
    setFlightToComplete(null);
  };

  // Cancel flight briefing
  const cancelFlightBriefing = () => {
    setFlightToComplete(null);
  };

  // Update company
  const updateCompany = (newCompanyData) => {
    setCompany(newCompanyData);
  };

  // Update pilot
  const updatePilot = (newPilotData) => {
    setPilot(newPilotData);
  };

  // Add aircraft to fleet
  const addAircraftToFleet = (aircraft) => {
    // Generate registration if not present
    const generateRegistration = () => {
      const prefixes = ['N', 'G-', 'D-', 'F-', 'EI-', 'OE-'];
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      const numbers = Math.floor(Math.random() * 9000) + 1000;
      return `${prefix}${numbers}`;
    };

    // Transform marketplace aircraft to fleet format
    const fleetAircraft = {
      id: fleet.length + 1,
      registration: aircraft.registration || generateRegistration(),
      type: aircraft.name || aircraft.type || 'Unknown Aircraft',
      status: aircraft.status || 'available',
      location: aircraft.location || 'Unknown',
      totalHours: aircraft.hours || aircraft.conditionDetails?.airframe?.ttaf || 0,
      hoursSinceInspection: aircraft.hoursSinceInspection || 0,
      nextInspectionDue: aircraft.nextInspectionDue || 100,
      lastFlight: aircraft.lastFlight || new Date().toISOString().split('T')[0],
      condition: aircraft.condition || 'good',
      conditionDetails: aircraft.conditionDetails || null,
      melList: aircraft.melList || [],
      lockedBy: null,
      currentFlight: null,
      // Preserve marketplace data
      name: aircraft.name,
      manufacturer: aircraft.manufacturer,
      year: aircraft.year,
      price: aircraft.price,
      specs: aircraft.specs
    };

    setFleet(prev => [...prev, fleetAircraft]);
    setCompany(prev => ({
      ...prev,
      aircraft: prev.aircraft + 1,
      balance: prev.balance - aircraft.price
    }));
  };

  // Sell aircraft
  const sellAircraft = (aircraftId) => {
    const aircraft = fleet.find(a => a.id === aircraftId);
    if (!aircraft) return;

    // Calculate sell price
    // Find template for base specs
    const template = aircraftTypes.find(t => t.name === aircraft.name) ||
      aircraftTypes.find(t => t.category === aircraft.type) || // Fallback
      { basePrice: 50000 };

    // Simplified depreciation for selling
    // If it has a price proeprty from generation/purchase, use that as basis
    // Otherwise calculate from scratch
    let baseValue = aircraft.price || template.basePrice;

    // If it was just bought, price is mostly retained minus immediate depreciation
    // For this MVP, we'll just return 70% of current value + condition adjustments
    // If it's a "fleet" aircraft with no price, we calculate one
    if (!aircraft.price) {
      // Estimate for legacy fleet
      baseValue = template.basePrice * 0.6;
    }

    // Apply condition degradation
    let conditionFactor = 1.0;
    if (aircraft.conditionDetails) {
      // Advanced logic
      const engine = aircraft.conditionDetails.engine.condition / 100;
      const airframe = aircraft.conditionDetails.airframe.condition / 100;
      const avionics = aircraft.conditionDetails.avionics.condition / 100;
      conditionFactor = (engine * 0.5) + (airframe * 0.3) + (avionics * 0.2);
    } else {
      // Simple logic
      conditionFactor = {
        'excellent': 1.0,
        'good': 0.8,
        'fair': 0.6,
        'poor': 0.4,
        'maintenance': 0.3
      }[aircraft.condition.toLowerCase()] || 0.6;
    }

    const sellPrice = Math.floor(baseValue * conditionFactor * 0.8); // 20% dealer margin/fee

    setFleet(prev => prev.filter(a => a.id !== aircraftId));
    setCompany(prev => ({
      ...prev,
      aircraft: prev.aircraft - 1,
      balance: prev.balance + sellPrice
    }));

    return sellPrice;
  };

  // Repair Aircraft (MEL or Component)
  const repairAircraft = (aircraftId, type, itemData) => {
    const aircraft = fleet.find(a => a.id === aircraftId);
    if (!aircraft) return;

    let cost = 0;
    let newAircraft = { ...aircraft };
    let success = false;

    if (type === 'MEL') {
      // Fix specific item
      // Simple cost model: Minor = $500, Major = $2000
      cost = itemData.type === 'major' ? 2000 : 500;

      if (company.balance < cost) {
        alert("insufficient funds for repair!");
        return false;
      }

      // Remove item
      newAircraft.melList = newAircraft.melList.filter(i => i.item !== itemData.item);
      success = true;

    } else if (type === 'COMPONENT') {
      // Overhaul/Repair component
      // itemData: { component: 'engine' | 'avionics' | 'interior' | 'airframe', action: 'repair' | 'overhaul' }

      const prices = {
        engine: { repair: 2000, overhaul: 15000 },
        avionics: { repair: 1000, overhaul: 5000 },
        interior: { repair: 500, overhaul: 2000 },
        airframe: { repair: 1500, overhaul: 8000 } // e.g. Paint
      };

      cost = prices[itemData.component][itemData.action];

      if (company.balance < cost) {
        alert("Insufficient funds for this service!");
        return false;
      }

      // Logic: Repair adds 20%, Overhaul resets to 100%
      let current = newAircraft.conditionDetails[itemData.component].condition;
      let newCondition = itemData.action === 'overhaul' ? 100 : Math.min(100, current + 20);

      // Update nested state
      newAircraft.conditionDetails = {
        ...newAircraft.conditionDetails,
        [itemData.component]: {
          ...newAircraft.conditionDetails[itemData.component],
          condition: newCondition
        }
      };

      // If overhaul engine, reset SMOH
      if (itemData.component === 'engine' && itemData.action === 'overhaul') {
        newAircraft.conditionDetails.engine.smoh = 0;
        // TBO remains same
      }
      success = true;
    }

    if (success) {
      // Recalculate global condition (Simplified)
      // If we had the generator logic here it would be better, but let's approximate
      // Average of components
      const cd = newAircraft.conditionDetails;
      if (cd) {
        const avg = (cd.engine.condition + cd.avionics.condition + cd.interior.condition + cd.airframe.condition) / 4;
        if (avg > 90) newAircraft.condition = 'excellent';
        else if (avg > 75) newAircraft.condition = 'good';
        else if (avg > 60) newAircraft.condition = 'fair';
        else if (avg > 40) newAircraft.condition = 'poor';
        else newAircraft.condition = 'maintenance';
      }

      // Deduct funds
      setCompany(prev => ({
        ...prev,
        balance: prev.balance - cost
      }));

      // Update fleet
      setFleet(prev => prev.map(a => a.id === aircraftId ? newAircraft : a));
    }

    return success;
  };

  const value = {
    // State
    company,
    pilot,
    fleet,
    activeFlights,
    completedFlights,
    availableFlights,
    flightToComplete,

    // Actions
    updateCompany,
    updatePilot,
    acceptFlight,
    startPostFlightBriefing,
    completeFlightWithBriefing,
    cancelFlightBriefing,
    addAircraftToFleet,
    sellAircraft,
    repairAircraft,
    lockAircraft
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContext;