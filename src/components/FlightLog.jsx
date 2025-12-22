import React, { useState } from 'react';
import { Calendar, Clock, Plane, MapPin, Award, TrendingUp, DollarSign } from 'lucide-react';
import { useAppContext } from './AppContext';

function FlightLog() {
  const { completedFlights } = useAppContext();
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredFlights = completedFlights.filter(flight => {
    if (filterStatus === 'all') return true;
    return flight.status === filterStatus;
  });

  // Calculate statistics
  const totalFlights = completedFlights.length;
  const totalEarnings = completedFlights.reduce((sum, flight) => sum + (flight.earnings || 0), 0);
  const totalDistance = completedFlights.reduce((sum, flight) => {
    return sum + (flight.distance || 0);
  }, 0);
  const onTimeFlights = completedFlights.filter(f => f.briefing?.onTime !== false).length;
  const onTimePercentage = totalFlights > 0 ? Math.round((onTimeFlights / totalFlights) * 100) : 0;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Flight Log</h2>
        <p className="text-gray-600">Complete history of your flight operations</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Flights</p>
              <p className="text-3xl font-bold text-gray-900">{totalFlights}</p>
            </div>
            <Plane className="w-12 h-12 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Earnings</p>
              <p className="text-3xl font-bold text-green-600">{formatCurrency(totalEarnings)}</p>
            </div>
            <TrendingUp className="w-12 h-12 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Distance Flown</p>
              <p className="text-3xl font-bold text-gray-900">{Math.round(totalDistance)} nm</p>
            </div>
            <MapPin className="w-12 h-12 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">On-Time Rate</p>
              <p className="text-3xl font-bold text-gray-900">{onTimePercentage}%</p>
            </div>
            <Award className="w-12 h-12 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Empty State */}
      {completedFlights.length === 0 ? (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <Plane className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Flights Yet</h3>
          <p className="text-gray-600 mb-4">
            Your flight history will appear here after you complete your first flight.
          </p>
          <button
            onClick={() => window.location.hash = '#dispatch'}
            className="bg-blue-900 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-800 transition"
          >
            Go to Dispatch Center
          </button>
        </div>
      ) : (
        <>
          {/* Filter Tabs */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-lg font-semibold transition ${filterStatus === 'all'
                    ? 'bg-blue-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                All Flights ({completedFlights.length})
              </button>
              <button
                onClick={() => setFilterStatus('completed')}
                className={`px-4 py-2 rounded-lg font-semibold transition ${filterStatus === 'completed'
                    ? 'bg-blue-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                Completed ({completedFlights.filter(f => f.status === 'completed').length})
              </button>
            </div>
          </div>

          {/* Flight Log Table */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Flight
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Route
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Distance
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Earnings
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredFlights.map((flight) => (
                    <tr key={flight.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">
                            {formatDate(flight.date)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-bold text-gray-900">{flight.flightNumber || flight.aircraft}</div>
                          <div className="text-xs text-gray-600">{flight.type}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-900">{flight.route}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-sm">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-900">{flight.duration}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{flight.distance} nm</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-sm font-bold text-green-600">
                          <DollarSign className="w-4 h-4" />
                          {(flight.earnings || 0).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                          COMPLETED
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default FlightLog;