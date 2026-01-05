/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import aircraftTypes from '../data/aircraftTypes.json';
import { calculateFlightFinance } from '../utils/flightCalculations';
import api from '../lib/api';
import { generateAircraft } from '../utils/aircraftGenerator';
import { generateMissions } from '../utils/missionGenerator';
import { FUEL_PRICES, FUEL_TYPES, CATEGORY_TO_FUEL } from '../lib/constants';

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
    currentLocation: 'Weston, Ireland (EIWT)' // Default
  });

  // Fleet State
  const [fleet, setFleet] = useState([]);

  // Active Flights State
  const [activeFlights, setActiveFlights] = useState([]);

  // Available Flights State (Dispatch Center)
  const [availableFlights, setAvailableFlights] = useState([]);

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
      // Defer to avoid synchronous render warning
      setTimeout(() => refreshMarket(), 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          location: "Weston, Ireland (EIWT)", // Base at Weston
          status: 'available',
          category: aircraft.category, // Map category
          total_hours: aircraft.hours || aircraft.conditionDetails?.airframe?.ttaf || 0,
          hours_since_inspection: 0,
          next_inspection_due: 100,
          last_flight: new Date().toISOString().split('T')[0],
          condition_details: aircraft.conditionDetails,
          mel_list: aircraft.melList || [],
          maintenance_notes: '',
          current_flight: null,
          fuel_level: 100,
          fuel_capacity: 100,
          fuel_type: CATEGORY_TO_FUEL[aircraft.category] || FUEL_TYPES.AVGAS,
          payload_capacity: aircraft.specs?.payload || 0,
          oil_condition: 100,
          tire_condition: 100,
          engine_condition: 100,
          hours_at_last_a: 0,
          hours_at_last_b: 0,
          hours_at_last_c: 0,
          hours_at_last_d: 0
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
        fuelLevel: aircraft.fuel_level || 100,
        fuelCapacity: aircraft.fuel_capacity || 100,
        fuelType: aircraft.fuel_type || FUEL_TYPES.AVGAS,
        payloadCapacity: aircraft.payload_capacity || 0,
        oilCondition: aircraft.oil_condition || 100,
        tireCondition: aircraft.tire_condition || 100,
        engineCondition: aircraft.engine_condition || 100,
        hoursAtLastA: aircraft.hours_at_last_a || 0,
        hoursAtLastB: aircraft.hours_at_last_b || 0,
        hoursAtLastC: aircraft.hours_at_last_c || 0,
        hoursAtLastD: aircraft.hours_at_last_d || 0,
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
          api.getCompletedFlights(),
          api.getMissions()
        ]);

        const [companyData, pilotData, fleetData, activeFlightsData, completedFlightsData, missionsData] = results;
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
          nextRankXP: data.next_rank_xp || 1000,
          currentLocation: data.current_location || 'Weston, Ireland (EIWT)'
        });

        const transformFleet = (data) => data.map(aircraft => ({
          id: aircraft.id,
          registration: aircraft.registration || `N${Math.floor(Math.random() * 90000) + 10000}`,
          type: aircraft.type,
          category: aircraft.category, // Map category for filtering
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
          fuelLevel: aircraft.fuel_level || 100,
          fuelCapacity: aircraft.fuel_capacity || 100,
          fuelType: aircraft.fuel_type || FUEL_TYPES.AVGAS,
          payloadCapacity: aircraft.payload_capacity || 0,
          oilCondition: aircraft.oil_condition || 100,
          tireCondition: aircraft.tire_condition || 100,
          engineCondition: aircraft.engine_condition || 100,
          hoursAtLastA: aircraft.hours_at_last_a || 0,
          hoursAtLastB: aircraft.hours_at_last_b || 0,
          hoursAtLastC: aircraft.hours_at_last_c || 0,
          hoursAtLastD: aircraft.hours_at_last_d || 0,
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
        setAvailableFlights(missionsData);

        setLoading(false);
      } catch (err) {
        console.error('Failed to load data from API:', err);
        setError('Failed to connect to server. Please ensure the backend is running.');
        setLoading(false);
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refresh Available Flights
  const refreshAvailableFlights = async () => {
    if (fleet.length > 0) {
      // Generate 10 missions per aircraft
      const newMissions = generateMissions(fleet, 10);
      setAvailableFlights(newMissions);

      // Persist to API
      try {
        await api.refreshMissions(newMissions);
      } catch (error) {
        console.error('Failed to persist missions to API:', error);
      }
    }
  };

  // Populate initial flights when fleet is ready
  useEffect(() => {
    if (!loading && fleet.length > 0 && availableFlights.length === 0) {
      // Defer to avoid synchronous render warning
      setTimeout(() => refreshAvailableFlights(), 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, fleet.length]);





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
        fuel_level: updatedAircraft.fuelLevel,
        fuel_capacity: updatedAircraft.fuelCapacity,
        fuel_type: updatedAircraft.fuelType,
        payload_capacity: updatedAircraft.payloadCapacity,
        oil_condition: updatedAircraft.oilCondition,
        tire_condition: updatedAircraft.tireCondition,
        engine_condition: updatedAircraft.engineCondition,
        hours_at_last_a: updatedAircraft.hoursAtLastA || 0,
        hours_at_last_b: updatedAircraft.hoursAtLastB || 0,
        hours_at_last_c: updatedAircraft.hoursAtLastC || 0,
        hours_at_last_d: updatedAircraft.hoursAtLastD || 0,
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
        experience: newExperience,
        currentLocation: `${flight.route.to} (${flight.route.toCode})`
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
      experience: pilot.experience + xpEarned,
      currentLocation: `${flight.route.to} (${flight.route.toCode})`
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

    // Calculate fuel consumption: Assume 0.15 gal per nm for standard fleet, adjust based on specs if available
    const fuelConsumption = flight.distance * 0.15;
    const newFuelLevel = Math.max(0, aircraft.fuelLevel - fuelConsumption);

    // Wear and Tear calculations (randomized but consistent)
    const wearTear = (flight.distance / 100) * 2; // ~2% wear per 100nm
    const newOilCondition = Math.max(0, aircraft.oilCondition - (wearTear * 0.5));
    const newTireCondition = Math.max(0, aircraft.tireCondition - (wearTear * 0.8));
    const newEngineCondition = Math.max(0, aircraft.engineCondition - wearTear);

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
            currentFlight: null,
            fuelLevel: newFuelLevel,
            fuelType: a.fuelType || FUEL_TYPES.AVGAS,
            oilCondition: newOilCondition,
            tireCondition: newTireCondition,
            engineCondition: newEngineCondition,
            hoursAtLastA: a.hoursAtLastA || 0,
            hoursAtLastB: a.hoursAtLastB || 0,
            hoursAtLastC: a.hoursAtLastC || 0,
            hoursAtLastD: a.hoursAtLastD || 0
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
          next_rank_xp: updatedPilot.nextRankXP,
          current_location: updatedPilot.currentLocation
        }),
        api.updateAircraft(aircraft.id, {
          ...aircraft,
          status: newAircraftStatus,
          location: `${flight.route.to} (${flight.route.toCode})`,
          total_hours: aircraft.totalHours + flightHours,
          hours_since_inspection: aircraft.hoursSinceInspection + flightHours,
          next_inspection_due: aircraft.nextInspectionDue - flightHours,
          last_flight: new Date().toISOString().split('T')[0],
          condition: newCondition,
          maintenance_notes: maintenanceNotes,
          locked_by: null,
          current_flight: null,
          fuel_level: newFuelLevel,
          fuel_type: aircraft.fuelType || FUEL_TYPES.AVGAS,
          oil_condition: newOilCondition,
          tire_condition: newTireCondition,
          engine_condition: newEngineCondition
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
        next_rank_xp: newPilotData.nextRankXP,
        current_location: newPilotData.currentLocation
      });
    } catch (error) {
      console.error('Failed to update pilot:', error);
    }
  };

  // Refuel aircraft
  const refuelAircraft = async (aircraftId, amount, cost) => {
    try {
      await api.refuelAircraft(aircraftId, amount, cost);

      // Update local state
      setFleet(prev => prev.map(a =>
        a.id === aircraftId
          ? { ...a, fuelLevel: Math.min(a.fuelCapacity, a.fuelLevel + amount) }
          : a
      ));

      setCompany(prev => ({ ...prev, balance: prev.balance - cost }));
    } catch (error) {
      console.error('Failed to refuel aircraft:', error);
      alert('REFUEL ERROR: Backend transaction failed.');
    }
  };

  // Perform Maintenance Check
  const performMaintenanceCheck = async (aircraftId, type, cost) => {
    try {
      const aircraft = fleet.find(a => a.id === aircraftId);
      if (!aircraft) return;

      const updatedAircraft = {
        ...aircraft,
        hoursSinceInspection: 0,
        [`hoursAtLast${type}`]: aircraft.totalHours
      };

      // Reset condition based on check type
      if (type === 'D') {
        updatedAircraft.condition = 'excellent';
        updatedAircraft.engineCondition = 100;
        updatedAircraft.oilCondition = 100;
        updatedAircraft.tireCondition = 100;
      } else if (type === 'C') {
        updatedAircraft.condition = 'excellent';
      }

      setFleet(prev => prev.map(a => a.id === aircraftId ? updatedAircraft : a));
      setCompany(prev => ({ ...prev, balance: prev.balance - cost }));

      await Promise.all([
        api.updateAircraft(aircraftId, {
          ...updatedAircraft,
          total_hours: updatedAircraft.totalHours,
          hours_since_inspection: 0,
          next_inspection_due: 100,
          last_flight: updatedAircraft.lastFlight,
          condition: updatedAircraft.condition,
          fuel_level: updatedAircraft.fuelLevel,
          fuel_capacity: updatedAircraft.fuelCapacity,
          fuel_type: updatedAircraft.fuelType,
          payload_capacity: updatedAircraft.payloadCapacity,
          oil_condition: updatedAircraft.oilCondition,
          tire_condition: updatedAircraft.tireCondition || 100,
          engine_condition: updatedAircraft.engineCondition || 100,
          hours_at_last_a: updatedAircraft.hoursAtLastA || 0,
          hours_at_last_b: updatedAircraft.hoursAtLastB || 0,
          hours_at_last_c: updatedAircraft.hoursAtLastC || 0,
          hours_at_last_d: updatedAircraft.hoursAtLastD || 0,
          locked_by: null,
          current_flight: null
        }),
        api.updateCompany({
          ...company,
          balance: company.balance - cost,
          focus_area: company.focusArea,
          total_flights: company.totalFlights,
          total_earnings: company.totalEarnings,
          flight_hours: company.flightHours
        })
      ]);
    } catch (error) {
      console.error(`Failed to perform ${type}-Check:`, error);
    }
  };

  // Travel to location (for marketplace purchase)
  const travelToLocation = async (destination, cost) => {
    try {
      const updatedPilot = {
        ...pilot,
        currentLocation: destination
      };
      setPilot(updatedPilot);

      const updatedCompany = {
        ...company,
        balance: company.balance - cost
      };
      setCompany(updatedCompany);

      await Promise.all([
        api.updatePilot({
          ...updatedPilot,
          join_date: updatedPilot.joinDate,
          total_flights: updatedPilot.totalFlights,
          total_hours: updatedPilot.totalHours,
          total_distance: updatedPilot.totalDistance,
          total_earnings: updatedPilot.totalEarnings,
          on_time_percentage: updatedPilot.onTimePercentage,
          safety_rating: updatedPilot.safetyRating,
          next_rank_xp: updatedPilot.nextRankXP,
          current_location: updatedPilot.currentLocation
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
      console.error('Failed to travel to location:', error);
      alert('TRAVEL ERROR: Backend transaction failed.');
    }
  };

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
      id: `FLEET-${Date.now()}`, // Unique stable ID 
      registration: aircraft.registration || generateRegistration(),
      type: aircraft.name || aircraft.type || 'Unknown Aircraft',
      category: aircraft.category, // Crucial for filtering
      status: aircraft.status || 'available',
      location: aircraft.location || 'Unknown',
      totalHours: aircraft.hours || aircraft.conditionDetails?.airframe?.ttaf || 0,
      hoursSinceInspection: aircraft.hoursSinceInspection || 0,
      nextInspectionDue: aircraft.nextInspectionDue || 100,
      lastFlight: aircraft.lastFlight || new Date().toISOString().split('T')[0],
      condition: aircraft.condition || 'good',
      conditionDetails: aircraft.conditionDetails || null,
      fuelLevel: 100,
      fuelCapacity: 100,
      fuelType: CATEGORY_TO_FUEL[aircraft.category] || FUEL_TYPES.AVGAS,
      payloadCapacity: aircraft.specs?.payload || 0,
      oilCondition: 100,
      tireCondition: 100,
      engineCondition: 100,
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
          maintenance_notes: '',
          current_flight: null,
          fuel_level: fleetAircraft.fuelLevel,
          fuel_capacity: fleetAircraft.fuelCapacity,
          fuel_type: fleetAircraft.fuelType,
          payload_capacity: fleetAircraft.payloadCapacity,
          oil_condition: fleetAircraft.oilCondition,
          tire_condition: fleetAircraft.tireCondition,
          engine_condition: fleetAircraft.engineCondition
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
      console.error('Failed to add aircraft to fleet:', error);
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

      success = true;
    } else if (type === 'LOGISTICS') {
      // Existing logistics repair logic
      if (itemData.component === 'oil') {
        newAircraft.oilCondition = 100;
      } else if (itemData.component === 'tires') {
        newAircraft.tireCondition = 100;
      }
      cost = itemData.cost;
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
            current_flight: newAircraft.currentFlight,
            fuel_level: newAircraft.fuelLevel,
            oil_condition: newAircraft.oilCondition,
            tire_condition: newAircraft.tireCondition,
            engine_condition: newAircraft.engineCondition
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
    } else {
      // Special case for logistics-only repairs (Oil/Tires) from Hangar
      if (type === 'LOGISTICS') {
        // itemData: { component: 'oil' | 'tires', cost: number }
        try {
          await api.repairAircraft(aircraftId, itemData.cost, itemData.component);

          setFleet(prev => prev.map(a => {
            if (a.id !== aircraftId) return a;
            return {
              ...a,
              [itemData.component + 'Condition']: 100
            };
          }));

          setCompany(prev => ({ ...prev, balance: prev.balance - itemData.cost }));
        } catch (error) {
          console.error('Logistics repair failed:', error);
        }
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
    performMaintenanceCheck, // Exposed for Fleet/Hangar components
    travelToLocation,        // Exposed for map/travel features
    refuelAircraft,
    lockAircraft,
    marketListings,
    refreshMarket,
    refreshAvailableFlights
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