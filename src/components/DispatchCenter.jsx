import React, { useState } from 'react';
import { useAppContext } from './AppContext';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Radio,
  MapPin,
  Clock,
  Package,
  Users,
  Cloud,
  AlertTriangle,
  CheckCircle,
  Plane,
  ChevronDown,
  ChevronUp,
  Wind,
  Eye,
  Thermometer,
  Loader2,
  DollarSign
} from 'lucide-react';
import { getFlightWeather, formatMETAR, formatTAF, getFlightRules, getWindInfo, getVisibility } from '../utils/weatherAPI';
import NotamBriefing from './NotamBriefing';
import { calculateFlightFinance, formatCurrency } from '../utils/flightCalculations';
import { FUEL_TYPES } from '../lib/constants';

// Fix for default marker icons in Leaflet with webpack/vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom departure icon (green)
const departureIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Custom arrival icon (red)
const arrivalIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Weather card component
function WeatherCard({ title, metar, taf, station, isLoading }) {
  const flightRules = metar ? getFlightRules(metar) : 'UNKNOWN';

  const getFlightRulesColor = (rules) => {
    switch (rules) {
      case 'VFR': return 'bg-green-100 text-green-800 border-green-300';
      case 'MVFR': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'IFR': return 'bg-red-100 text-red-800 border-red-300';
      case 'LIFR': return 'bg-purple-100 text-purple-800 border-purple-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
          <h4 className="font-bold text-gray-900">{title}</h4>
        </div>
        <p className="text-gray-500 text-sm">Loading weather data...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-100 text-gray-600 rounded-md">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-400">Station Data</h4>
            <p className="text-lg font-bold text-gray-900 leading-none mt-1">{title}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getFlightRulesColor(flightRules)}`}>
          {flightRules}
        </span>
      </div>

      {/* Station Info */}
      {station && (
        <div className="mb-3 pb-3 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-900">{station.name}</p>
          <p className="text-xs text-gray-500">
            {station.city}, {station.country} • Elev: {station.elevation_ft || 'N/A'} ft
          </p>
        </div>
      )}

      {/* METAR */}
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          <span className="text-xs font-semibold text-gray-500 uppercase">METAR / Observed</span>
        </div>
        <p className="text-xs font-mono bg-gray-50 p-3 border border-gray-200 text-gray-700 leading-relaxed rounded-md">
          {formatMETAR(metar)}
        </p>

        {/* Parsed METAR Info */}
        {metar && (
          <div className="grid grid-cols-3 gap-2 mt-2">
            <div className="flex items-center gap-1 text-xs">
              <Wind className="w-3 h-3 text-gray-400" />
              <span className="text-gray-600">{getWindInfo(metar)}</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <Eye className="w-3 h-3 text-gray-400" />
              <span className="text-gray-600">{getVisibility(metar)}</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <Thermometer className="w-3 h-3 text-gray-400" />
              <span className="text-gray-600">
                {metar.temperature?.repr || 'N/A'}°C
              </span>
            </div>
          </div>
        )}
      </div>

      {/* TAF */}
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-2 mt-4">
          <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
          <span className="text-xs font-semibold text-gray-500 uppercase">TAF / Forecast</span>
        </div>
        <p className="text-xs font-mono bg-gray-50 p-3 border border-gray-200 text-gray-700 leading-relaxed max-h-24 overflow-y-auto rounded-md">
          {formatTAF(taf)}
        </p>
      </div>

      {/* Nowcast (simplified interpretation) */}
      <div>
        <div className="flex items-center gap-1 mb-1">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-semibold text-gray-600 uppercase">Nowcast</span>
        </div>
        <div className="bg-blue-50 p-2 rounded-md border border-blue-100">
          {metar ? (
            <p className="text-xs text-blue-800">
              {flightRules === 'VFR' && '✅ Good conditions for visual flight operations.'}
              {flightRules === 'MVFR' && '⚠️ Marginal conditions - reduced visibility or low ceilings.'}
              {flightRules === 'IFR' && '🔴 Instrument conditions required - low visibility/ceilings.'}
              {flightRules === 'LIFR' && '❌ Very low IFR - extreme caution advised.'}
              {flightRules === 'UNKNOWN' && 'Weather conditions unknown.'}
            </p>
          ) : (
            <p className="text-xs text-gray-500">Nowcast unavailable</p>
          )}
        </div>
      </div>
    </div>
  );
}

// Flight Map Component
function FlightMap({ departure, arrival }) {
  if (!departure?.station || !arrival?.station) {
    return (
      <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
        <p className="text-gray-500">Map unavailable - station coordinates not found</p>
      </div>
    );
  }

  const depCoords = [departure.station.latitude, departure.station.longitude];
  const arrCoords = [arrival.station.latitude, arrival.station.longitude];

  // Calculate center point
  const centerLat = (depCoords[0] + arrCoords[0]) / 2;
  const centerLng = (depCoords[1] + arrCoords[1]) / 2;

  // Route line
  const routeLine = [depCoords, arrCoords];

  return (
    <div className="rounded-lg overflow-hidden border border-gray-200" style={{ height: '300px' }}>
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={5}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Departure Marker */}
        <Marker position={depCoords} icon={departureIcon}>
          <Popup>
            <div className="text-center">
              <p className="font-bold text-green-700">DEPARTURE</p>
              <p className="font-semibold">{departure.station.icao}</p>
              <p className="text-sm">{departure.station.name}</p>
            </div>
          </Popup>
        </Marker>

        {/* Arrival Marker */}
        <Marker position={arrCoords} icon={arrivalIcon}>
          <Popup>
            <div className="text-center">
              <p className="font-bold text-red-700">ARRIVAL</p>
              <p className="font-semibold">{arrival.station.icao}</p>
              <p className="text-sm">{arrival.station.name}</p>
            </div>
          </Popup>
        </Marker>

        {/* Route Line */}
        <Polyline
          positions={routeLine}
          pathOptions={{
            color: '#1e40af',
            weight: 3,
            opacity: 0.8,
            dashArray: '10, 10'
          }}
        />
      </MapContainer>
    </div>
  );
}

function DispatchCenter() {
  const { availableFlights, activeFlights, fleet, acceptFlight, startPostFlightBriefing, refreshAvailableFlights } = useAppContext();
  const [expandedFlight, setExpandedFlight] = useState(null);
  const [selectedAircraft, setSelectedAircraft] = useState(null);
  const [showAircraftSelection, setShowAircraftSelection] = useState(null);
  const [weatherData, setWeatherData] = useState({});
  const [loadingWeather, setLoadingWeather] = useState({});

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = (priority) => {
    if (priority === 'urgent') {
      return <AlertTriangle className="w-4 h-4" />;
    }
    return <CheckCircle className="w-4 h-4" />;
  };

  const getAvailableAircraft = () => {
    // Get aircraft that are available and suitable for the flight
    return fleet.filter(aircraft =>
      aircraft.status === 'available' &&
      !aircraft.lockedBy
    );
  };

  const handleAcceptFlight = (flight, aircraft) => {
    if (!aircraft) {
      alert('Please select an aircraft for this flight');
      return;
    }

    // Logistics Check
    const fuelNeeded = flight.distance * 0.15;
    if (aircraft.fuelLevel < fuelNeeded) {
      alert(`DISPATCH REJECTED: Insufficient fuel. Needed: ${fuelNeeded.toFixed(1)} gal, Available: ${aircraft.fuelLevel.toFixed(1)} gal.`);
      return;
    }

    if (aircraft.condition < 40 || aircraft.engineCondition < 40 || aircraft.oilCondition < 20 || aircraft.tireCondition < 20) {
      alert('DISPATCH REJECTED: Airframe condition below safety minimums. Service required.');
      return;
    }

    acceptFlight(flight, aircraft);
    setShowAircraftSelection(null);
    setSelectedAircraft(null);

    alert(`Flight accepted! Aircraft ${aircraft.registration} is now assigned and locked for this flight.`);
  };

  const toggleFlightDetails = async (flightId, flight) => {
    if (expandedFlight === flightId) {
      setExpandedFlight(null);
    } else {
      setExpandedFlight(flightId);

      // Fetch weather data if not already loaded
      if (!weatherData[flightId]) {
        setLoadingWeather(prev => ({ ...prev, [flightId]: true }));

        try {
          const weather = await getFlightWeather(flight.route.fromCode, flight.route.toCode);
          setWeatherData(prev => ({ ...prev, [flightId]: weather }));
        } catch (error) {
          console.error('Error fetching weather:', error);
        } finally {
          setLoadingWeather(prev => ({ ...prev, [flightId]: false }));
        }
      }
    }
  };

  const toggleAircraftSelection = (flightId) => {
    setShowAircraftSelection(showAircraftSelection === flightId ? null : flightId);
    setSelectedAircraft(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dispatch Center</h2>
          <p className="text-gray-500">Available missions for your fleet</p>
        </div>
        <button
          onClick={refreshAvailableFlights}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition shadow-sm"
        >
          <Radio className="w-4 h-4" />
          Scan for Jobs
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Available</p>
              <p className="text-3xl font-bold text-gray-900">{availableFlights.length}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">In Progress</p>
              <p className="text-3xl font-bold text-blue-600">{activeFlights.length}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-full">
              <Plane className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Completed</p>
              <p className="text-3xl font-bold text-gray-900">0</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-full">
              <CheckCircle className="w-6 h-6 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Active Flights */}
      {activeFlights.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900">Active Flights</h3>
          <div className="space-y-4">
            {activeFlights.map(flight => (
              <div key={flight.id} className="bg-white rounded-lg shadow-sm border border-l-4 border-l-blue-600 border-gray-200 p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{flight.flightNumber}</h3>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 flex items-center gap-1">
                        <Plane className="w-3 h-3" />
                        IN PROGRESS
                      </span>
                    </div>
                    <p className="text-gray-600">{flight.aircraftRegistration} - {flight.aircraft}</p>
                  </div>
                  <button
                    onClick={() => startPostFlightBriefing(flight.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition shadow-sm"
                  >
                    Complete Flight
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase mb-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      Route
                    </p>
                    <p className="font-semibold text-gray-900">
                      {flight.route.from} ({flight.route.fromCode})
                    </p>
                    <p className="font-semibold text-gray-900">
                      → {flight.route.to} ({flight.route.toCode})
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase mb-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Duration
                    </p>
                    <p className="font-semibold text-gray-900">{flight.duration}</p>
                    <p className="text-sm text-gray-500">{flight.distance} nm</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase mb-1 flex items-center gap-1">
                      <Package className="w-3 h-3" />
                      Cargo
                    </p>
                    <p className="font-semibold text-gray-900">{flight.cargo.type}</p>
                    {flight.cargo.passengers > 0 && (
                      <p className="text-sm text-gray-500">{flight.cargo.passengers} pax</p>
                    )}
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase mb-1 flex items-center gap-1">
                      <Cloud className="w-3 h-3" />
                      Weather
                    </p>
                    <p className="font-semibold text-green-600">{flight.weather}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Flights */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-900">Available Flights</h3>

        {availableFlights.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Radio className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No Flights Available</h3>
            <p className="text-gray-500">Check back later for new mission opportunities</p>
          </div>
        ) : (
          <div className="space-y-4">
            {availableFlights.map(flight => {
              const availableAircraft = getAvailableAircraft();
              const isExpanded = expandedFlight === flight.id;
              const showingAircraftSelection = showAircraftSelection === flight.id;
              const flightWeather = weatherData[flight.id];
              const isLoadingWeather = loadingWeather[flight.id];

              return (
                <div key={flight.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:border-blue-500 transition-colors">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">{flight.flightNumber}</h3>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(flight.priority)}`}>
                            {getPriorityIcon(flight.priority)}
                            {flight.priority === 'urgent' ? 'URGENT' : 'Available'}
                          </span>
                        </div>
                        <p className="text-gray-600 font-medium">{flight.aircraft}</p>
                      </div>

                      <button
                        onClick={() => toggleFlightDetails(flight.id, flight)}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all rounded-lg text-sm font-medium"
                      >
                        <span>
                          {isExpanded ? 'Hide Details' : 'View Details'}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {/* Basic Info */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-gray-50 p-4 rounded-lg mb-4">
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-medium mb-1">Route</p>
                        <p className="font-semibold text-gray-900">
                          {flight.route.from} <span className="text-gray-400">→</span> {flight.route.to}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {flight.route.fromCode} - {flight.route.toCode}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 uppercase font-medium mb-1">Duration</p>
                        <p className="font-semibold text-gray-900">{flight.duration}</p>
                        <p className="text-xs text-gray-500 mt-1">{flight.distance} nm</p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 uppercase font-medium mb-1">Payload</p>
                        <p className="font-semibold text-gray-900 flex items-center gap-2">
                          {flight.cargo.passengers > 0 && <Users className="w-4 h-4 text-gray-400" />}
                          {flight.cargo.passengers > 0 ? `${flight.cargo.passengers} Pax` : flight.cargo.type}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 uppercase font-medium mb-1">Est. Profit</p>
                        {availableAircraft.length > 0 ? (
                          (() => {
                            const finance = calculateFlightFinance(flight, availableAircraft[0]);
                            return (
                              <p className={`font-bold ${finance?.profit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {finance ? formatCurrency(finance.profit) : 'N/A'}
                              </p>
                            );
                          })()
                        ) : (
                          <p className="text-xs text-gray-400 italic">No Aircraft Avail</p>
                        )}
                      </div>
                    </div>

                    {/* Notes */}
                    {flight.notes && (
                      <div className={`p-4 rounded-lg text-sm ${flight.priority === 'urgent' ? 'bg-red-50 text-red-800 border-l-4 border-red-500' : 'bg-yellow-50 text-yellow-800 border-l-4 border-yellow-500'}`}>
                        <span className="font-bold mr-2">Note:</span>
                        {flight.notes}
                      </div>
                    )}

                    {/* Action Bar */}
                    <div className="mt-6 flex justify-end">
                      <button
                        onClick={() => toggleAircraftSelection(flight.id)}
                        className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
                      >
                        <Plane className="w-4 h-4" />
                        {showingAircraftSelection ? 'Cancel Assignment' : 'Assign Aircraft'}
                      </button>
                    </div>

                    {/* Expanded Flight Details */}
                    {isExpanded && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        {/* Financial Breakdown Section */}
                        <div className="mb-8 bg-gray-50 rounded-lg p-6 border border-gray-200">
                          <h4 className="text-md font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-gray-500" />
                            Financial Estimator
                          </h4>
                          {availableAircraft.length > 0 ? (
                            (() => {
                              // Use selected aircraft if available, otherwise first available
                              const refAircraft = selectedAircraft || availableAircraft[0];
                              const finance = calculateFlightFinance(flight, refAircraft);

                              return finance ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                  <div>
                                    <p className="text-sm font-medium text-gray-500 mb-1">Projected Revenue</p>
                                    <div className="text-2xl font-bold text-gray-900">{formatCurrency(finance.revenue)}</div>
                                    <p className="text-xs text-gray-400 mt-1">Based on payload & distance</p>
                                  </div>

                                  <div>
                                    <p className="text-sm font-medium text-gray-500 mb-2">Estimated Costs</p>
                                    <div className="space-y-2 text-sm">
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Fuel ({refAircraft.type})</span>
                                        <span className="font-medium">{formatCurrency(finance.expenses.fuel)}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Crew & Maintenance</span>
                                        <span className="font-medium">{formatCurrency(finance.expenses.pilot + finance.expenses.maintenance)}</span>
                                      </div>
                                      <div className="border-t border-gray-300 pt-2 mt-2 flex justify-between font-bold">
                                        <span className="text-gray-800">Net Profit</span>
                                        <span className={finance.profit > 0 ? 'text-green-600' : 'text-red-600'}>
                                          {formatCurrency(finance.profit)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ) : <p className="text-gray-500">Calculation unavailable</p>;
                            })()
                          ) : (
                            <p className="text-gray-500 italic text-sm">Assign an aircraft to view financial breakdown.</p>
                          )}
                        </div>

                        <h4 className="text-md font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <Cloud className="w-5 h-5 text-gray-500" />
                          Flight Conditions
                        </h4>

                        {/* Map */}
                        <div className="mb-6 rounded-lg overflow-hidden border border-gray-200">
                          {isLoadingWeather ? (
                            <div className="bg-gray-100 h-64 flex items-center justify-center">
                              <div className="flex items-center gap-2 text-gray-500">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Loading route data...</span>
                              </div>
                            </div>
                          ) : flightWeather ? (
                            <FlightMap departure={flightWeather.departure} arrival={flightWeather.arrival} />
                          ) : (
                            <div className="bg-gray-100 h-64 flex items-center justify-center">
                              <p className="text-gray-500">Route map unavailable</p>
                            </div>
                          )}
                        </div>

                        {/* Weather Cards */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                          <WeatherCard
                            title={`Departure: ${flight.route.fromCode}`}
                            icao={flight.route.fromCode}
                            metar={flightWeather?.departure?.metar}
                            taf={flightWeather?.departure?.taf}
                            station={flightWeather?.departure?.station}
                            isLoading={isLoadingWeather}
                          />
                          <WeatherCard
                            title={`Arrival: ${flight.route.toCode}`}
                            icao={flight.route.toCode}
                            metar={flightWeather?.arrival?.metar}
                            taf={flightWeather?.arrival?.taf}
                            station={flightWeather?.arrival?.station}
                            isLoading={isLoadingWeather}
                          />
                        </div>

                        {/* AI NOTAM Briefing */}
                        <div className="mt-8">
                          <NotamBriefing
                            departureCode={flight.route.fromCode}
                            arrivalCode={flight.route.toCode}
                          />
                        </div>
                      </div>
                    )}

                    {/* Aircraft Selection */}
                    {showingAircraftSelection && (
                      <div className="mt-6 bg-gray-50 p-6 rounded-lg border border-gray-200">
                        <h4 className="font-bold text-gray-900 mb-4">Select Aircraft</h4>

                        {availableAircraft.length === 0 ? (
                          <div className="text-center py-8">
                            <p className="text-gray-500">No suitable aircraft available at this location.</p>
                          </div>
                        ) : (
                          <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                              {availableAircraft.map(aircraft => {
                                const fuelReq = flight.distance * 0.15;
                                const hasFuel = aircraft.fuelLevel >= fuelReq;
                                const isSafe = aircraft.condition >= 40 && aircraft.engineCondition >= 40;

                                return (
                                  <button
                                    key={aircraft.id}
                                    onClick={() => setSelectedAircraft(aircraft)}
                                    className={`p-4 rounded-lg border text-left transition-all ${selectedAircraft?.id === aircraft.id
                                      ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                                      : 'border-gray-200 hover:border-gray-300 bg-white'
                                      } ${(!hasFuel || !isSafe) ? 'opacity-75' : ''}`}
                                  >
                                    <div className="flex items-start justify-between mb-2">
                                      <div>
                                        <p className="font-bold text-gray-900">{aircraft.registration}</p>
                                        <p className="text-xs text-gray-500">{aircraft.type}</p>
                                      </div>
                                      <span className={`px-2 py-0.5 text-xs font-semibold rounded ${hasFuel && isSafe ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {hasFuel && isSafe ? 'READY' : 'UNAVAILABLE'}
                                      </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-xs mt-3 pt-3 border-t border-gray-100">
                                      <div>
                                        <p className="text-gray-500 mb-0.5">Fuel</p>
                                        <p className={`font-medium ${hasFuel ? 'text-gray-900' : 'text-red-600'}`}>
                                          {aircraft.fuelLevel.toFixed(0)} / {fuelReq.toFixed(0)} Gal
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-gray-500 mb-0.5">Condition</p>
                                        <p className={`font-medium ${isSafe ? 'text-gray-900' : 'text-red-600'}`}>
                                          {Math.round(aircraft.condition)}%
                                        </p>
                                      </div>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>

                            <button
                              onClick={() => handleAcceptFlight(flight, selectedAircraft)}
                              disabled={!selectedAircraft}
                              className={`w-full px-6 py-3 rounded-lg font-bold transition-all shadow-sm ${selectedAircraft
                                ? 'bg-green-600 text-white hover:bg-green-700'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                }`}
                            >
                              {selectedAircraft
                                ? `Confirm Assignment: ${selectedAircraft.registration}`
                                : 'Select Aircraft to Proceed'
                              }
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div >
  );
}


export default DispatchCenter;