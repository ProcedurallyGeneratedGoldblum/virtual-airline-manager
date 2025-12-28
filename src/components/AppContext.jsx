import React, { createContext, useContext, useState, useEffect } from 'react';
import aircraftTypes from '../data/aircraftTypes.json';
import { calculateFlightFinance } from '../utils/flightCalculations';
import api from '../lib/api';
import { generateAircraft } from '../utils/aircraftGenerator';

const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  // Loading state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Company State
  const [company, setCompany] = useState({
    name: '',
    callsign: '',
    founded: '',
    headquarters: '',
    description: '',
    motto: '',
    focus_area: 'bush',
    pilots: 1,
    aircraft: 0,
    total_flights: 0,
    total_earnings: 0,
    flight_hours: 0,
    balance: 5000000,
    established: new Date().toISOString().split('T')[0]
  });

  // Pilot State
  const [pilot, setPilot] = useState({
    name: '',
    callsign: '',
    rank: 'Junior Pilot',
    role: 'Company Owner',
    license: '',
    join_date: new Date().toISOString().split('T')[0],
    total_flights: 0,
    total_hours: 0,
    total_distance: 0,
    total_earnings: 0,
    rating: 0,
    on_time_percentage: 0,
    safety_rating: 100,
    experience: 0,
    next_rank_xp: 1000,
  });

  // Fleet State
  const [fleet, setFleet] = useState([]);

  // Active Flights State
  const [activeFlights, setActiveFlights] = useState([]);

  // Completed Flights State (Flight Log)
  const [completedFlights, setCompletedFlights] = useState([]);

  // Marketplace State
  const [marketListings, setMarketListings] = useState([]);

  // Refresh Marketplace
  const refreshMarket = () => {
    setMarketListings(generateAircraft(30));
  };

  // Initialize market if empty
  useEffect(() => {
    if (marketListings.length === 0 && !loading) {
      refreshMarket();
    }
  }, [loading]);

  // Seed starter fleet
  const seedStarterFleet = async () => {
    try {
      // Generate 3 starter aircraft
      const starterAircraft = generateAircraft(3);

      // Add each to backend
      const promises = starterAircraft.map(aircraft => {
        const fleetAircraft = {
          ...aircraft,
          registration: aircraft.registration || `N${Math.floor(Math.random() * 90000) + 10000}`,
          status: 'available',
          total_hours: aircraft.hours || aircraft.conditionDetails?.airframe?.ttaf || 0,
          hours_since_inspection: 0,
          next_inspection_due: 100,
          last_flight: new Date().toISOString().split('T')[0],
          condition_details: aircraft.conditionDetails,
          mel_list: aircraft.melList || [],
          maintenance_notes: '',
          locked_by: null,
          current_flight: null
        };
        return api.addAircraft(fleetAircraft);
      });

      const results = await Promise.all(promises);

      // Transform results for state
      const newFleet = results.map(aircraft => ({
        ...aircraft,
        id: aircraft.id,
        registration: aircraft.registration,
        type: aircraft.type,
        status: aircraft.status,
        location: aircraft.location,
        totalHours: aircraft.total_hours,
        hoursSinceInspection: aircraft.hours_since_inspection,
        nextInspectionDue: aircraft.next_inspection_due,
        lastFlight: aircraft.last_flight,
        condition: aircraft.condition,
        conditionDetails: aircraft.condition_details,
        melList: aircraft.mel_list || [],
        maintenanceNotes: aircraft.maintenance_notes,
        lockedBy: aircraft.locked_by,
        currentFlight: aircraft.current_flight,
        name: aircraft.name,
        manufacturer: aircraft.manufacturer,
        year: aircraft.year,
        price: aircraft.price,
        specs: aircraft.specs
      }));

      setFleet(newFleet);

      // Update company count
      const updatedCompany = { ...company, aircraft: 3 };
      setCompany(updatedCompany);
      await api.updateCompany({
        ...updatedCompany,
        focus_area: updatedCompany.focusArea,
        total_flights: updatedCompany.totalFlights,
        total_earnings: updatedCompany.totalEarnings,
        flight_hours: updatedCompany.flightHours
      });

      console.log('Starter fleet seeded successfully:', newFleet.length, 'aircraft added.');
      return newFleet;
    } catch (error) {
      console.error('Failed to seed starter fleet:', error);
      return [];
    }
  };

  // Load initial data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load all data in parallel
        const results = await Promise.all([
          api.getCompany(),
          api.getPilot(),
          api.getFleet(),
          api.getActiveFlights(),
          api.getCompletedFlights()
        ]);

        const [companyData, pilotData, fleetData, activeFlightsData, completedFlightsData] = results;
        console.log('API Load Results:', { company: companyData, fleetSize: fleetData.length });

        // Transform snake_case from DB to camelCase for frontend
        const transformCompany = (data) => ({
          name: data.name || '',
          callsign: data.callsign || '',
          founded: data.founded || '',
          headquarters: data.headquarters || '',
          description: data.description || '',
          motto: data.motto || '',
          focusArea: data.focus_area || 'bush',
          pilots: data.pilots || 1,
          aircraft: data.aircraft || 3,
          totalFlights: data.total_flights || 0,
          totalEarnings: data.total_earnings || 0,
          flightHours: data.flight_hours || 0,
          balance: data.balance || 5000000,
          established: data.established || new Date().toISOString().split('T')[0]
        });

        const transformPilot = (data) => ({
          name: data.name || '',
          callsign: data.callsign || '',
          rank: data.rank || 'Junior Pilot',
          role: data.role || 'Company Owner',
          license: data.license || '',
          joinDate: data.join_date || new Date().toISOString().split('T')[0],
          totalFlights: data.total_flights || 0,
          totalHours: data.total_hours || 0,
          totalDistance: data.total_distance || 0,
          totalEarnings: data.total_earnings || 0,
          rating: data.rating || 0,
          onTimePercentage: data.on_time_percentage || 0,
          safetyRating: data.safety_rating || 100,
          experience: data.experience || 0,
          nextRankXP: data.next_rank_xp || 1000
        });

        const transformFleet = (data) => data.map(aircraft => ({
          id: aircraft.id,
          registration: aircraft.registration || `N${Math.floor(Math.random() * 90000) + 10000}`,
          type: aircraft.type,
          status: aircraft.status,
          location: aircraft.location,
          totalHours: aircraft.total_hours,
          hoursSinceInspection: aircraft.hours_since_inspection,
          nextInspectionDue: aircraft.next_inspection_due,
          lastFlight: aircraft.last_flight,
          condition: aircraft.condition,
          conditionDetails: aircraft.condition_details,
          melList: aircraft.mel_list || [],
          maintenanceNotes: aircraft.maintenance_notes,
          lockedBy: aircraft.locked_by,
          currentFlight: aircraft.current_flight,
          name: aircraft.name,
          manufacturer: aircraft.manufacturer,
          year: aircraft.year,
          price: aircraft.price,
          specs: aircraft.specs
        }));

        setCompany(transformCompany(companyData));
        setPilot(transformPilot(pilotData));

        const transformedFleet = transformFleet(fleetData);
        setFleet(transformedFleet);

        // Sync aircraft count if mismatch
        if (companyData.aircraft !== transformedFleet.length) {
          console.log(`Syncing aircraft count: ${companyData.aircraft} -> ${transformedFleet.length}`);
          const syncedCompany = { ...transformCompany(companyData), aircraft: transformedFleet.length };
          setCompany(syncedCompany);
          // Persist the sync
          api.updateCompany({
            ...syncedCompany,
            focus_area: syncedCompany.focusArea,
            total_flights: syncedCompany.totalFlights,
            total_earnings: syncedCompany.totalEarnings,
            flight_hours: syncedCompany.flightHours
          }).catch(err => console.error('Failed to sync aircraft count on backend:', err));
        }

        // Auto-seed starter fleet if company exists but fleet is empty
        if (companyData.name && transformedFleet.length === 0) {
          console.log('Empty fleet detected for existing company. Seeding starter fleet...');
          await seedStarterFleet();
        }

        setActiveFlights(activeFlightsData);
        setCompletedFlights(completedFlightsData);

        setLoading(false);
      } catch (err) {
        console.error('Failed to load data from API:', err);
        setError('Failed to connect to server. Please ensure the backend is running.');
        setLoading(false);
      }
    };

    loadData();
  }, []);

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


  // Flight being completed (for post-flight briefing)
  const [flightToComplete, setFlightToComplete] = useState(null);

  // Lock aircraft for a flight
  const lockAircraft = async (aircraftId, flightId) => {
    const aircraft = fleet.find(a => a.id === aircraftId);
    if (!aircraft) return;

    const updatedAircraft = {
      ...aircraft,
      status: 'in-flight',
      lockedBy: flightId,
      currentFlight: flightId
    };

    // Update in state
    setFleet(prevFleet =>
      prevFleet.map(a =>
        a.id === aircraftId ? updatedAircraft : a
      )
    );

    // Persist to API
    try {
      await api.updateAircraft(aircraftId, {
        ...updatedAircraft,
        total_hours: updatedAircraft.totalHours,
        hours_since_inspection: updatedAircraft.hoursSinceInspection,
        next_inspection_due: updatedAircraft.nextInspectionDue,
        last_flight: updatedAircraft.lastFlight,
        condition_details: updatedAircraft.conditionDetails,
        mel_list: updatedAircraft.melList,
        maintenance_notes: updatedAircraft.maintenanceNotes,
        locked_by: flightId,
        current_flight: flightId
      });
    } catch (error) {
      console.error('Failed to lock aircraft:', error);
    }
  };

  // Accept a flight
  const acceptFlight = async (flight, selectedAircraft) => {
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
    await lockAircraft(selectedAircraft.id, flightId);

    // Remove from available flights
    setAvailableFlights(prev => prev.filter(f => f.id !== flight.id));

    // Persist to API
    try {
      await api.addActiveFlight(newActiveFlight);
    } catch (error) {
      console.error('Failed to save active flight:', error);
    }

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

      const newPilot = {
        ...prev,
        totalFlights: newTotalFlights,
        totalHours: parseFloat(newTotalHours.toFixed(1)),
        totalDistance: newTotalDistance,
        totalEarnings: newTotalEarnings,
        rating: parseFloat(newRating.toFixed(1)),
        onTimePercentage: newOnTimePercentage,
        experience: newExperience
      };
      return newPilot;
    });

    // Use existing xpEarned for API persistence
    return {
      ...pilot,
      totalFlights: pilot.totalFlights + 1,
      totalHours: parseFloat((pilot.totalHours + flightHours).toFixed(1)),
      totalDistance: pilot.totalDistance + distance,
      totalEarnings: pilot.totalEarnings + earnings,
      rating: parseFloat((pilot.totalFlights === 0 ? (briefingData.severity === 'major' ? 3.0 : 5.0) : ((pilot.rating * pilot.totalFlights) + (briefingData.severity === 'major' ? 3.0 : 5.0)) / (pilot.totalFlights + 1)).toFixed(1)),
      onTimePercentage: Math.round(((Math.round((pilot.onTimePercentage / 100) * pilot.totalFlights) + (briefingData.onTime !== false ? 1 : 0)) / (pilot.totalFlights + 1)) * 100),
      experience: pilot.experience + xpEarned
    };
  };

  // Submit post-flight briefing and complete flight
  const completeFlightWithBriefing = async (flightId, briefingData) => {
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

    // Update Pilot Stats and get new data
    const updatedPilot = updatePilotStats(flight, briefingData);

    // Remove from active flights
    setActiveFlights(prev => prev.filter(f => f.id !== flightId));

    // Calculate final financials
    const finance = calculateFlightFinance(flight, aircraft);
    const netProfit = finance ? finance.profit : (briefingData.earnings || 0);
    const revenue = finance ? finance.revenue : (briefingData.earnings || 0);

    // Update company stats
    const updatedCompany = {
      ...company,
      totalFlights: company.totalFlights + 1,
      totalEarnings: company.totalEarnings + revenue,
      flightHours: company.flightHours + flightHours,
      balance: company.balance + netProfit
    };
    setCompany(updatedCompany);

    // Persist to API
    try {
      await Promise.all([
        api.addCompletedFlight({
          flight_id: completedFlight.flightId,
          flight_number: completedFlight.flightNumber,
          route: completedFlight.route,
          aircraft: completedFlight.aircraft,
          type: completedFlight.type,
          date: completedFlight.date,
          duration: completedFlight.duration,
          distance: completedFlight.distance,
          earnings: completedFlight.earnings,
          status: completedFlight.status,
          briefing: completedFlight.briefing
        }),
        api.deleteActiveFlight(flightId),
        api.updateCompany({
          ...updatedCompany,
          focus_area: updatedCompany.focusArea,
          total_flights: updatedCompany.totalFlights,
          total_earnings: updatedCompany.totalEarnings,
          flight_hours: updatedCompany.flightHours
        }),
        api.updatePilot({
          ...updatedPilot,
          join_date: updatedPilot.joinDate,
          total_flights: updatedPilot.totalFlights,
          total_hours: updatedPilot.totalHours,
          total_distance: updatedPilot.totalDistance,
          total_earnings: updatedPilot.totalEarnings,
          on_time_percentage: updatedPilot.onTimePercentage,
          safety_rating: updatedPilot.safetyRating,
          next_rank_xp: updatedPilot.nextRankXP
        })
      ]);
    } catch (error) {
      console.error('Failed to complete flight:', error);
    }

    // Clear flight to complete
    setFlightToComplete(null);
  };

  // Cancel flight briefing
  const cancelFlightBriefing = () => {
    setFlightToComplete(null);
  };

  // Update company
  const updateCompany = async (newCompanyData) => {
    setCompany(newCompanyData);

    // Persist to API
    try {
      await api.updateCompany({
        ...newCompanyData,
        focus_area: newCompanyData.focusArea,
        total_flights: newCompanyData.totalFlights,
        total_earnings: newCompanyData.totalEarnings,
        flight_hours: newCompanyData.flightHours
      });
    } catch (error) {
      console.error('Failed to update company:', error);
    }
  };

  // Update pilot
  const updatePilot = async (newPilotData) => {
    setPilot(newPilotData);

    // Persist to API
    try {
      await api.updatePilot({
        ...newPilotData,
        join_date: newPilotData.joinDate,
        total_flights: newPilotData.totalFlights,
        total_hours: newPilotData.totalHours,
        total_distance: newPilotData.totalDistance,
        total_earnings: newPilotData.totalEarnings,
        on_time_percentage: newPilotData.onTimePercentage,
        safety_rating: newPilotData.safetyRating,
        next_rank_xp: newPilotData.nextRankXP
      });
    } catch (error) {
      console.error('Failed to update pilot:', error);
    }
  };

  // Add aircraft to fleet
  const addAircraftToFleet = async (aircraft) => {
    // ICAO Registration Prefixes by Country
    const registrationPrefixes = {
      'Ireland': 'EI-',
      'UK': 'G-',
      'France': 'F-',
      'Germany': 'D-',
      'Switzerland': 'HB-',
      'Austria': 'OE-',
      'Norway': 'LN-',
      'Sweden': 'SE-',
      'Netherlands': 'PH-',
      'Belgium': 'OO-',
      'Italy': 'I-',
      'Spain': 'EC-',
      'Denmark': 'OY-',
      'Finland': 'OH-',
      'Poland': 'SP-',
      'Czech Republic': 'OK-',
      'Portugal': 'CS-',
      'Greece': 'SX-',
      'Iceland': 'TF-',
      'Luxembourg': 'LX-'
    };

    // Generate registration based on aircraft location
    const generateRegistration = () => {
      // Extract country from location string (format: "City, Country (ICAO)")
      let country = 'UK'; // Default
      if (aircraft.location) {
        const match = aircraft.location.match(/,\s*([^(]+)\s*\(/);
        if (match) {
          country = match[1].trim();
        }
      }

      const prefix = registrationPrefixes[country] || 'G-';

      // Generate suffix based on country format
      let suffix = '';
      if (prefix === 'N') {
        // US format: N12345
        suffix = Math.floor(Math.random() * 90000 + 10000).toString();
      } else if (prefix === 'G-') {
        // UK format: G-ABCD (4 letters)
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        for (let i = 0; i < 4; i++) {
          suffix += letters.charAt(Math.floor(Math.random() * letters.length));
        }
      } else if (prefix === 'EI-') {
        // Irish format: EI-ABC (3 letters)
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        for (let i = 0; i < 3; i++) {
          suffix += letters.charAt(Math.floor(Math.random() * letters.length));
        }
      } else {
        // European format: XX-ABC (3 letters/numbers)
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        for (let i = 0; i < 3; i++) {
          suffix += chars.charAt(Math.floor(Math.random() * chars.length));
        }
      }

      return prefix + suffix;
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

    const newFleet = [...fleet, fleetAircraft];
    setFleet(newFleet);

    // Remove from marketplace listings if it exists there
    setMarketListings(prev => prev.filter(a => a.id !== aircraft.id));

    const updatedCompany = {
      ...company,
      aircraft: newFleet.length,
      balance: company.balance - aircraft.price
    };
    setCompany(updatedCompany);

    // Persist to API
    try {
      await Promise.all([
        api.addAircraft({
          ...fleetAircraft,
          total_hours: fleetAircraft.totalHours,
          hours_since_inspection: fleetAircraft.hoursSinceInspection,
          next_inspection_due: fleetAircraft.nextInspectionDue,
          last_flight: fleetAircraft.lastFlight,
          condition_details: fleetAircraft.conditionDetails,
          mel_list: fleetAircraft.melList,
          maintenance_notes: fleetAircraft.maintenanceNotes,
          locked_by: fleetAircraft.lockedBy,
          current_flight: fleetAircraft.currentFlight
        }),
        api.updateCompany({
          ...updatedCompany,
          focus_area: updatedCompany.focusArea,
          total_flights: updatedCompany.totalFlights,
          total_earnings: updatedCompany.totalEarnings,
          flight_hours: updatedCompany.flightHours
        })
      ]);
    } catch (error) {
      console.error('Failed to add aircraft:', error);
    }
  };

  // Sell aircraft
  const sellAircraft = async (aircraftId) => {
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
    const updatedCompany = {
      ...company,
      aircraft: company.aircraft - 1,
      balance: company.balance + sellPrice
    };
    setCompany(updatedCompany);

    // Persist to API
    try {
      await Promise.all([
        api.deleteAircraft(aircraftId),
        api.updateCompany({
          ...updatedCompany,
          focus_area: updatedCompany.focusArea,
          total_flights: updatedCompany.totalFlights,
          total_earnings: updatedCompany.totalEarnings,
          flight_hours: updatedCompany.flightHours
        })
      ]);
    } catch (error) {
      console.error('Failed to sell aircraft:', error);
    }

    return sellPrice;
  };

  // Repair Aircraft (MEL or Component)
  const repairAircraft = async (aircraftId, type, itemData) => {
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
      const updatedCompany = {
        ...company,
        balance: company.balance - cost
      };
      setCompany(updatedCompany);

      // Update fleet
      setFleet(prev => prev.map(a => a.id === aircraftId ? newAircraft : a));

      // Persist to API
      try {
        await Promise.all([
          api.updateAircraft(aircraftId, {
            ...newAircraft,
            total_hours: newAircraft.totalHours,
            hours_since_inspection: newAircraft.hoursSinceInspection,
            next_inspection_due: newAircraft.nextInspectionDue,
            last_flight: newAircraft.lastFlight,
            condition_details: newAircraft.conditionDetails,
            mel_list: newAircraft.melList,
            maintenance_notes: newAircraft.maintenanceNotes,
            locked_by: newAircraft.lockedBy,
            current_flight: newAircraft.currentFlight
          }),
          api.updateCompany({
            ...updatedCompany,
            focus_area: updatedCompany.focusArea,
            total_flights: updatedCompany.totalFlights,
            total_earnings: updatedCompany.totalEarnings,
            flight_hours: updatedCompany.flightHours
          })
        ]);
      } catch (error) {
        console.error('Failed to persist repair:', error);
      }
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
    lockAircraft,
    marketListings,
    refreshMarket
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-300 font-medium animate-pulse">Initializing Virtual Airline Management Center...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800 border-2 border-red-500/30 rounded-xl p-8 shadow-2xl">
          <div className="flex items-center gap-4 text-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-2xl font-bold">System Error</h2>
          </div>
          <p className="text-slate-300 mb-6 leading-relaxed">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-lg"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContext;