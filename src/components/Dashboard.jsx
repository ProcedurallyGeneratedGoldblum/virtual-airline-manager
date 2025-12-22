import React from 'react';
import { Plane, DollarSign, Award, TrendingUp, Clock } from 'lucide-react';
import { useAppContext } from './AppContext';

function Dashboard() {
  const { company, fleet, completedFlights, activeFlights } = useAppContext();

  // Calculate total earnings from completed flights
  const totalEarnings = completedFlights.reduce((sum, flight) => sum + (flight.earnings || 0), 0);

  // Get recent activity (last 5 completed flights)
  const recentFlights = [...completedFlights]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  // Format time ago
  const getTimeAgo = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffDays > 0) {
      return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
    } else if (diffHours > 0) {
      return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
    } else {
      return 'Just now';
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h2>
        <p className="text-gray-600">Welcome to your virtual airline operations</p>
      </div>

      {/* Active Flight Alert */}
      {activeFlights.length > 0 && (
        <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-6 rounded-r-lg">
          <div className="flex items-center gap-3">
            <Plane className="w-6 h-6 text-blue-600 animate-pulse" />
            <div>
              <p className="font-semibold text-blue-900">
                {activeFlights.length} Active Flight{activeFlights.length > 1 ? 's' : ''}
              </p>
              <p className="text-sm text-blue-700">
                {activeFlights[0].aircraftRegistration} flying {activeFlights[0].route.fromCode} → {activeFlights[0].route.toCode}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Flights</p>
              <p className="text-3xl font-bold text-gray-900">{completedFlights.length}</p>
            </div>
            <Plane className="w-12 h-12 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Earnings</p>
              <p className="text-3xl font-bold text-green-600">${totalEarnings.toLocaleString()}</p>
            </div>
            <DollarSign className="w-12 h-12 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Aircraft Owned</p>
              <p className="text-3xl font-bold text-gray-900">{fleet.length}</p>
            </div>
            <Award className="w-12 h-12 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Flight Hours</p>
              <p className="text-3xl font-bold text-gray-900">{Math.round(company.flightHours)}</p>
            </div>
            <TrendingUp className="w-12 h-12 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Quick Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {recentFlights.length > 0 ? (
              recentFlights.map((flight, index) => (
                <div key={flight.id} className={`flex items-center justify-between py-2 ${index < recentFlights.length - 1 ? 'border-b' : ''}`}>
                  <div className="flex items-center gap-2">
                    <Plane className="w-4 h-4 text-blue-600" />
                    <span className="text-gray-700">
                      Completed flight {flight.route}
                    </span>
                    <span className="text-green-600 font-semibold text-sm">
                      +${flight.earnings?.toLocaleString() || 0}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">{getTimeAgo(flight.date)}</span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Plane className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No flights completed yet</p>
                <p className="text-sm">Accept your first flight from Dispatch Center</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Completion Rate</span>
                <span className="text-sm font-semibold text-gray-900">
                  {completedFlights.length > 0 ? '100%' : '0%'}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: completedFlights.length > 0 ? '100%' : '0%' }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Fleet Availability</span>
                <span className="text-sm font-semibold text-gray-900">
                  {fleet.length > 0 ? Math.round((fleet.filter(a => a.status === 'available').length / fleet.length) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: fleet.length > 0 ? `${(fleet.filter(a => a.status === 'available').length / fleet.length) * 100}%` : '0%' }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Distance Flown</span>
                <span className="text-sm font-semibold text-gray-900">
                  {completedFlights.reduce((sum, f) => sum + (f.distance || 0), 0).toLocaleString()} nm
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((completedFlights.reduce((sum, f) => sum + (f.distance || 0), 0) / 10000) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;