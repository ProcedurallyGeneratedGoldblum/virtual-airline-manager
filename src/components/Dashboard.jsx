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
    <div className="space-y-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white">Operations Dashboard</h2>
        <p className="text-gray-400 mt-1">Status: Operational • Region: Northwest Hub</p>
      </div>

      {/* Active Flight Alert */}
      {activeFlights.length > 0 && (
        <div className="bg-blue-900/40 text-white p-6 rounded-xl border border-blue-800 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-lg">
              <Plane className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <p className="text-xs font-bold text-blue-300 uppercase mb-1">Active Mission</p>
              <p className="text-lg font-bold">
                {activeFlights[0].aircraftRegistration} — {activeFlights[0].route.fromCode} <span className="text-gray-400">→</span> {activeFlights[0].route.toCode}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <p className="text-sm font-medium text-gray-400">Missions Logged</p>
            <Plane className="w-5 h-5 text-gray-500" />
          </div>
          <p className="text-3xl font-bold text-white">{completedFlights.length}</p>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <p className="text-sm font-medium text-gray-400">Revenue</p>
            <DollarSign className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-3xl font-bold text-white">${totalEarnings.toLocaleString()}</p>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <p className="text-sm font-medium text-gray-400">Total Fleet</p>
            <Award className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-white">{fleet.length}</p>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <p className="text-sm font-medium text-gray-400">Flight Hours</p>
            <TrendingUp className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-3xl font-bold text-white">{Math.round(company.flightHours)}</p>
        </div>
      </div>

      {/* Quick Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xl font-bold text-white">Recent Activity</h3>

          <div className="space-y-4">
            {recentFlights.length > 0 ? (
              recentFlights.map((flight, index) => (
                <div key={flight.id} className="flex items-center justify-between p-4 bg-gray-800 border border-gray-700 rounded-xl hover:border-gray-600 transition-colors">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-mono text-gray-500">#{index + 1}</span>
                    <div>
                      <p className="font-bold text-white">{flight.route}</p>
                      <p className="text-xs text-gray-500 mt-1">{getTimeAgo(flight.date)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-emerald-400">
                      +${flight.earnings?.toLocaleString() || 0}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-gray-800/50 rounded-xl border border-dashed border-gray-700">
                <Plane className="w-8 h-8 mx-auto mb-3 text-gray-600" />
                <p className="text-gray-500">No mission data available</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-bold text-white">Performance Metrics</h3>

          <div className="space-y-6 p-6 bg-gray-800 rounded-xl border border-gray-700">
            <div>
              <div className="flex justify-between mb-2 text-sm">
                <span className="text-gray-400">Reliability</span>
                <span className="text-white font-bold">
                  {completedFlights.length > 0 ? '100%' : '0%'}
                </span>
              </div>
              <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-1000"
                  style={{ width: completedFlights.length > 0 ? '100%' : '0%' }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2 text-sm">
                <span className="text-gray-400">Fleet Readiness</span>
                <span className="text-white font-bold">
                  {fleet.length > 0 ? Math.round((fleet.filter(a => a.status === 'available').length / fleet.length) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-500 h-full rounded-full transition-all duration-1000"
                  style={{ width: fleet.length > 0 ? `${(fleet.filter(a => a.status === 'available').length / fleet.length) * 100}%` : '0%' }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2 text-sm">
                <span className="text-gray-400">Air Miles</span>
                <span className="text-white font-bold">
                  {completedFlights.reduce((sum, f) => sum + (f.distance || 0), 0).toLocaleString()} <span className="text-xs text-gray-500">NM</span>
                </span>
              </div>
              <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-500 h-full rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min((completedFlights.reduce((sum, f) => sum + (f.distance || 0), 0) / 10000) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="p-4 border border-blue-900/30 bg-blue-900/10 rounded-xl">
            <p className="text-xs text-blue-300 leading-relaxed">
              Airframes status is monitored 24/7 by the Operations Center.
              Always verify airframe integrity before departure.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;