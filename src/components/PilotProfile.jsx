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
      <div className="max-w-md mx-auto py-20 text-center">
        <div className="inline-flex p-4 bg-gray-800 rounded-full mb-6">
          <User className="w-12 h-12 text-blue-500" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-4">Initialize Pilot</h2>
        <p className="text-gray-400 mb-8">
          No active pilot profile detected. Please create your profile to begin.
        </p>
        <button
          onClick={() => setIsEditing(true)}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-500 transition-colors"
        >
          Create Profile
        </button>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white">Edit Profile</h2>
          <p className="text-gray-400 mt-1">Update your pilot information</p>
        </div>

        <div className="bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-700">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Callsign</label>
                <input
                  type="text"
                  value={editForm.callsign}
                  onChange={(e) => setEditForm({ ...editForm, callsign: e.target.value.toUpperCase() })}
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white uppercase focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">License Type</label>
                <select
                  value={editForm.license}
                  onChange={(e) => setEditForm({ ...editForm, license: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                >
                  <option value="">Select License</option>
                  {licenseTypes.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                onClick={handleSavePilot}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-500 transition-colors"
              >
                Save Changes
              </button>
              {hasPilot && (
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-8 bg-gray-700 text-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-center pb-6 border-b border-gray-700">
        <div>
          <h2 className="text-3xl font-bold text-white">Pilot Profile</h2>
          <p className="text-gray-400 mt-1">Personnel Record: {pilot.callsign}</p>
        </div>
        <button
          onClick={() => setIsEditing(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors border border-gray-700"
        >
          <Edit2 className="w-4 h-4" /> Edit Profile
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Card */}
        <div className="lg:col-span-2 bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-700">
          <div className="flex items-center gap-6 mb-8">
            <div className="bg-gray-700 p-6 rounded-full">
              <User className="w-12 h-12 text-blue-400" />
            </div>
            <div>
              <span className="inline-block bg-blue-900/50 text-blue-300 px-3 py-1 rounded-full text-xs font-semibold mb-2">
                {pilot.rank}
              </span>
              <h1 className="text-4xl font-bold text-white mb-2">{pilot.name}</h1>
              <div className="flex gap-6 text-sm text-gray-400">
                <span className="flex items-center gap-2"><Hash className="w-4 h-4" /> {pilot.callsign}</span>
                <span className="flex items-center gap-2"><Award className="w-4 h-4" /> {licenseTypes.find(l => l.id === pilot.license)?.name || 'N/A'}</span>
                <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> Since {new Date(pilot.joinDate).getFullYear()}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400 font-medium">Experience Progress</span>
              <span className="text-white font-bold">{pilot.experience} / {pilot.nextRankXP} XP</span>
            </div>
            <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-1000"
                style={{ width: `${getRankProgress()}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Sidebar Stats */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700 flex flex-col justify-center space-y-6">
          <div>
            <p className="text-sm font-medium text-gray-400 mb-1">Safety Rating</p>
            <p className="text-4xl font-bold text-white">{pilot.safetyRating}%</p>
            <div className="w-full h-1.5 bg-gray-700 mt-2 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pilot.safetyRating}%` }}></div>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-400 mb-1">On-Time Performance</p>
            <p className="text-4xl font-bold text-white">{pilot.onTimePercentage}%</p>
            <div className="w-full h-1.5 bg-gray-700 mt-2 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pilot.onTimePercentage}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-sm">
            <div className="flex items-center gap-3 mb-2 text-gray-400">
              <stat.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Achievements */}
      <div>
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" /> Achievements
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map((a, i) => (
            <div key={i} className={`p-4 rounded-xl border flex gap-4 items-center transition-all ${a.earned ? 'bg-gray-800 border-gray-700' : 'bg-gray-900/50 border-gray-800 opacity-50'}`}>
              <div className={`p-3 rounded-lg ${a.earned ? 'bg-blue-600/20 text-blue-400' : 'bg-gray-800 text-gray-600'}`}>
                {a.icon}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-bold text-white">{a.name}</h4>
                  <span className="text-xs font-mono text-gray-500">{a.req}</span>
                </div>
                <p className="text-sm text-gray-400">{a.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PilotProfile;

// Force recompile