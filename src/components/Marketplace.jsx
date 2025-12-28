import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, DollarSign, ChevronDown, ChevronUp, MapPin, Gauge, Fuel, Wrench, Droplets, Disc } from 'lucide-react';
import { generateAircraft } from '../utils/aircraftGenerator';
import { useAppContext } from './AppContext';
import { FUEL_PRICES, FUEL_TYPES } from '../lib/constants';

function Marketplace() {
  const { company, fleet, addAircraftToFleet, sellAircraft, refuelAircraft, repairAircraft, performMaintenanceCheck } = useAppContext();
  const [activeTab, setActiveTab] = useState('buy'); // 'buy' or 'sell'
  const [searchTerm, setSearchTerm] = useState('');
  const [marketListings, setMarketListings] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortOrder, setSortOrder] = useState('price-asc');

  useEffect(() => {
    // Generate initial market listings if empty
    if (marketListings.length === 0) {
      refreshMarket();
    }
  }, []);

  const refreshMarket = () => {
    const newListings = [];
    const counts = { GA: 8, Jet: 3, Turbo: 4 };

    Object.entries(counts).forEach(([type, count]) => {
      // generateAircraft returns an array, we need to spread it or pick one
      const planes = generateAircraft(count);
      // Assign the requested type to the generated planes if needed, 
      // but aircraftGenerator already picks random types from across the board.
      // So we'll just generate the total count and spread them.
      newListings.push(...planes);
    });

    setMarketListings(newListings.sort((a, b) => a.price - b.price));
  };

  const handleBuy = (aircraft) => {
    if (company.balance >= aircraft.price) {
      addAircraftToFleet(aircraft);
      setMarketListings(marketListings.filter(a => a.id !== aircraft.id));
    }
  };

  const handleSell = (aircraft) => {
    sellAircraft(aircraft.id);
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

  const getFilteredAircraft = (sourceList) => {
    return sourceList
      .filter(a => {
        const model = a.model || a.name || '';
        const reg = a.registration || '';
        const matchesSearch = model.toLowerCase().includes(searchTerm.toLowerCase()) ||
          reg.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || a.category === selectedCategory || a.type === selectedCategory;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        if (sortOrder === 'price-asc') return (a.price || 0) - (b.price || 0);
        return (b.price || 0) - (a.price || 0);
      });
  };

  const displayAircraft = activeTab === 'buy' ? getFilteredAircraft(marketListings) : getFilteredAircraft(fleet);

  return (
    <div className="space-y-12">
      <div className="border-l-8 border-black pl-6 py-2 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter italic">Hangar Ops</h2>
          <p className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase mt-1">
            Available Capital: <span className={company.balance < 100000 ? "text-red-600 font-bold" : "text-emerald-600 font-bold"}>
              {formatPrice(company.balance)}
            </span>
          </p>
        </div>

        <div className="flex bg-zinc-100 p-1 rounded-none border border-zinc-200">
          <button
            onClick={() => setActiveTab('sell')}
            className={`px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'sell' ? 'bg-black text-white' : 'bg-white text-zinc-400 hover:text-black hover:bg-zinc-50 border border-zinc-200'}`}
          >
            Fleet Hangar
          </button>
          <button
            onClick={() => setActiveTab('buy')}
            className={`px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'buy' ? 'bg-black text-white' : 'bg-white text-zinc-400 hover:text-black hover:bg-zinc-50 border border-zinc-200'}`}
          >
            Marketplace
          </button>
        </div>

        {activeTab === 'buy' && (
          <button
            onClick={refreshMarket}
            className="flex items-center gap-2 px-6 py-2 bg-white border border-black text-black hover:bg-black hover:text-white transition-all text-[10px] font-black uppercase tracking-widest"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Refeed Market</span>
          </button>
        )}
      </div>

      {/* Search and Filter Bar - Industrial */}
      <div className="bg-white border border-zinc-200 p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-300 w-4 h-4" />
            <input
              type="text"
              placeholder="FILTER BY AIRFRAME..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-100 text-[10px] font-black tracking-widest uppercase focus:bg-white focus:border-black transition-all outline-none"
            />
          </div>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="px-6 py-3 bg-zinc-50 border border-zinc-100 text-[10px] font-black tracking-widest uppercase focus:bg-white focus:border-black transition-all outline-none"
          >
            <option value="price-asc">Price: Ascending</option>
            <option value="price-desc">Price: Descending</option>
          </select>

          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-6 py-3 text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${selectedCategory === cat.id
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-zinc-400 border-zinc-100 hover:border-black hover:text-black'
                  }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {displayAircraft.map(plane => (
          <AircraftCard
            key={plane.id}
            plane={plane}
            activeTab={activeTab}
            handleBuy={handleBuy}
            handleSell={handleSell}
            company={company}
            formatPrice={formatPrice}
            performMaintenanceCheck={performMaintenanceCheck}
          />
        ))}
      </div>

      {displayAircraft.length === 0 && (activeTab === 'sell' && fleet.length === 0) && (
        <div className="text-center py-24 bg-zinc-50 border border-dashed border-zinc-200">
          <RefreshCw className="w-16 h-16 mx-auto mb-6 text-zinc-100 animate-spin-slow" />
          <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-[0.3em]">Fleet registry is currently empty.</p>
        </div>
      )}

      {displayAircraft.length === 0 && (activeTab === 'buy' || fleet.length > 0) && (
        <div className="text-center py-24 bg-zinc-50 border border-dashed border-zinc-200">
          <Search className="w-16 h-16 mx-auto mb-6 text-zinc-100" />
          <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-[0.3em]">No matching inventory found in registry.</p>
        </div>
      )}
    </div>
  );
}

const AircraftCard = ({ plane, activeTab, handleBuy, handleSell, refuelAircraft, repairAircraft, performMaintenanceCheck, company, formatPrice }) => {
  const [expanded, setExpanded] = useState(false);

  // Logistics state for UI
  const isFleet = activeTab === 'sell';

  const fuelPercentage = plane.fuelLevel || 100;
  const oilCondition = plane.oilCondition || 100;
  const tireCondition = plane.tireCondition || 100;
  const engineCondition = plane.engineCondition || 100;

  const getConditionColor = (val) => {
    if (val >= 90) return 'text-emerald-500';
    if (val >= 70) return 'text-zinc-900';
    if (val >= 40) return 'text-amber-500';
    return 'text-red-600';
  };

  const getStatusBg = (val) => {
    if (val >= 90) return 'bg-emerald-500';
    if (val >= 70) return 'bg-zinc-900';
    if (val >= 40) return 'bg-amber-500';
    return 'bg-red-600';
  };

  const handleRefuel = () => {
    const needed = (plane.fuelCapacity || 100) - (plane.fuelLevel || 0);
    if (needed <= 0) return;
    const fuelType = plane.fuelType || FUEL_TYPES.AVGAS;
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

  const handleLogisticsRepair = (component) => {
    const cost = { oil: 450, tires: 1200 }[component];
    if (company.balance < cost) {
      alert("Insufficient funds for maintenance!");
      return;
    }
    if (confirm(`Perform ${component.toUpperCase()} service for ${formatPrice(cost)}?`)) {
      repairAircraft(plane.id, 'LOGISTICS', { component, cost });
    }
  };

  const maintenanceSpecs = {
    A: { interval: 50, cost: 2500, label: 'A-Check (Light)' },
    B: { interval: 200, cost: 7500, label: 'B-Check (Intermediate)' },
    C: { interval: 1000, cost: 25000, label: 'C-Check (Heavy)' },
    D: { interval: 5000, cost: 100000, label: 'D-Check (Overhaul)' }
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

  return (
    <div className={`bg-white border transition-all group relative ${isFleet && plane.status === 'in-flight' ? 'opacity-75 grayscale' : 'hover:border-black'}`}>
      <div className="absolute top-0 right-0 p-4 opacity-5 italic font-black text-4xl select-none uppercase pointer-events-none">{plane.category || plane.type}</div>

      {isFleet && plane.status === 'in-flight' && (
        <div className="absolute inset-0 bg-black/5 flex items-center justify-center z-10">
          <div className="bg-black text-white px-4 py-2 text-[10px] font-black uppercase tracking-widest animate-pulse">In Operation</div>
        </div>
      )}

      <div className="p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <span className="text-[9px] font-mono font-black tracking-widest text-zinc-400 uppercase">{plane.registration}</span>
            <h3 className="text-xl font-black text-black uppercase tracking-tight italic leading-tight">{plane.model || plane.name}</h3>
          </div>
          <span className="text-2xl font-black text-black tracking-tighter">{isFleet ? 'FLEET' : formatPrice(plane.price)}</span>
        </div>

        <div className="grid grid-cols-2 gap-px bg-zinc-200 border border-zinc-200 mb-8 overflow-hidden">
          <div className="bg-white p-4">
            <p className="text-[9px] font-mono text-zinc-400 uppercase mb-2 flex items-center gap-2">
              <Fuel className="w-3 h-3" /> {plane.fuelType || 'AVGAS'}
              <span className="ml-auto text-zinc-300">
                {formatPrice(FUEL_PRICES[plane.fuelType || 'AVGAS'])}/GAL
              </span>
            </p>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                <div className={`h-full ${getStatusBg(fuelPercentage)}`} style={{ width: `${fuelPercentage}%` }}></div>
              </div>
              <span className={`text-[10px] font-black ${getConditionColor(fuelPercentage)}`}>{Math.round(fuelPercentage)}%</span>
            </div>
          </div>
          <div className="bg-white p-4">
            <p className="text-[9px] font-mono text-zinc-400 uppercase mb-2 flex items-center gap-2">
              <Wrench className="w-3 h-3" /> Maint. Status
            </p>
            <div className="flex flex-col gap-1">
              <p className={`text-[10px] font-black uppercase ${getConditionColor(plane.condition)}`}>
                {plane.condition >= 90 ? 'Nominal' : plane.condition >= 60 ? 'Service' : 'Critical'}
              </p>
              <p className="text-[8px] font-mono text-zinc-300 uppercase">
                {plane.totalHours?.toFixed(1) || 0} TTAF
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          {activeTab === 'buy' ? (
            <button
              onClick={() => handleBuy(plane)}
              disabled={company.balance < plane.price}
              className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-4 ${company.balance >= plane.price
                ? 'bg-black text-white hover:bg-zinc-800 border-zinc-700 active:border-b-0 active:translate-y-1'
                : 'bg-zinc-100 text-zinc-300 border-zinc-200 cursor-not-allowed'
                }`}
            >
              Purchase
            </button>
          ) : (
            <button
              onClick={() => handleSell(plane)}
              disabled={plane.status === 'in-flight'}
              className="flex-1 py-4 bg-white border-2 border-black text-black text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-all disabled:opacity-20 disabled:cursor-not-allowed"
            >
              Liquidate
            </button>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-4 bg-zinc-50 border border-zinc-100 text-black hover:bg-black hover:text-white transition-all"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {expanded && (
          <div className="mt-8 pt-8 border-t border-zinc-100 space-y-8 animate-in fade-in slide-in-from-top-2 duration-300">
            {/* Extended Logistics (Fleet Only) */}
            {isFleet && (
              <div className="col-span-2 bg-zinc-50 p-4 border-t border-zinc-100">
                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2">
                  <Wrench className="w-3 h-3" /> Scheduled Maintenance
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(maintenanceSpecs).map(([type, spec]) => {
                    const currentHours = plane.totalHours || plane.hours || 0;
                    const hoursUsed = currentHours - (plane[`hoursAtLast${type}`] || 0);
                    const percent = Math.min(100, (hoursUsed / spec.interval) * 100);
                    const remains = Math.max(0, spec.interval - hoursUsed);

                    return (
                      <div key={type} className="bg-white p-3 border border-zinc-100 relative overflow-hidden group/maint">
                        <div className="absolute top-0 left-0 w-1 h-full bg-zinc-100 group-hover/maint:bg-black transition-all"></div>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-tighter italic">{type}-Check</p>
                            <p className="text-[8px] font-mono text-zinc-400">{remains.toFixed(1)} HRS REMAINING</p>
                          </div>
                          <span className="text-[9px] font-black text-black">{formatPrice(spec.cost)}</span>
                        </div>
                        <div className="h-1 bg-zinc-50 rounded-full overflow-hidden mb-3">
                          <div
                            className={`h-full transition-all duration-1000 ${percent > 90 ? 'bg-red-600' : percent > 70 ? 'bg-amber-500' : 'bg-zinc-900'}`}
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                        <button
                          onClick={() => handleMaintenance(type)}
                          disabled={plane.status === 'in-flight'}
                          className="w-full py-1 text-[8px] font-black uppercase tracking-widest bg-zinc-50 hover:bg-black hover:text-white transition-all disabled:opacity-20"
                        >
                          Authorize Check
                        </button>
                      </div>
                    );
                  })}
                </div>
                <button
                  onClick={handleRefuel}
                  disabled={fuelPercentage > 95 || plane.status === 'in-flight'}
                  className="w-full mt-6 py-4 bg-black text-white text-[10px] font-black uppercase tracking-[.3em] hover:bg-zinc-800 transition-all disabled:opacity-20 flex items-center justify-center gap-3"
                >
                  <Fuel className="w-4 h-4" /> Execute Refuel Procedure ({formatPrice(FUEL_PRICES[plane.fuelType || 'AVGAS'])}/GAL)
                </button>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-8">
          <div>
            <p className="text-[8px] font-mono uppercase tracking-widest text-zinc-400 mb-2 flex items-center gap-2">
              <Gauge className="w-3 h-3" /> Technical Specs
            </p>
            <div className="space-y-2">
              <div className="flex justify-between border-b border-zinc-50 pb-1">
                <span className="text-[9px] text-zinc-500 uppercase font-bold">Total Time</span>
                <span className="text-[9px] font-black uppercase text-black">{(plane.totalHours || plane.hours || 0).toFixed(1)} HRS</span>
              </div>
              <div className="flex justify-between border-b border-zinc-50 pb-1">
                <span className="text-[9px] text-zinc-500 uppercase font-bold">Next Insp.</span>
                <span className="text-[9px] font-black uppercase text-black">{(plane.nextInspectionDue || 100).toFixed(1)} HRS</span>
              </div>
              <div className="flex justify-between border-b border-zinc-50 pb-1">
                <span className="text-[9px] text-zinc-500 uppercase font-bold">Engine</span>
                <span className={`text-[9px] font-black uppercase ${getConditionColor(engineCondition)}`}>{Math.round(engineCondition)}% HLTH</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[8px] font-mono uppercase tracking-widest text-zinc-400 mb-2 flex items-center justify-end gap-2">
              Location <MapPin className="w-3 h-3" />
            </p>
            <p className="text-[9px] font-black text-black uppercase">{plane.location}</p>
            <div className="mt-4 p-3 bg-zinc-50 border border-zinc-100 rounded-sm">
              <p className="text-[8px] font-mono text-zinc-400 uppercase leading-relaxed">
                          // {isFleet ? 'FLEET REGISTERED' : 'MARKET LISTING'} <br />
                          // {plane.manufacturer || 'INDUSTRIAL'} DIVISION
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Marketplace;