import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, DollarSign, ChevronDown, ChevronUp } from 'lucide-react';
import { generateAircraft } from '../utils/aircraftGenerator';
import { useAppContext } from './AppContext';

function Marketplace() {
  const { fleet, company, sellAircraft, addAircraftToFleet, marketListings, refreshMarket } = useAppContext();
  const [activeTab, setActiveTab] = useState('buy');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('price-asc');

  const categories = [
    { id: 'all', name: 'All Aircraft' },
    { id: 'single-piston', name: 'Single Piston' },
    { id: 'twin-piston', name: 'Twin Piston' },
    { id: 'turboprop', name: 'Turboprop' },
  ];

  const handleBuy = (aircraft) => {
    if (company.balance >= aircraft.price) {
      addAircraftToFleet(aircraft);
      setMarketListings(prev => prev.filter(a => a.id !== aircraft.id));
      alert(`Purchased ${aircraft.name}!`);
    } else {
      alert("Insufficient funds!");
    }
  };

  const handleSell = (aircraft) => {
    if (confirm(`Are you sure you want to sell ${aircraft.registration || aircraft.name}?`)) {
      const price = sellAircraft(aircraft.id);
      alert(`Sold for ${formatPrice(price)}`);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getFilteredAircraft = (sourceList) => {
    if (!Array.isArray(sourceList)) return [];

    return sourceList.filter(plane => {
      if (!plane) return false;
      const matchesCategory = selectedCategory === 'all' || plane.category === selectedCategory;
      const name = plane.name || '';
      const manufacturer = plane.manufacturer || '';
      const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        manufacturer.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    })
      .sort((a, b) => {
        const priceA = a.price || 0;
        const priceB = b.price || 0;
        if (sortOrder === 'price-asc') return priceA - priceB;
        if (sortOrder === 'price-desc') return priceB - priceA;
        return 0;
      });
  };

  const displayAircraft = activeTab === 'buy' ? getFilteredAircraft(marketListings) : getFilteredAircraft(fleet);

  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Aircraft Marketplace</h2>
          <p className="text-gray-600">
            Balance: <span className={company.balance < 100000 ? "text-red-600 font-bold" : "text-green-600 font-bold"}>
              {formatPrice(company.balance)}
            </span>
          </p>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('buy')}
            className={`px-6 py-2 rounded-md font-semibold transition ${activeTab === 'buy' ? 'bg-white shadow text-blue-900' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Buy Aircraft
          </button>
          <button
            onClick={() => setActiveTab('sell')}
            className={`px-6 py-2 rounded-md font-semibold transition ${activeTab === 'sell' ? 'bg-white shadow text-blue-900' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Sell Aircraft
          </button>
        </div>

        {activeTab === 'buy' && (
          <button
            onClick={refreshMarket}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden md:inline">Refresh Market</span>
          </button>
        )}
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search aircraft..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>

          <div className="flex gap-2 overflow-x-auto">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition ${selectedCategory === cat.id
                  ? 'bg-blue-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
            handleSell={handleSell}
            company={company}
            formatPrice={formatPrice}
          />
        ))}
      </div>

      {displayAircraft.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No aircraft found.</p>
        </div>
      )}
    </div>
  );
}

// Extracted Card Component for cleaner state management of "expanded"
// Extracted Card Component for cleaner state management of "expanded"
function AircraftCard({ plane, activeTab, handleBuy, handleSell, company, formatPrice }) {
  const [expanded, setExpanded] = useState(false);

  // Helper to color condition
  const getConditionColor = (cond) => {
    if (cond === undefined || cond === null) return 'text-gray-500';
    if (cond >= 80) return 'text-green-600';
    if (cond >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Safe access helpers for legacy data
  const ttaf = plane.conditionDetails?.airframe?.ttaf ?? plane.hours ?? 0;
  const smoh = plane.conditionDetails?.engine?.smoh ?? 'N/A';
  const avionicsCond = plane.conditionDetails?.avionics?.condition ?? 0;
  const interiorCond = plane.conditionDetails?.interior?.condition ?? 0;

  // Safe price for legacy fleet (if missing, use arbitrary 50k or calculate)
  const displayPrice = plane.price || 50000;

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow relative flex flex-col">
      {/* MEL Banner */}
      {plane.melList && plane.melList.length > 0 && (
        <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 absolute top-2 right-2 rounded z-10">
          {plane.melList.length} MEL ITEM{plane.melList.length > 1 ? 'S' : ''}
        </div>
      )}

      <div className="h-48 bg-gray-200 flex items-center justify-center overflow-hidden relative">
        {plane.image && plane.image.startsWith('/') ? (
          <img src={plane.image} alt={plane.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
            <span className="text-6xl">{plane.image || '✈️'}</span>
          </div>
        )}

        {/* Quick Stats Overlay */}
        <div className="absolute bottom-0 inset-x-0 bg-black bg-opacity-50 text-white p-2 flex justify-between text-xs">
          <span>{plane.year}</span>
          <span>TTAF: {ttaf}</span>
        </div>
      </div>

      <div className="p-4 flex-grow flex flex-col">
        {/* Header */}
        <div className="mb-2">
          <h3 className="text-xl font-bold text-gray-900 leading-tight">{plane.name}</h3>
          <p className="text-sm text-gray-600">{plane.manufacturer} • S/N: {plane.serialNumber || 'N/A'}</p>
        </div>

        {/* Price */}
        <div className="mb-3 flex justify-between items-center">
          <div className="flex items-center gap-1 text-2xl font-bold text-blue-900">
            <DollarSign className="w-6 h-6" />
            {formatPrice(displayPrice)}
          </div>
        </div>

        {/* Key Specs Row */}
        <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-sm mb-4 bg-gray-50 p-2 rounded">
          <div className="flex justify-between">
            <span className="text-gray-500">TTAF</span>
            <span className="font-mono font-bold">{ttaf}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Eng SMOH</span>
            <span className="font-mono font-bold">{smoh}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Avionics</span>
            <span className={`font-bold ${getConditionColor(avionicsCond)}`}>
              {avionicsCond > 0 ? `${avionicsCond}%` : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Interior</span>
            <span className={`font-bold ${getConditionColor(interiorCond)}`}>
              {interiorCond > 0 ? `${interiorCond}/100` : 'N/A'}
            </span>
          </div>
        </div>

        {/* Expandable Details */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-center gap-2 text-sm text-blue-600 hover:text-blue-800 mb-4 transition-colors p-2 border border-blue-100 rounded"
        >
          {expanded ? (
            <>Hide Details <ChevronUp className="w-4 h-4" /></>
          ) : (
            <>View Full Specs <ChevronDown className="w-4 h-4" /></>
          )}
        </button>

        {expanded && (
          <div className="mb-4 text-sm space-y-3 bg-gray-50 p-3 rounded-md border border-gray-100">
            {/* Engine Section */}
            <div>
              <h4 className="font-bold text-gray-700 border-b border-gray-200 mb-1">Engine Details</h4>
              <div className="grid grid-cols-2 gap-1 text-xs">
                <span className="text-gray-500">Model:</span>
                <span className="font-semibold text-right">{plane.conditionDetails?.engine?.model || 'Generic'}</span>
                <span className="text-gray-500">SMOH:</span>
                <span className="font-mono text-right">{smoh} {typeof smoh === 'number' ? 'hrs' : ''}</span>
                <span className="text-gray-500">TBO:</span>
                <span className="font-mono text-right">{plane.conditionDetails?.engine?.tbo || 2000} hrs</span>
                <span className="text-gray-500">TSN:</span>
                <span className="font-mono text-right">{plane.conditionDetails?.engine?.tsn || 'Unknown'} {plane.conditionDetails?.engine?.tsn ? 'hrs' : ''}</span>
                <span className="text-gray-500">Condition:</span>
                <span className={`text-right font-bold ${getConditionColor(plane.conditionDetails?.engine?.condition)}`}>
                  {plane.conditionDetails?.engine?.condition ?? 'N/A'}%
                </span>
              </div>
            </div>

            {/* Airframe Section */}
            <div>
              <h4 className="font-bold text-gray-700 border-b border-gray-200 mb-1">Airframe & Inspection</h4>
              <div className="grid grid-cols-2 gap-1 text-xs">
                <span className="text-gray-500">TTAF:</span>
                <span className="font-mono text-right">{ttaf} hrs</span>
                <span className="text-gray-500">Last Annual:</span>
                <span className="font-mono text-right">{plane.conditionDetails?.airframe?.lastAnnual || 'Unknown'}</span>
              </div>
            </div>

            {/* Avionics Section */}
            <div>
              <h4 className="font-bold text-gray-700 border-b border-gray-200 mb-1">Avionics</h4>
              <ul className="list-disc list-inside text-xs text-gray-600 space-y-0.5">
                {plane.conditionDetails?.avionics?.list?.length > 0 ? (
                  plane.conditionDetails.avionics.list.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))
                ) : (
                  <li>Standard Equipment</li>
                )}
              </ul>
            </div>

            {/* MEL Section */}
            {plane.melList && plane.melList.length > 0 && (
              <div>
                <h4 className="font-bold text-red-600 border-b border-red-200 mb-1">⚠ Known Issues (MEL)</h4>
                <ul className="list-disc list-inside text-xs text-red-600">
                  {plane.melList.map((m, i) => (
                    <li key={i}>{m.item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Action Button */}
        <div className="mt-auto">
          {activeTab === 'buy' ? (
            <button
              onClick={() => handleBuy(plane)}
              disabled={company.balance < displayPrice}
              className={`w-full py-3 rounded-lg font-bold transition ${company.balance >= displayPrice
                ? 'bg-blue-900 text-white hover:bg-blue-800 shadow-md'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
            >
              {company.balance >= displayPrice ? 'Purchase Aircraft' : 'Insufficient Funds'}
            </button>
          ) : (
            <button
              onClick={() => handleSell(plane)}
              className="w-full bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 transition shadow-md"
            >
              Sell Aircraft
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Marketplace;

// Force recompile