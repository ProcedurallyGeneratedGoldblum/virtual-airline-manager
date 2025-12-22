import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, DollarSign } from 'lucide-react';
import { generateAircraft } from '../utils/aircraftGenerator';

function Marketplace() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [aircraft, setAircraft] = useState([]);

  // Generate aircraft on component mount
  useEffect(() => {
    setAircraft(generateAircraft(30));
  }, []);

  const categories = [
    { id: 'all', name: 'All Aircraft' },
    { id: 'single-piston', name: 'Single Piston' },
    { id: 'twin-piston', name: 'Twin Piston' },
    { id: 'turboprop', name: 'Turboprop' },
  ];

  const filteredAircraft = aircraft.filter(plane => {
    const matchesCategory = selectedCategory === 'all' || plane.category === selectedCategory;
    const matchesSearch = plane.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plane.manufacturer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleRefreshListings = () => {
    setAircraft(generateAircraft(30));
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Aircraft Marketplace</h2>
          <p className="text-gray-600">Browse and purchase aircraft for your fleet</p>
        </div>
        <button
          onClick={handleRefreshListings}
          className="flex items-center gap-2 px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition"
        >
          <RefreshCw className="w-4 h-4" />
          New Listings
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by manufacturer or model..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
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

      {/* Results count */}
      <div className="mb-4">
        <p className="text-gray-600">
          Showing <span className="font-semibold">{filteredAircraft.length}</span> aircraft
        </p>
      </div>

      {/* Aircraft Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAircraft.map(plane => (
          <div key={plane.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            {/* Image Placeholder */}
            {/* Image Placeholder or Real Image */}
            <div className="h-48 bg-gray-200 flex items-center justify-center overflow-hidden">
              {plane.image && plane.image.startsWith('/') ? (
                <img
                  src={plane.image}
                  alt={plane.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                  <span className="text-6xl">{plane.image}</span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-5">
              {/* Header */}
              <div className="mb-3">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-xl font-bold text-gray-900">{plane.name}</h3>
                  <span className={`px-2 py-1 text-xs font-semibold rounded ${plane.condition === 'Excellent' ? 'bg-green-100 text-green-800' :
                      plane.condition === 'Very Good' ? 'bg-blue-100 text-blue-800' :
                        plane.condition === 'Good' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                    }`}>
                    {plane.condition}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{plane.year} • {plane.manufacturer}</p>
              </div>

              {/* Price */}
              <div className="mb-3">
                <div className="flex items-center gap-1 text-2xl font-bold text-blue-900">
                  <DollarSign className="w-6 h-6" />
                  {formatPrice(plane.price)}
                </div>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                <div>
                  <span className="text-gray-600">Hours:</span>
                  <span className="ml-1 font-semibold">{plane.hours.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-600">Seats:</span>
                  <span className="ml-1 font-semibold">{plane.specs.seats}</span>
                </div>
                <div>
                  <span className="text-gray-600">Cruise:</span>
                  <span className="ml-1 font-semibold">{plane.specs.cruise}</span>
                </div>
                <div>
                  <span className="text-gray-600">Range:</span>
                  <span className="ml-1 font-semibold">{plane.specs.range}</span>
                </div>
              </div>

              {/* Location */}
              <div className="mb-4 text-sm text-gray-600">
                📍 {plane.location}
              </div>

              {/* Description */}
              <p className="text-sm text-gray-700 mb-4">{plane.description}</p>

              {/* Action Button */}
              <button className="w-full bg-blue-900 text-white py-3 rounded-lg font-semibold hover:bg-blue-800 transition">
                Purchase Aircraft
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* No results message */}
      {filteredAircraft.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No aircraft found matching your criteria</p>
        </div>
      )}
    </div>
  );
}

export default Marketplace;

// Force recompile