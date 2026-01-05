import React, { useState } from 'react';
import { Search, RefreshCw, DollarSign, ChevronDown, ChevronUp, MapPin, Gauge, Fuel, Wrench, Droplets, Disc, Plane } from 'lucide-react';

import { useAppContext } from './AppContext';
import { FUEL_PRICES, FUEL_TYPES } from '../lib/constants';
import { calculateDistance } from '../utils/distance';
import airportsData from '../data/airports.json';

function Marketplace() {
  const { company, pilot, fleet, marketListings, addAircraftToFleet, sellAircraft, refuelAircraft, performMaintenanceCheck, travelToLocation } = useAppContext();
  const [activeTab, setActiveTab] = useState('sell'); // Default to Fleet Hangar to show user's assets first
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortOrder, setSortOrder] = useState('price-asc');

  const [sellModalOpen, setSellModalOpen] = useState(false);
  const [sellAircraftTarget, setSellAircraftTarget] = useState(null);

  const handleBuy = (aircraft) => {
    if (company.balance >= aircraft.price) {
      addAircraftToFleet(aircraft);
    }
  };

  const handleSellClick = (aircraft) => {
    setSellAircraftTarget(aircraft);
    setSellModalOpen(true);
  };

  const handleSellConfirm = (price) => {
    if (sellAircraftTarget) {
      sellAircraft(sellAircraftTarget.id, price);
      setSellModalOpen(false);
      setSellAircraftTarget(null);
    }
  };


  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const categories = [
    { id: 'all', name: 'All Airframes' },
    { id: 'GA', name: 'General Aviation' },
    { id: 'Turbo', name: 'Turboprop' },
    { id: 'Jet', name: 'Business Jet' }
  ];

  // Helper to get coordinates from location string
  const getCoords = (locStr) => {
    if (!locStr) return null;
    // Extract ICAO from "Name, Country (ICAO)"
    const match = locStr.match(/\(([^)]+)\)/);
    const icao = match ? match[1] : '';
    return airportsData.find(a => a.icao === icao);
  };

  const getFilteredAircraft = (sourceList) => {
    const userLoc = getCoords(pilot.currentLocation);

    return sourceList
      .map(a => {
        // Calculate distance for each aircraft
        const aircraftLoc = getCoords(a.location);
        let distance = 0;
        if (userLoc && aircraftLoc) {
          distance = calculateDistance(
            userLoc.latitude, userLoc.longitude,
            aircraftLoc.latitude, aircraftLoc.longitude
          );
        }
        return { ...a, distanceToUser: distance };
      })
      .filter(a => {
        const model = a.model || a.name || '';
        const reg = a.registration || '';
        const matchesSearch = model.toLowerCase().includes(searchTerm.toLowerCase()) ||
          reg.toLowerCase().includes(searchTerm.toLowerCase());

        // Normalize categories for filtering
        const aircraftCat = a.category?.toUpperCase();
        const mapCat = {
          'GA': ['GA', 'SINGLE-PISTON', 'TWIN-PISTON'],
          'TURBO': ['TURBOPROP', 'TURBO'],
          'JET': ['JET', 'BUSINESS JET']
        };

        const matchesCategory = selectedCategory === 'all' ||
          aircraftCat === selectedCategory.toUpperCase() ||
          mapCat[selectedCategory.toUpperCase()]?.includes(aircraftCat);

        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        if (sortOrder === 'price-asc') return (a.price || 0) - (b.price || 0);
        if (sortOrder === 'price-desc') return (b.price || 0) - (a.price || 0);
        if (sortOrder === 'distance-asc') return (a.distanceToUser || 0) - (b.distanceToUser || 0);
        return 0;
      });
  };

  const displayAircraft = activeTab === 'buy' ? getFilteredAircraft(marketListings) : getFilteredAircraft(fleet);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Aircraft Marketplace</h2>
          <p className="text-slate-400 mt-1 font-medium">Buy and sell aircraft for your fleet</p>
        </div>

        <div className="flex gap-4 items-center">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 px-4 py-2 rounded-xl flex items-center gap-3">
            <div className="bg-blue-500/20 p-2 rounded-lg">
              <MapPin className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Location</p>
              <p className="text-lg font-bold text-blue-400 leading-none truncate max-w-[150px]">
                {pilot.currentLocation || 'Unknown'}
              </p>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 px-4 py-2 rounded-xl flex items-center gap-3">
            <div className="bg-emerald-500/20 p-2 rounded-lg">
              <DollarSign className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Balance</p>
              <p className={`text-lg font-bold leading-none ${company.balance < 100000 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {formatPrice(company.balance)}
              </p>
            </div>
          </div>

          {activeTab === 'buy' && (
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-5 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-sm font-bold transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          )}
        </div>
      </header>

      {/* Tab Switcher */}
      <div className="flex justify-center">
        <div className="flex bg-slate-800/50 backdrop-blur-sm p-1.5 rounded-2xl border border-slate-700/50">
          <button
            onClick={() => setActiveTab('sell')}
            className={`px-8 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all ${activeTab === 'sell' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-white'}`}
          >
            Fleet Hangar
          </button>
          <button
            onClick={() => setActiveTab('buy')}
            className={`px-8 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all ${activeTab === 'buy' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-white'}`}
          >
            Marketplace
          </button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-5 rounded-2xl">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Search aircraft..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-sm text-white placeholder-slate-500 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all outline-none"
            />
          </div>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="px-5 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-sm text-white focus:border-blue-500/50 transition-all outline-none"
          >
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="distance-asc">Distance: Nearest</option>
          </select>

          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-5 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${selectedCategory === cat.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-900/50 text-slate-400 hover:text-white border border-slate-700/50'
                  }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayAircraft.map(plane => (
          <AircraftCard
            key={plane.id}
            plane={plane}
            activeTab={activeTab}
            handleBuy={handleBuy}
            handleSell={handleSellClick}
            refuelAircraft={refuelAircraft}
            company={company}
            formatPrice={formatPrice}
            performMaintenanceCheck={performMaintenanceCheck}
            travelToLocation={travelToLocation}
          />
        ))}
      </div>

      {displayAircraft.length === 0 && activeTab === 'sell' && (
        <div className="text-center py-16 bg-slate-800/30 rounded-3xl border border-dashed border-slate-700/50">
          <div className="bg-slate-700/30 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <RefreshCw className="w-8 h-8 text-slate-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-300">Your Fleet is Empty</h3>
          <p className="text-slate-500 mt-2">Visit the Marketplace to acquire your first aircraft.</p>
        </div>
      )}

      {displayAircraft.length === 0 && activeTab === 'buy' && (
        <div className="text-center py-16 bg-slate-800/30 rounded-3xl border border-dashed border-slate-700/50">
          <div className="bg-slate-700/30 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-slate-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-300">No Aircraft Found</h3>
          <p className="text-slate-500 mt-2">Try adjusting your search or filters.</p>
        </div>
      )}

      {/* Sell Modal */}
      {sellModalOpen && sellAircraftTarget && (
        <SellOptionsModal
          aircraft={sellAircraftTarget}
          onClose={() => { setSellModalOpen(false); setSellAircraftTarget(null); }}
          onSell={handleSellConfirm}
          currentLocation={pilot.currentLocation}
        />
      )}
    </div>
  );
}

const SellOptionsModal = ({ aircraft, onClose, onSell, currentLocation }) => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper to extract ICAO and find coords
  const getAirport = (locStr) => {
    if (!locStr) return null;
    const match = locStr.match(/\(([^)]+)\)/);
    const icao = match ? match[1] : '';
    return airportsData.find(a => a.icao === icao);
  };

  React.useEffect(() => {
    // Generate 3 random offers
    const generateOffers = () => {
      const currentAirport = getAirport(currentLocation);
      const newOffers = [];

      for (let i = 0; i < 3; i++) {
        // Pick random buyer location
        const randomAirport = airportsData[Math.floor(Math.random() * airportsData.length)];

        // Calculate distance
        let distance = 0;
        if (currentAirport && randomAirport) {
          distance = calculateDistance(
            currentAirport.latitude, currentAirport.longitude,
            randomAirport.latitude, randomAirport.longitude
          );
        }

        // Base price calculation (approximate 60-70% of original value context)
        // We really just want to create variation around the 'scrapped' price.
        // But here we want a somewhat realistic market offer.
        // Let's assume the aircraft.price (if set) is the fair market value. 
        // If not set (legacy), we assume a baseline.
        const marketValue = aircraft.price || 50000;

        // Variance: -10% to +10%
        const variance = (Math.random() * 0.2) - 0.1;
        const offerPrice = Math.floor(marketValue * (1 + variance));

        // Check Range (Simulated)
        const maxRange = aircraft.specs?.range || 800; // Default 800nm if unknown
        const isOutOfRange = distance > maxRange;

        // Ferry Fee Logic
        let ferryFee = 0;
        if (isOutOfRange) {
          // Hefty fee: $3.50/nm + $5000 surcharge
          ferryFee = Math.floor((distance * 3.5) + 5000);
        } else {
          // Normal delivery: $1.50/nm
          ferryFee = Math.floor(distance * 1.5);
        }

        const netProfit = offerPrice - ferryFee;

        newOffers.push({
          id: i,
          buyer: `Private Buyer`,
          location: `${randomAirport.municipality}, ${randomAirport.iso_country} (${randomAirport.icao})`,
          distance: Math.round(distance),
          offerPrice,
          ferryFee,
          netProfit,
          isOutOfRange
        });
      }

      // Sort by best net profit
      newOffers.sort((a, b) => b.netProfit - a.netProfit);

      setOffers(newOffers);
      setLoading(false);
    };

    generateOffers();
  }, [aircraft, currentLocation]);

  const formatMoney = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-700 bg-slate-900/50 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-white">Sell Aircraft</h3>
            <p className="text-slate-400 text-sm">{aircraft.name} ({aircraft.registration})</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <p className="text-slate-300 mb-4 text-sm">
            We have located interested buyers. Choosing a buyer far from your current location will incur ferry fees.
            <br />
            Current Location: <span className="text-blue-400 font-bold">{currentLocation}</span>
          </p>

          {loading ? (
            <div className="py-12 flex justify-center">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="space-y-3">
              {offers.map((offer) => (
                <div key={offer.id} className="bg-slate-900/50 border border-slate-700 rounded-xl p-4 hover:border-blue-500/50 transition-colors">
                  <div className="flex flex-col md:flex-row justify-between gap-4 items-center">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="w-4 h-4 text-slate-500" />
                        <span className="font-bold text-white text-sm">{offer.location}</span>
                        <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700">
                          {offer.distance} nm
                        </span>
                        {offer.isOutOfRange && (
                          <span className="text-[10px] bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded-full border border-rose-500/30 font-bold uppercase tracking-wider">
                            Ferry Required
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 pl-6">
                        Gross Offer: {formatMoney(offer.offerPrice)}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-rose-400 mb-1">
                        Ferry Est: -{formatMoney(offer.ferryFee)}
                      </div>
                      <div className="text-lg font-bold text-emerald-400">
                        {formatMoney(offer.netProfit)}
                      </div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wide font-bold">Net Profit</div>
                    </div>

                    <button
                      onClick={() => onSell(offer.netProfit)}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-lg shadow-lg shadow-blue-500/20 active:scale-95 transition-all whitespace-nowrap"
                    >
                      Accept Offer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-900/50 border-t border-slate-700 text-center">
          <p className="text-xs text-slate-500 italic">
            Sales are final. Ferry fees include fuel, pilot fees, and logistics.
          </p>
        </div>
      </div>
    </div>
  );
};

const AircraftCard = ({ plane, activeTab, handleBuy, handleSell, refuelAircraft, performMaintenanceCheck, travelToLocation, company, formatPrice }) => {
  const [expanded, setExpanded] = useState(false);
  const isFleet = activeTab === 'sell';

  // HELPER: Robust property access for mixed camelCase/snake_case/nested data
  const getProp = (obj, paths, fallback = 0) => {
    for (const path of paths) {
      const parts = path.split('.');
      let val = obj;
      for (const part of parts) {
        val = val ? val[part] : undefined;
      }
      if (val !== undefined && val !== null) return val;
    }
    return fallback;
  };

  const totalHours = getProp(plane, ['conditionDetails.airframe.ttaf', 'totalHours', 'total_hours', 'hours'], 0);
  const engineCondition = getProp(plane, ['conditionDetails.engine.condition', 'engineCondition', 'engine_condition'], 100);
  const airframeCondition = getProp(plane, ['conditionDetails.airframe.condition', 'condition', 'airframe_condition'], 100);
  const avionicsCondition = getProp(plane, ['conditionDetails.avionics.condition', 'avionics_condition'], 85);
  const fuelLevel = getProp(plane, ['fuelLevel', 'fuel_level'], 100);
  const fuelCapacity = getProp(plane, ['fuelCapacity', 'fuel_capacity'], 100);
  const fuelPercentage = (fuelLevel / fuelCapacity) * 100;

  const getConditionColor = (val) => {
    if (val >= 90) return 'text-emerald-400';
    if (val >= 70) return 'text-slate-300';
    if (val >= 40) return 'text-amber-400';
    return 'text-rose-400';
  };

  const maintenanceSpecs = {
    A: { interval: 50, cost: 2500, label: 'A-Check (Light)' },
    B: { interval: 200, cost: 7500, label: 'B-Check (Intermediate)' },
    C: { interval: 1000, cost: 25000, label: 'C-Check (Heavy)' },
    D: { interval: 5000, cost: 100000, label: 'D-Check (Overhaul)' }
  };

  const handleRefuel = () => {
    const needed = fuelCapacity - fuelLevel;
    if (needed <= 0) return;
    const fuelType = plane.fuelType || 'AVGAS';
    const unitPrice = FUEL_PRICES[fuelType] || 5.50;
    const cost = Math.floor(needed * unitPrice);
    if (company.balance < cost) {
      alert(`Insufficient funds for refuel! Need ${formatPrice(cost)}`);
      return;
    }
    if (confirm(`Refuel ${needed.toFixed(1)} Gal of ${fuelType} for ${formatPrice(cost)}?`)) {
      refuelAircraft(plane.id, needed, cost);
    }
  };

  const handleMaintenance = (type) => {
    const spec = maintenanceSpecs[type];
    if (company.balance < spec.cost) {
      alert(`Insufficient funds for ${type}-Check! Need ${formatPrice(spec.cost)}`);
      return;
    }
    if (confirm(`Authorize ${spec.label} for ${formatPrice(spec.cost)}? aircraft will be grounded for service.`)) {
      performMaintenanceCheck(plane.id, type, spec.cost);
    }
  };

  const handleTravelTo = () => {
    // Calculate travel cost based on distance (economy ticket ~ $0.50 per nm)
    const ticketPrice = Math.max(100, Math.round(plane.distanceToUser * 0.5));

    if (company.balance < ticketPrice) {
      alert(`Insufficient funds for travel ticket! Cost: ${formatPrice(ticketPrice)}`);
      return;
    }

    if (confirm(`Travel to ${plane.location}?\n\nDistance: ${plane.distanceToUser} nm\nTicket Cost: ${formatPrice(ticketPrice)}`)) {
      travelToLocation(plane.location, ticketPrice);
    }
  };

  return (
    <div className={`bg-slate-800/40 backdrop-blur-md border rounded-2xl overflow-hidden transition-all ${isFleet && plane.status === 'in-flight' ? 'opacity-60 grayscale border-slate-700/50' : 'border-slate-700/50 hover:border-slate-600 shadow-lg'}`}>
      <div className="p-6">
        {/* Clickable Header for Expansion */}
        <div
          onClick={() => setExpanded(!expanded)}
          className="cursor-pointer group mb-4"
        >
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">{plane.registration}</span>
              <h3 className="text-xl font-bold text-white leading-tight group-hover:text-blue-400 transition-colors">{plane.model || plane.name}</h3>
            </div>
            <div className="text-right">
              <span className="text-xl font-bold text-white block">{isFleet ? 'FLEET' : formatPrice(plane.price)}</span>
              <span className="text-xs text-slate-500 uppercase flex items-center justify-end gap-1 mt-1 group-hover:text-blue-400 transition-colors">
                {expanded ? 'Hide Details' : 'View Details'} {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-end mb-5">
          <div className="space-y-2">
            <div className="flex gap-4 items-center">
              <div className="w-20 h-2 bg-slate-700 rounded-full relative overflow-hidden">
                <div className={`absolute top-0 left-0 h-full rounded-full ${fuelPercentage > 20 ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{ width: `${fuelPercentage}%` }}></div>
              </div>
              <p className="text-xs text-slate-400">Fuel {Math.round(fuelPercentage)}%</p>
            </div>
          </div>
          <div className="text-right">
            <p className={`text-sm font-bold ${getConditionColor(airframeCondition)}`}>
              {airframeCondition >= 90 ? 'Excellent' : airframeCondition >= 60 ? 'Good' : 'Needs Service'}
            </p>
            <p className="text-xs text-slate-500">{totalHours.toLocaleString()} TTAF</p>
          </div>
        </div>

        <div className="flex gap-3">
          {activeTab === 'buy' ? (
            plane.distanceToUser > 0 ? (
              <button
                onClick={handleTravelTo}
                className="flex-1 py-3 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Plane className="w-4 h-4" /> Travel to Purchase ({plane.distanceToUser} nm)
              </button>
            ) : (
              <button
                onClick={() => handleBuy(plane)}
                disabled={company.balance < (plane.price || 0)}
                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${company.balance >= (plane.price || 0)
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 active:scale-95'
                  : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  }`}
              >
                Purchase Aircraft
              </button>
            )
          ) : (
            <button
              onClick={() => handleSell(plane)}
              disabled={plane.status === 'in-flight'}
              className="flex-1 py-3 rounded-xl font-bold text-sm bg-slate-700 hover:bg-rose-600 text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Sell Aircraft
            </button>
          )}
        </div>

        {expanded && (
          <div className="mt-6 pt-6 border-t border-slate-700/50 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
            {isFleet && (
              <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-700/50">
                <p className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-amber-400" /> Scheduled Maintenance
                </p>
                <div className="grid grid-cols-2 gap-3 mb-5">
                  {Object.entries(maintenanceSpecs).map(([type, spec]) => {
                    const lastCheckKey = type === 'A' ? 'hoursAtLastA' : type === 'B' ? 'hoursAtLastB' : type === 'C' ? 'hoursAtLastC' : 'hoursAtLastD';
                    const lastCheckHours = plane[lastCheckKey] || 0;
                    const hoursUsed = totalHours - lastCheckHours;
                    const percent = Math.min(100, (hoursUsed / spec.interval) * 100);
                    const remains = Math.max(0, spec.interval - hoursUsed);

                    return (
                      <div key={type} className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="text-sm font-bold text-white">{type}-Check</p>
                            <p className="text-xs text-slate-500">{remains.toFixed(0)} hrs remaining</p>
                          </div>
                          <span className="text-xs font-bold text-slate-400">{formatPrice(spec.cost)}</span>
                        </div>
                        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden mb-3">
                          <div className={`h-full rounded-full ${percent > 90 ? 'bg-rose-500' : 'bg-blue-500'}`} style={{ width: `${percent}%` }}></div>
                        </div>
                        <button
                          onClick={() => handleMaintenance(type)}
                          disabled={plane.status === 'in-flight'}
                          className="w-full py-2 text-xs font-bold rounded-lg bg-slate-700 hover:bg-blue-600 text-white transition-all disabled:opacity-30"
                        >
                          Authorize
                        </button>
                      </div>
                    );
                  })}
                </div>
                <button
                  onClick={handleRefuel}
                  disabled={plane.status === 'in-flight' || fuelPercentage > 95}
                  className="w-full py-3 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white transition-all flex items-center justify-center gap-2 disabled:opacity-30"
                >
                  <Fuel className="w-4 h-4" /> Refuel ({formatPrice(FUEL_PRICES[plane.fuelType || 'AVGAS'] || 5.50)}/gal)
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <p className="text-sm font-bold text-slate-300 flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-blue-400" /> Technical Specs
                </p>
                <div className="space-y-2 bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
                  <div className="flex justify-between border-b border-slate-700/50 pb-2">
                    <span className="text-sm text-slate-400">Total Time</span>
                    <span className="text-sm font-bold text-white">{totalHours.toLocaleString()} hrs</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-700/50 pb-2">
                    <span className="text-sm text-slate-400">Next Inspection</span>
                    <span className="text-sm font-bold text-white">{(plane.nextInspectionDue || 100).toFixed(0)} hrs</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-700/50 pb-2">
                    <span className="text-sm text-slate-400">Engine</span>
                    <span className={`text-sm font-bold ${getConditionColor(engineCondition)}`}>{Math.round(engineCondition)}%</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-700/50 pb-2">
                    <span className="text-sm text-slate-400">Avionics</span>
                    <span className={`text-sm font-bold ${getConditionColor(avionicsCondition)}`}>{Math.round(avionicsCondition)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-400">Payload</span>
                    <span className="text-sm font-bold text-white">{plane.specs?.payload?.toLocaleString() || plane.payloadCapacity || 0} lbs</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-sm font-bold text-slate-300 flex items-center gap-2 md:justify-end">
                  <MapPin className="w-4 h-4 text-blue-400" /> Location
                </p>
                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
                  <p className="text-sm font-bold text-white mb-1">{plane.location}</p>
                  {plane.distanceToUser !== undefined && (
                    <p className={`text-xs font-bold ${plane.distanceToUser === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {plane.distanceToUser === 0 ? 'Current Location' : `${plane.distanceToUser} nm away`}
                    </p>
                  )}
                  <div className="mt-4 pt-3 border-t border-slate-700/50">
                    <p className="text-xs text-slate-500">
                      {isFleet ? 'Fleet Registered' : 'Market Listing'}<br />
                      {plane.manufacturer || 'Aircraft'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;