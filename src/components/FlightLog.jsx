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
    <div className="space-y-12">
      <div className="border-l-8 border-black pl-6 py-2">
        <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter italic">Mission Logs</h2>
        <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mt-1">Registry: Northwestern Archive • Historical Operational Data</p>
      </div>

      {/* Statistics Cards - Industrial Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-zinc-200 border border-zinc-200 shadow-sm overflow-hidden">
        <div className="bg-white p-8 group hover:bg-zinc-50 transition-colors text-center md:text-left">
          <p className="text-[10px] font-mono tracking-[0.2em] text-zinc-400 uppercase mb-4">Missions</p>
          <div className="flex items-end justify-between">
            <p className="text-4xl font-black text-black">{totalFlights}</p>
            <Plane className="w-8 h-8 text-zinc-100 group-hover:text-black transition-colors" />
          </div>
        </div>

        <div className="bg-white p-8 group hover:bg-zinc-50 transition-colors text-center md:text-left">
          <p className="text-[10px] font-mono tracking-[0.2em] text-zinc-400 uppercase mb-4">Yield</p>
          <div className="flex items-end justify-between">
            <p className="text-4xl font-black text-emerald-600">{formatCurrency(totalEarnings)}</p>
            <TrendingUp className="w-8 h-8 text-zinc-100 group-hover:text-emerald-600 transition-colors" />
          </div>
        </div>

        <div className="bg-white p-8 group hover:bg-zinc-50 transition-colors text-center md:text-left">
          <p className="text-[10px] font-mono tracking-[0.2em] text-zinc-400 uppercase mb-4">NM Logged</p>
          <div className="flex items-end justify-between">
            <p className="text-4xl font-black text-black">{Math.round(totalDistance)}</p>
            <MapPin className="w-8 h-8 text-zinc-100 group-hover:text-black transition-colors" />
          </div>
        </div>

        <div className="bg-white p-8 group hover:bg-zinc-50 transition-colors text-center md:text-left">
          <p className="text-[10px] font-mono tracking-[0.2em] text-zinc-400 uppercase mb-4">Reliability</p>
          <div className="flex items-end justify-between">
            <p className="text-4xl font-black text-black">{onTimePercentage}%</p>
            <Award className="w-8 h-8 text-zinc-100 group-hover:text-black transition-colors" />
          </div>
        </div>
      </div>

      {/* Empty State */}
      {completedFlights.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-zinc-200 p-24 text-center">
          <Plane className="w-16 h-16 text-zinc-200 mx-auto mb-6" />
          <h3 className="text-lg font-black uppercase tracking-widest text-zinc-400">Archives Empty</h3>
          <p className="text-sm text-zinc-500 mt-2 mb-8 uppercase tracking-tight">No historical operation data found in the vault.</p>
          <button
            onClick={() => window.location.hash = '#dispatch'}
            className="bg-black text-white px-10 py-4 font-black uppercase tracking-[0.2em] text-xs hover:bg-zinc-800 transition-all"
          >
            Initiate First Assignment
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Filter Tabs - Minimal */}
          <div className="flex gap-4 border-b border-zinc-100 pb-4">
            <button
              onClick={() => setFilterStatus('all')}
              className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 transition-all ${filterStatus === 'all' ? 'bg-black text-white' : 'text-zinc-400 hover:text-black'}`}
            >
              Master Log ({completedFlights.length})
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 transition-all ${filterStatus === 'completed' ? 'bg-black text-white' : 'text-zinc-400 hover:text-black'}`}
            >
              Mission Final ({completedFlights.filter(f => f.status === 'completed').length})
            </button>
          </div>

          {/* Flight Log Table - Industrial */}
          <div className="bg-white border border-zinc-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-black text-white">
                    <th className="px-6 py-4 text-left text-[9px] font-black uppercase tracking-[0.3em]">Timestamp</th>
                    <th className="px-6 py-4 text-left text-[9px] font-black uppercase tracking-[0.3em]">Identification</th>
                    <th className="px-6 py-4 text-left text-[9px] font-black uppercase tracking-[0.3em]">Vector</th>
                    <th className="px-6 py-4 text-left text-[9px] font-black uppercase tracking-[0.3em]">Dur</th>
                    <th className="px-6 py-4 text-left text-[9px] font-black uppercase tracking-[0.3em]">Range</th>
                    <th className="px-6 py-4 text-left text-[9px] font-black uppercase tracking-[0.3em]">Yield</th>
                    <th className="px-6 py-4 text-left text-[9px] font-black uppercase tracking-[0.3em]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredFlights.map((flight) => (
                    <tr key={flight.id} className="hover:bg-zinc-50 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-[10px] font-mono font-bold text-zinc-400">{formatDate(flight.date)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-xs font-black text-black uppercase tracking-tight">{flight.flightNumber || flight.aircraft}</div>
                          <div className="text-[9px] font-mono text-zinc-400 uppercase mt-0.5">{flight.type}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-[10px] font-black text-black uppercase">{flight.route}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-zinc-500">
                          {flight.duration}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-mono font-bold text-zinc-500">{flight.distance} NM</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-black text-emerald-600">
                          {formatCurrency(flight.earnings || 0)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2 py-0.5 border border-zinc-200 text-[9px] font-black tracking-widest text-zinc-400 uppercase">
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