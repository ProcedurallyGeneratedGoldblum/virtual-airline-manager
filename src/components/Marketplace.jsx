import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, DollarSign, ChevronDown, ChevronUp, MapPin, Gauge } from 'lucide-react';
import { generateAircraft } from '../utils/aircraftGenerator';
import { useAppContext } from './AppContext';

function Marketplace() {
  const { company, fleet, buyAircraft, sellAircraft } = useAppContext();
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
      for (let i = 0; i < count; i++) {
        newListings.push(generateAircraft(type));
      }
    });

    setMarketListings(newListings.sort((a, b) => a.price - b.price));
  };

  const handleBuy = (aircraft) => {
    if (company.balance >= aircraft.price) {
      buyAircraft(aircraft);
      setMarketListings(marketListings.filter(a => a.id !== aircraft.id));
    }
  };

  const handleSell = (aircraft) => {
    sellAircraft(aircraft);
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
        const matchesSearch = a.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.registration.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || a.category === selectedCategory;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        if (sortOrder === 'price-asc') return a.price - b.price;
        return b.price - a.price;
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
            onClick={() => setActiveTab('buy')}
            className={`px-8 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'buy' ? 'bg-black text-white' : 'text-zinc-400 hover:text-black'}`}
          >
            Acquisition
          </button>
          <button
            onClick={() => setActiveTab('sell')}
            className={`px-8 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'sell' ? 'bg-black text-white' : 'text-zinc-400 hover:text-black'}`}
          >
            Liquidate
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
          />
        ))}
      </div>

      {displayAircraft.length === 0 && (
        <div className="text-center py-24 bg-zinc-50 border border-dashed border-zinc-200">
          <Plane className="w-16 h-16 mx-auto mb-6 text-zinc-100" />
          <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-[0.3em]">No matching inventory found in registry.</p>
        </div>
      )}
    </div>
  );
}

const AircraftCard = ({ plane, activeTab, handleBuy, handleSell, company, formatPrice }) => {
  const [expanded, setExpanded] = useState(false);

  // Helper to color condition
  const getConditionColor = (cond) => {
    if (cond >= 90) return 'text-emerald-600';
    if (cond >= 75) return 'text-zinc-900';
    if (cond >= 50) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white border border-zinc-200 overflow-hidden hover:border-black transition-all group relative">
      <div className="absolute top-0 right-0 p-4 opacity-5 italic font-black text-4xl select-none uppercase pointer-events-none">{plane.category}</div>
      <div className="p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <span className="text-[9px] font-mono font-black tracking-widest text-zinc-400 uppercase">{plane.registration}</span>
            <h3 className="text-xl font-black text-black uppercase tracking-tight italic">{plane.model}</h3>
          </div>
          <span className="text-2xl font-black text-black tracking-tighter">{formatPrice(plane.price)}</span>
        </div>

        <div className="grid grid-cols-2 gap-px bg-zinc-100 border border-zinc-100 mb-8">
          <div className="bg-white p-4">
            <p className="text-[9px] font-mono text-zinc-400 uppercase mb-1">State</p>
            <p className={`text-xs font-black uppercase ${getConditionColor(plane.condition)}`}>
              {plane.condition}% NORM
            </p>
          </div>
          <div className="bg-white p-4 text-right">
            <p className="text-[9px] font-mono text-zinc-400 uppercase mb-1">Duration</p>
            <p className="text-xs font-black text-black uppercase">{plane.hours.toLocaleString()} HRS</p>
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
              Acquire
            </button>
          ) : (
            <button
              onClick={() => handleSell(plane)}
              className="flex-1 py-4 bg-white border-2 border-black text-black text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-all"
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
          <div className="mt-8 pt-8 border-t border-zinc-100 grid grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
            <div>
              <p className="text-[8px] font-mono uppercase tracking-widest text-zinc-400 mb-2 flex items-center gap-2">
                <Gauge className="w-3 h-3" /> Technical Specs
              </p>
              <div className="space-y-2">
                <div className="flex justify-between border-b border-zinc-50 pb-1">
                  <span className="text-[9px] text-zinc-500 uppercase">Engine Type</span>
                  <span className="text-[9px] font-black uppercase">{plane.engineType || 'Piston'}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-50 pb-1">
                  <span className="text-[9px] text-zinc-500 uppercase">Pax Cap</span>
                  <span className="text-[9px] font-black uppercase">{plane.capacity?.passengers || 4}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[8px] font-mono uppercase tracking-widest text-zinc-400 mb-2 flex items-center justify-end gap-2">
                Location <MapPin className="w-3 h-3" />
              </p>
              <p className="text-[9px] font-black text-black uppercase">{plane.location}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;