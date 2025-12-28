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
    <div className="space-y-12">
      <div className="border-l-8 border-black pl-6 py-2">
        <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter italic">Operations Dashboard</h2>
        <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mt-1">Status: Operational • Region: Northwest Hub</p>
      </div>

      {/* Active Flight Alert - Rugged Style */}
      {activeFlights.length > 0 && (
        <div className="bg-black text-white p-6 shadow-2xl skew-x-[-1deg]">
          <div className="flex items-center gap-6 skew-x-[1deg]">
            <div className="p-3 bg-white text-black rounded-sm">
              <Plane className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <p className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase mb-1">Active Mission</p>
              <p className="text-xl font-black tracking-tight uppercase">
                {activeFlights[0].aircraftRegistration} — {activeFlights[0].route.fromCode} <span className="text-emerald-500">→</span> {activeFlights[0].route.toCode}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid - High Contrast */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-zinc-200 border border-zinc-200 shadow-sm overflow-hidden rounded-sm">
        <div className="bg-white p-8 group hover:bg-zinc-50 transition-colors">
          <p className="text-[10px] font-mono tracking-[0.2em] text-zinc-400 uppercase mb-4">Missions Logged</p>
          <div className="flex items-end justify-between">
            <p className="text-4xl font-black text-black">{completedFlights.length}</p>
            <Plane className="w-8 h-8 text-zinc-200 group-hover:text-black transition-colors" />
          </div>
        </div>

        <div className="bg-white p-8 group hover:bg-zinc-50 transition-colors">
          <p className="text-[10px] font-mono tracking-[0.2em] text-zinc-400 uppercase mb-4">Revenue (USD)</p>
          <div className="flex items-end justify-between">
            <p className="text-4xl font-black text-black">${totalEarnings.toLocaleString()}</p>
            <DollarSign className="w-8 h-8 text-zinc-200 group-hover:text-emerald-600 transition-colors" />
          </div>
        </div>

        <div className="bg-white p-8 group hover:bg-zinc-50 transition-colors">
          <p className="text-[10px] font-mono tracking-[0.2em] text-zinc-400 uppercase mb-4">Total Fleet</p>
          <div className="flex items-end justify-between">
            <p className="text-4xl font-black text-black">{fleet.length}</p>
            <Award className="w-8 h-8 text-zinc-200 group-hover:text-black transition-colors" />
          </div>
        </div>

        <div className="bg-white p-8 group hover:bg-zinc-50 transition-colors">
          <p className="text-[10px] font-mono tracking-[0.2em] text-zinc-400 uppercase mb-4">Flight Hours</p>
          <div className="flex items-end justify-between">
            <p className="text-4xl font-black text-black">{Math.round(company.flightHours)}</p>
            <TrendingUp className="w-8 h-8 text-zinc-200 group-hover:text-black transition-colors" />
          </div>
        </div>
      </div>

      {/* Quick Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-4 mb-2">
            <h3 className="text-sm font-black uppercase tracking-[0.3em] text-slate-400">Recent Operational History</h3>
            <div className="flex-1 h-px bg-zinc-100"></div>
          </div>

          <div className="space-y-1">
            {recentFlights.length > 0 ? (
              recentFlights.map((flight, index) => (
                <div key={flight.id} className="flex items-center justify-between p-4 bg-white border border-zinc-100 hover:border-black transition-all group">
                  <div className="flex items-center gap-6">
                    <span className="text-[10px] font-mono text-zinc-300">#{index + 1}</span>
                    <div>
                      <p className="text-xs font-black uppercase tracking-tight group-hover:text-black">{flight.route}</p>
                      <p className="text-[9px] font-mono text-zinc-400 mt-1 uppercase">{getTimeAgo(flight.date)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-emerald-600">
                      +${flight.earnings?.toLocaleString() || 0}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-24 bg-zinc-50 border border-dashed border-zinc-200">
                <Plane className="w-12 h-12 mx-auto mb-4 text-zinc-200" />
                <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">No Mission Data Available</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <h3 className="text-sm font-black uppercase tracking-[0.3em] text-slate-400">Performance Metrics</h3>
            <div className="flex-1 h-px bg-zinc-100"></div>
          </div>

          <div className="space-y-10 p-8 bg-black text-white rounded-sm">
            <div>
              <div className="flex justify-between mb-3 items-end">
                <span className="text-[10px] font-mono tracking-widest uppercase text-zinc-500">Reliability</span>
                <span className="text-xl font-black">
                  {completedFlights.length > 0 ? '100%' : '0%'}
                </span>
              </div>
              <div className="w-full bg-zinc-800 h-1.5">
                <div
                  className="bg-emerald-500 h-full transition-all duration-1000"
                  style={{ width: completedFlights.length > 0 ? '100%' : '0%' }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-3 items-end">
                <span className="text-[10px] font-mono tracking-widest uppercase text-zinc-500">Fleet Readiness</span>
                <span className="text-xl font-black">
                  {fleet.length > 0 ? Math.round((fleet.filter(a => a.status === 'available').length / fleet.length) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-zinc-800 h-1.5">
                <div
                  className="bg-white h-full transition-all duration-1000"
                  style={{ width: fleet.length > 0 ? `${(fleet.filter(a => a.status === 'available').length / fleet.length) * 100}%` : '0%' }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-3 items-end">
                <span className="text-[10px] font-mono tracking-widest uppercase text-zinc-500">Air Miles</span>
                <span className="text-xl font-black">
                  {completedFlights.reduce((sum, f) => sum + (f.distance || 0), 0).toLocaleString()} <span className="text-[10px] text-zinc-500">NM</span>
                </span>
              </div>
              <div className="w-full bg-zinc-800 h-1.5">
                <div
                  className="bg-indigo-500 h-full transition-all duration-1000"
                  style={{ width: `${Math.min((completedFlights.reduce((sum, f) => sum + (f.distance || 0), 0) / 10000) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="p-4 border border-zinc-200 rounded-sm">
            <p className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest leading-relaxed">
              Airframes status is monitored 24/7 by the Northwestern Operations Center.
              Always verify airframe integrity before departure.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;