import React, { useState, useEffect } from 'react';
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
  Loader2
} from 'lucide-react';
import { getFlightWeather, formatMETAR, formatTAF, getFlightRules, getWindInfo, getVisibility } from '../utils/weatherAPI';

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
function WeatherCard({ title, icao, metar, taf, station, isLoading }) {
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
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-600" />
          <h4 className="font-bold text-gray-900">{title}</h4>
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
        <div className="flex items-center gap-1 mb-1">
          <Cloud className="w-4 h-4 text-gray-600" />
          <span className="text-xs font-semibold text-gray-600 uppercase">METAR</span>
        </div>
        <p className="text-xs font-mono bg-gray-50 p-2 rounded border border-gray-200 break-all">
          {formatMETAR(metar)}
        </p>

        {/* Parsed METAR Info */}
        {metar && (
          <div className="grid grid-cols-3 gap-2 mt-2">
            <div className="flex items-center gap-1 text-xs">
              <Wind className="w-3 h-3 text-gray-500" />
              <span className="text-gray-700">{getWindInfo(metar)}</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <Eye className="w-3 h-3 text-gray-500" />
              <span className="text-gray-700">{getVisibility(metar)}</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <Thermometer className="w-3 h-3 text-gray-500" />
              <span className="text-gray-700">
                {metar.temperature?.repr || 'N/A'}°C
              </span>
            </div>
          </div>
        )}
      </div>

      {/* TAF */}
      <div className="mb-3">
        <div className="flex items-center gap-1 mb-1">
          <Cloud className="w-4 h-4 text-gray-600" />
          <span className="text-xs font-semibold text-gray-600 uppercase">TAF (Forecast)</span>
        </div>
        <p className="text-xs font-mono bg-gray-50 p-2 rounded border border-gray-200 break-all max-h-24 overflow-y-auto">
          {formatTAF(taf)}
        </p>
      </div>

      {/* Nowcast (simplified interpretation) */}
      <div>
        <div className="flex items-center gap-1 mb-1">
          <AlertTriangle className="w-4 h-4 text-yellow-600" />
          <span className="text-xs font-semibold text-gray-600 uppercase">Nowcast</span>
        </div>
        <div className="bg-blue-50 p-2 rounded border border-blue-200">
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
  const { availableFlights, activeFlights, fleet, acceptFlight, startPostFlightBriefing } = useAppContext();
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

  const getAvailableAircraft = (flight) => {
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

    const flightId = acceptFlight(flight, aircraft);
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
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Dispatch Center</h2>
        <p className="text-gray-600">Available flights and active operations</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Available</p>
              <p className="text-3xl font-bold text-green-600">{availableFlights.length}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">In Progress</p>
              <p className="text-3xl font-bold text-blue-600">{activeFlights.length}</p>
            </div>
            <Plane className="w-12 h-12 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Completed</p>
              <p className="text-3xl font-bold text-gray-900">0</p>
            </div>
            <CheckCircle className="w-12 h-12 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Active Flights */}
      {activeFlights.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Active Flights</h3>
          <div className="space-y-4">
            {activeFlights.map(flight => (
              <div key={flight.id} className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-600">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-bold text-gray-900">{flight.flightNumber}</h3>
                      <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800 flex items-center gap-1">
                        <Plane className="w-4 h-4" />
                        IN PROGRESS
                      </span>
                    </div>
                    <p className="text-gray-600 font-medium">{flight.aircraftRegistration} - {flight.aircraft}</p>
                  </div>
                  <button
                    onClick={() => startPostFlightBriefing(flight.id)}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
                  >
                    Complete Flight
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 uppercase font-semibold mb-1 flex items-center gap-1">
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
                    <p className="text-xs text-gray-600 uppercase font-semibold mb-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Duration
                    </p>
                    <p className="font-semibold text-gray-900">{flight.duration}</p>
                    <p className="text-sm text-gray-600">{flight.distance} nm</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-600 uppercase font-semibold mb-1 flex items-center gap-1">
                      <Package className="w-3 h-3" />
                      Cargo
                    </p>
                    <p className="font-semibold text-gray-900">{flight.cargo.type}</p>
                    {flight.cargo.passengers > 0 && (
                      <p className="text-sm text-gray-600">{flight.cargo.passengers} passengers</p>
                    )}
                  </div>

                  <div>
                    <p className="text-xs text-gray-600 uppercase font-semibold mb-1 flex items-center gap-1">
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
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Available Flights</h3>

        {availableFlights.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <Radio className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Flights Available</h3>
            <p className="text-gray-600">Check back later for new flight opportunities</p>
          </div>
        ) : (
          <div className="space-y-4">
            {availableFlights.map(flight => {
              const availableAircraft = getAvailableAircraft(flight);
              const isExpanded = expandedFlight === flight.id;
              const showingAircraftSelection = showAircraftSelection === flight.id;
              const flightWeather = weatherData[flight.id];
              const isLoadingWeather = loadingWeather[flight.id];

              return (
                <div key={flight.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-2xl font-bold text-gray-900">{flight.flightNumber}</h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 ${getStatusColor(flight.priority)}`}>
                            {getPriorityIcon(flight.priority)}
                            {flight.priority === 'urgent' ? 'URGENT' : 'AVAILABLE'}
                          </span>
                        </div>
                        <p className="text-gray-600 font-medium">{flight.aircraft}</p>
                      </div>

                      <button
                        onClick={() => toggleFlightDetails(flight.id, flight)}
                        className="flex items-center gap-2 px-4 py-2 text-blue-900 hover:bg-blue-50 rounded-lg transition"
                      >
                        <span className="text-sm font-semibold">
                          {isExpanded ? 'Hide Details' : 'Show Details'}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </button>
                    </div>

                    {/* Basic Info */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-600 uppercase font-semibold mb-1 flex items-center gap-1">
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
                        <p className="text-xs text-gray-600 uppercase font-semibold mb-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Duration
                        </p>
                        <p className="font-semibold text-gray-900">{flight.duration}</p>
                        <p className="text-sm text-gray-600">{flight.distance} nm</p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-600 uppercase font-semibold mb-1 flex items-center gap-1">
                          <Package className="w-3 h-3" />
                          Cargo
                        </p>
                        <p className="font-semibold text-gray-900">{flight.cargo.type}</p>
                        {flight.cargo.passengers > 0 && (
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {flight.cargo.passengers} passengers
                          </p>
                        )}
                      </div>

                      <div>
                        <p className="text-xs text-gray-600 uppercase font-semibold mb-1 flex items-center gap-1">
                          <Cloud className="w-3 h-3" />
                          Weather
                        </p>
                        <p className="font-semibold text-green-600">{flight.weather}</p>
                      </div>
                    </div>

                    {/* Notes */}
                    {flight.notes && (
                      <div className={`${flight.priority === 'urgent' ? 'bg-red-50 border-red-400' : 'bg-yellow-50 border-yellow-400'} border-l-4 p-3 rounded mb-4`}>
                        <p className="text-sm font-semibold text-gray-900">📋 Notes:</p>
                        <p className="text-sm text-gray-800">{flight.notes}</p>
                      </div>
                    )}

                    {/* Accept Button */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => toggleAircraftSelection(flight.id)}
                        className="flex-1 bg-blue-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800 transition"
                      >
                        {showingAircraftSelection ? 'Hide Aircraft Selection' : 'Accept Flight'}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Flight Details */}
                  {isExpanded && (
                    <div className="bg-gradient-to-b from-blue-50 to-white p-6 border-t border-blue-100">
                      <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Cloud className="w-5 h-5 text-blue-600" />
                        Flight Weather & Route Information
                      </h4>

                      {/* Map */}
                      <div className="mb-6">
                        <h5 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Route Map</h5>
                        {isLoadingWeather ? (
                          <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
                            <div className="flex items-center gap-2 text-gray-500">
                              <Loader2 className="w-5 h-5 animate-spin" />
                              <span>Loading route data...</span>
                            </div>
                          </div>
                        ) : flightWeather ? (
                          <FlightMap departure={flightWeather.departure} arrival={flightWeather.arrival} />
                        ) : (
                          <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
                            <p className="text-gray-500">Unable to load route map</p>
                          </div>
                        )}
                      </div>

                      {/* Weather Cards */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                    </div>
                  )}

                  {/* Aircraft Selection */}
                  {showingAircraftSelection && (
                    <div className="bg-gray-50 p-6 border-t">
                      <h4 className="font-bold text-gray-900 mb-4">Select Aircraft for This Flight</h4>

                      {availableAircraft.length === 0 ? (
                        <div className="text-center py-8">
                          <Plane className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-600">No aircraft currently available</p>
                          <p className="text-sm text-gray-500">All aircraft are either in flight or under maintenance</p>
                        </div>
                      ) : (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            {availableAircraft.map(aircraft => (
                              <button
                                key={aircraft.id}
                                onClick={() => setSelectedAircraft(aircraft)}
                                className={`p-4 rounded-lg border-2 text-left transition ${selectedAircraft?.id === aircraft.id
                                    ? 'border-blue-900 bg-blue-50'
                                    : 'border-gray-300 hover:border-gray-400'
                                  }`}
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <p className="font-bold text-gray-900 text-lg">{aircraft.registration}</p>
                                    <p className="text-sm text-gray-600">{aircraft.type}</p>
                                  </div>
                                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
                                    AVAILABLE
                                  </span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div>
                                    <p className="text-gray-600">Location</p>
                                    <p className="font-semibold text-gray-900">{aircraft.location}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-600">Condition</p>
                                    <p className="font-semibold text-gray-900 capitalize">{aircraft.condition}</p>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>

                          <button
                            onClick={() => handleAcceptFlight(flight, selectedAircraft)}
                            disabled={!selectedAircraft}
                            className={`w-full px-6 py-3 rounded-lg font-semibold transition ${selectedAircraft
                                ? 'bg-green-600 text-white hover:bg-green-700'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              }`}
                          >
                            {selectedAircraft
                              ? `Confirm Flight with ${selectedAircraft.registration}`
                              : 'Select an aircraft to continue'
                            }
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default DispatchCenter;