import React, { useState } from 'react';
import { User, Award, TrendingUp, Clock, Plane, MapPin, Star, Trophy, Edit2, Save, X, Hash, ShieldCheck, Zap } from 'lucide-react';

import { useAppContext } from './AppContext';

function PilotProfile() {
  const { pilot, updatePilot } = useAppContext();
  const [isEditing, setIsEditing] = useState(false);
  const hasPilot = !!pilot.name;

  const [editForm, setEditForm] = useState(pilot);

  const licenseTypes = [
    { id: 'ppl', name: 'Private Pilot License (PPL)' },
    { id: 'cpl', name: 'Commercial Pilot License (CPL)' },
    { id: 'atpl', name: 'Airline Transport Pilot License (ATPL)' },
    { id: 'spl', name: 'Student Pilot License (SPL)' },
  ];

  const stats = [
    { label: 'Ops Cycles', value: pilot.totalFlights, icon: Plane },
    { label: 'Duty Hours', value: `${pilot.totalHours?.toFixed(1) || 0}H`, icon: Clock },
    { label: 'Log Range', value: `${pilot.totalDistance?.toLocaleString() || 0} NM`, icon: MapPin },
    { label: 'Gross Yield', value: `$${pilot.totalEarnings?.toLocaleString() || 0}`, icon: TrendingUp },
  ];

  const achievements = [
    { name: 'Commence Ops', description: 'Complete your first flight', icon: <Zap className="w-5 h-5" />, earned: pilot.totalFlights >= 1, req: '1 CYCLE' },
    { name: 'Standard Rating', description: 'Complete 10 flights', icon: <ShieldCheck className="w-5 h-5" />, earned: pilot.totalFlights >= 10, req: '10 CYCLES' },
    { name: 'Senior Division', description: 'Complete 100 flights', icon: <Award className="w-5 h-5" />, earned: pilot.totalFlights >= 100, req: '100 CYCLES' },
    { name: 'Industrial Ace', description: 'Maintain 95% safety rating', icon: <Trophy className="w-5 h-5" />, earned: pilot.safetyRating >= 95 && pilot.totalFlights > 5, req: '95% SAFE' },
  ];



  const handleSavePilot = () => {
    if (editForm.name && editForm.callsign && editForm.license) {
      updatePilot(editForm);
      setIsEditing(false);
    } else {
      alert('REQUIRED FIELDS: Name, Callsign, License Type');
    }
  };

  const getRankProgress = () => {
    return Math.round((pilot.experience / pilot.nextRankXP) * 100);
  };

  if (!hasPilot && !isEditing) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center">
        <div className="inline-flex p-8 bg-zinc-50 border border-zinc-200 mb-8">
          <User className="w-16 h-16 text-black" />
        </div>
        <h2 className="text-5xl font-black text-black uppercase tracking-tighter italic mb-4">Initialize Personnel</h2>
        <p className="text-zinc-500 font-mono text-xs tracking-widest uppercase mb-12 max-w-md mx-auto">
          No active pilot profile detected in local database. Personnel authorization required to commence Northwestern operations.
        </p>
        <button
          onClick={() => setIsEditing(true)}
          className="bg-black text-white px-12 py-5 text-sm font-black uppercase tracking-[0.3em] hover:bg-zinc-800 transition-all border-b-4 border-zinc-700"
        >
          Begin Initialization
        </button>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="border-l-8 border-black pl-6 py-2 mb-12">
          <h2 className="text-4xl font-black text-black uppercase tracking-tighter italic">Personnel Config</h2>
          <p className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase mt-1">System Administration • Identity Management</p>
        </div>

        <div className="bg-white border border-zinc-200 shadow-sm overflow-hidden">
          <div className="p-8 space-y-8">
            <div>
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3 block">Personnel Full Name</label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full bg-zinc-50 border border-zinc-200 px-4 py-4 text-sm font-bold focus:border-black outline-none transition-all rounded-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div>
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3 block">Callsign Identifier</label>
                <input
                  type="text"
                  value={editForm.callsign}
                  onChange={(e) => setEditForm({ ...editForm, callsign: e.target.value.toUpperCase() })}
                  className="w-full bg-zinc-50 border border-zinc-200 px-4 py-4 text-sm font-black uppercase tracking-widest focus:border-black outline-none transition-all rounded-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3 block">License Class</label>
                <select
                  value={editForm.license}
                  onChange={(e) => setEditForm({ ...editForm, license: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-200 px-4 py-4 text-sm font-bold focus:border-black outline-none transition-all rounded-none appearance-none"
                >
                  <option value="">Select Class</option>
                  {licenseTypes.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                onClick={handleSavePilot}
                className="flex-1 bg-black text-white py-5 text-[10px] font-black uppercase tracking-[.3em] hover:bg-zinc-800 transition-all border-b-4 border-zinc-700"
              >
                Commit Personnel Data
              </button>
              {hasPilot && (
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-8 bg-white border border-zinc-200 text-zinc-400 py-5 text-[10px] font-black uppercase tracking-[.3em] hover:text-black hover:border-black transition-all"
                >
                  Abort
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-l-8 border-black pl-6 py-2">
        <div>
          <h2 className="text-4xl font-black text-black uppercase tracking-tighter italic">Personnel File</h2>
          <p className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase mt-1">Northwestern Operations • Service Record #{pilot.callsign}</p>
        </div>
        <button
          onClick={() => setIsEditing(true)}
          className="flex items-center gap-3 px-6 py-3 bg-zinc-100 text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all border border-zinc-200"
        >
          <Edit2 className="w-3 h-3" /> Update Record
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-zinc-200 border border-zinc-200 overflow-hidden shadow-md">
        <div className="lg:col-span-2 bg-white p-12">
          <div className="flex flex-col md:flex-row gap-12 items-start md:items-center">
            <div className="bg-zinc-50 border-2 border-zinc-100 p-8">
              <User className="w-20 h-20 text-black" />
            </div>
            <div className="space-y-4">
              <div className="inline-block bg-black text-white px-3 py-1 text-[9px] font-black uppercase tracking-widest mb-2">
                {pilot.rank}
              </div>
              <h1 className="text-5xl font-black text-black uppercase tracking-tighter italic">{pilot.name}</h1>
              <div className="flex flex-wrap gap-6 text-[10px] font-mono text-zinc-400 uppercase tracking-widest border-t border-zinc-100 pt-4">
                <span className="flex items-center gap-2"><Hash className="w-3 h-3 text-zinc-300" /> {pilot.callsign}</span>
                <span className="flex items-center gap-2"><Award className="w-3 h-3 text-zinc-300" /> {licenseTypes.find(l => l.id === pilot.license)?.name || 'N/A'}</span>
                <span className="flex items-center gap-2"><Clock className="w-3 h-3 text-zinc-300" /> SINCE {new Date(pilot.joinDate).getFullYear()}</span>
              </div>
            </div>
          </div>

          <div className="mt-12 space-y-3">
            <div className="flex justify-between items-center px-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 italic">Experience Matrix</span>
              <span className="text-[10px] font-mono font-black">{pilot.experience} / {pilot.nextRankXP} UNITS</span>
            </div>
            <div className="h-4 bg-zinc-100 border border-zinc-200 p-0.5 rounded-none overflow-hidden">
              <div
                className="h-full bg-black transition-all duration-1000"
                style={{ width: `${getRankProgress()}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-zinc-50 p-12 space-y-8 flex flex-col justify-center border-l-4 border-zinc-300">
          <div>
            <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Safety Rating</p>
            <p className="text-5xl font-black italic tracking-tighter">{pilot.safetyRating}%</p>
            <div className="w-full h-1 bg-zinc-200 mt-2">
              <div className="h-full bg-emerald-500" style={{ width: `${pilot.safetyRating}%` }}></div>
            </div>
          </div>
          <div>
            <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">On-Time Performance</p>
            <p className="text-5xl font-black italic tracking-tighter">{pilot.onTimePercentage}%</p>
            <div className="w-full h-1 bg-zinc-200 mt-2">
              <div className="h-full bg-zinc-900" style={{ width: `${pilot.onTimePercentage}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-zinc-200 border border-zinc-200 shadow-sm overflow-hidden">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-8 group hover:bg-zinc-50 transition-all">
            <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <stat.icon className="w-3 h-3 text-zinc-300 group-hover:text-black transition-colors" /> {stat.label}
            </p>
            <p className="text-2xl font-black italic tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-black text-black uppercase tracking-widest italic flex items-center gap-3">
          <Trophy className="w-5 h-5" /> Operational Merit
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-zinc-200 border border-zinc-200 overflow-hidden shadow-sm">
          {achievements.map((a, i) => (
            <div key={i} className={`p-8 flex gap-6 items-center transition-all ${a.earned ? 'bg-white' : 'bg-zinc-50 grayscale opacity-40'}`}>
              <div className={`p-4 border-2 ${a.earned ? 'border-black bg-white' : 'border-zinc-200 bg-zinc-100 text-zinc-300'}`}>
                {a.icon}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="text-xs font-black uppercase tracking-widest">{a.name}</h4>
                  <span className="text-[9px] font-mono text-zinc-400">{a.req}</span>
                </div>
                <p className="text-[10px] text-zinc-500 uppercase leading-tight font-medium tracking-tight">{a.description}</p>
              </div>
              {a.earned && <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PilotProfile;

// Force recompile