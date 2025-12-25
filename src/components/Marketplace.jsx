import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, DollarSign } from 'lucide-react';
import { generateAircraft } from '../utils/aircraftGenerator';
import { useAppContext } from './AppContext';

function Marketplace() {
  const { fleet, company, sellAircraft, addAircraftToFleet } = useAppContext();
  const [activeTab, setActiveTab] = useState('buy');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [marketListings, setMarketListings] = useState([]);
  const [sortOrder, setSortOrder] = useState('price-asc');

  // Generate market listings on mount
  useEffect(() => {
    setMarketListings(generateAircraft(30));
  }, []);

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
    return sourceList.filter(plane => {
      const matchesCategory = selectedCategory === 'all' || plane.category === selectedCategory;
      const matchesSearch = plane.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plane.manufacturer.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    })
      .sort((a, b) => {
        if (sortOrder === 'price-asc') return a.price - b.price;
        if (sortOrder === 'price-desc') return b.price - a.price;
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
            onClick={() => setMarketListings(generateAircraft(30))}
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
          <div key={plane.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow relative">
            {/* MEL Banner if issues exist */}
            {plane.melList && plane.melList.length > 0 && (
              <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 absolute top-2 right-2 rounded z-10">
                {plane.melList.length} MEL ITEM{plane.melList.length > 1 ? 'S' : ''}
              </div>
            )}

            <div className="h-48 bg-gray-200 flex items-center justify-center overflow-hidden">
              {plane.image && plane.image.startsWith('/') ? (
                <img src={plane.image} alt={plane.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                  <span className="text-6xl">{plane.image || '✈️'}</span>
                </div>
              )}
            </div>

            <div className="p-5">
              <div className="mb-3">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-xl font-bold text-gray-900">{plane.name}</h3>
                  {/* Digital Condition */}
                  {plane.conditionDetails && (
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${plane.conditionDetails.engine.condition > 80 ? 'bg-green-100 text-green-800' :
                      plane.conditionDetails.engine.condition > 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                      }`}>
                      Eng: {plane.conditionDetails.engine.condition}%
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">{plane.year} • {plane.manufacturer}</p>
                {plane.melList && plane.melList.length > 0 && (
                  <div className="mt-1 text-xs text-red-600">
                    Includes: {plane.melList.map(m => m.item).join(', ')}
                  </div>
                )}
              </div>

              <div className="mb-3">
                <div className="flex items-center gap-1 text-2xl font-bold text-blue-900">
                  <DollarSign className="w-6 h-6" />
                  {formatPrice(plane.price)}
                </div>
                {activeTab === 'sell' && (
                  <p className="text-xs text-gray-500">Estimated Market Value</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                <div><span className="text-gray-600">Hours:</span> <span className="font-semibold">{Math.round(plane.hours || 0)}</span></div>
                <div><span className="text-gray-600">Seats:</span> <span className="font-semibold">{plane.specs?.seats || '-'}</span></div>
                <div><span className="text-gray-600">Range:</span> <span className="font-semibold">{plane.specs?.range || '-'}</span></div>
                <div><span className="text-gray-600">Cruise:</span> <span className="font-semibold">{plane.specs?.cruise || '-'}</span></div>
              </div>

              {activeTab === 'buy' ? (
                <button
                  onClick={() => handleBuy(plane)}
                  disabled={company.balance < plane.price}
                  className={`w-full py-3 rounded-lg font-semibold transition ${company.balance >= plane.price
                    ? 'bg-blue-900 text-white hover:bg-blue-800'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                >
                  {company.balance >= plane.price ? 'Purchase Aircraft' : 'Insufficient Funds'}
                </button>
              ) : (
                <button
                  onClick={() => handleSell(plane)}
                  className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition"
                >
                  Sell Aircraft
                </button>
              )}
            </div>
          </div>
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

export default Marketplace;

// Force recompile