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
    <div className="space-y-8">
      <div className="border-b border-gray-200 pb-6">
        <h2 className="text-3xl font-bold text-gray-900">Mission Logs</h2>
        <p className="text-sm text-gray-500 mt-1">Registry: Northwestern Archive • Historical Operational Data</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-2">Missions</p>
          <div className="flex items-end justify-between">
            <p className="text-3xl font-bold text-gray-900">{totalFlights}</p>
            <Plane className="w-6 h-6 text-gray-400" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-2">Yield</p>
          <div className="flex items-end justify-between">
            <p className="text-3xl font-bold text-green-600">{formatCurrency(totalEarnings)}</p>
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-2">NM Logged</p>
          <div className="flex items-end justify-between">
            <p className="text-3xl font-bold text-gray-900">{Math.round(totalDistance)}</p>
            <MapPin className="w-6 h-6 text-gray-400" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-2">Reliability</p>
          <div className="flex items-end justify-between">
            <p className="text-3xl font-bold text-gray-900">{onTimePercentage}%</p>
            <Award className="w-6 h-6 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Empty State */}
      {completedFlights.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <Plane className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">Archives Empty</h3>
          <p className="text-gray-500 mt-1 mb-8">No historical operation data found.</p>
          <button
            onClick={() => window.location.hash = '#dispatch'}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition shadow-sm"
          >
            Initiate First Assignment
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Filter Tabs */}
          <div className="flex gap-2 border-b border-gray-200 pb-1">
            <button
              onClick={() => setFilterStatus('all')}
              className={`text-sm font-medium px-4 py-2 rounded-t-lg transition-colors ${filterStatus === 'all' ? 'bg-white border-x border-t border-gray-200 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Master Log ({completedFlights.length})
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`text-sm font-medium px-4 py-2 rounded-t-lg transition-colors ${filterStatus === 'completed' ? 'bg-white border-x border-t border-gray-200 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Mission Final ({completedFlights.filter(f => f.status === 'completed').length})
            </button>
          </div>

          {/* Flight Log Table */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Timestamp</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Identification</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Vector</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Dur</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Range</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Yield</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredFlights.map((flight) => (
                    <tr key={flight.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">{formatDate(flight.date)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-bold text-gray-900">{flight.flightNumber || flight.aircraft}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{flight.type}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{flight.route}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          {flight.duration}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{flight.distance} NM</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-green-600">
                          {formatCurrency(flight.earnings || 0)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          ARCHIVED
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FlightLog;