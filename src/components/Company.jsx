import React, { useState } from 'react';
import { Building2, Edit2, Save, X, Plane, Users, MapPin, Calendar, ShieldCheck, Award } from 'lucide-react';
import airportsData from '../data/airports.json';
import { useAppContext } from './AppContext';
import Fleet from './Fleet';

function Company() {
  const { company, updateCompany } = useAppContext();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'fleet'

  const hasCompany = !!company.name;

  const europeanLocations = airportsData.map(
    airport => `${airport.name}, ${airport.country} (${airport.icao})`
  );

  const [editForm, setEditForm] = useState(company);

  const focusAreas = [
    { id: 'bush', name: 'Alaskan Bush', description: 'Rugged backcountry operations' },
    { id: 'cargo', name: 'Industrial Cargo', description: 'Heavy lift and logistics' },
    { id: 'passenger', name: 'Regional Connect', description: 'Northwestern air travel' },
    { id: 'charter', name: 'Executive Charter', description: 'High-end on-demand' },
  ];

  const handleStartEditing = () => {
    setEditForm(company);
    setIsEditing(true);
  };

  const handleCancelEditing = () => {
    setEditForm(company);
    setIsEditing(false);
  };

  const handleSaveCompany = () => {
    if (editForm.name && editForm.callsign && editForm.headquarters) {
      updateCompany(editForm);
      setIsEditing(false);
    } else {
      alert('REQUIRED FIELDS: Name, Callsign, Hub');
    }
  };

  const handleInputChange = (field, value) => {
    setEditForm({ ...editForm, [field]: value });
  };

  if (!hasCompany && !isEditing) {
    return (
      <div className="space-y-12 py-12">
        <div className="bg-white border-4 border-black p-16 max-w-4xl mx-auto shadow-[20px_20px_0px_0px_rgba(0,0,0,0.05)] text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 italic font-black text-8xl select-none uppercase pointer-events-none">Start</div>
          <Building2 className="w-24 h-24 text-black mx-auto mb-8" />
          <h3 className="text-4xl font-black text-black uppercase tracking-tighter mb-4 italic">Commission New Airframe Entity</h3>
          <p className="text-sm font-mono text-zinc-500 uppercase tracking-widest mb-12 max-w-xl mx-auto leading-relaxed">
            Begin industrial aviation operations in the Northwest. Establish your identity,
            secure your hub, and initiate fleet acquisition.
          </p>
          <button
            onClick={() => setIsEditing(true)}
            className="bg-black text-white px-12 py-4 font-black uppercase tracking-[0.2em] text-xs hover:bg-zinc-800 transition-all border-b-4 border-zinc-700 active:border-b-0 active:translate-y-1"
          >
            Create Company Entity
          </button>
        </div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="space-y-12">
        <div className="border-l-8 border-black pl-6 py-2">
          <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter italic">Entity Configuration</h2>
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-1">Modify core operational parameters for the airline entity.</p>
        </div>

        <div className="bg-white border border-zinc-200 p-12 max-w-5xl mx-auto space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Entity Name</label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="NORTHWESTERN AIRFRAMES"
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 text-xs font-black uppercase tracking-widest focus:bg-white focus:border-black transition-all outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Op Callsign</label>
              <input
                type="text"
                value={editForm.callsign}
                onChange={(e) => handleInputChange('callsign', e.target.value.toUpperCase())}
                placeholder="NORTHWEST"
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 text-xs font-black uppercase tracking-widest focus:bg-white focus:border-black transition-all outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Primary Hub (HQ)</label>
            <select
              value={editForm.headquarters}
              onChange={(e) => handleInputChange('headquarters', e.target.value)}
              className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 text-xs font-black uppercase tracking-widest focus:bg-white focus:border-black transition-all outline-none"
            >
              <option value="">SELECT HUB...</option>
              {europeanLocations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Operational Focus</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {focusAreas.map(focus => (
                <button
                  key={focus.id}
                  onClick={() => handleInputChange('focusArea', focus.id)}
                  className={`p-6 border-2 text-left transition-all ${editForm.focusArea === focus.id
                    ? 'border-black bg-zinc-50'
                    : 'border-zinc-100 opacity-50 hover:opacity-100 hover:border-zinc-300'
                    }`}
                >
                  <p className="text-[11px] font-black text-black uppercase tracking-widest">{focus.name}</p>
                  <p className="text-[10px] font-mono text-zinc-400 uppercase mt-1">{focus.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-6 pt-10 border-t border-zinc-100">
            <button
              onClick={handleSaveCompany}
              className="flex-1 bg-black text-white px-8 py-4 font-black uppercase tracking-[0.2em] text-xs hover:bg-zinc-800 transition-all"
            >
              Commit Entity Changes
            </button>
            <button
              onClick={handleCancelEditing}
              className="px-8 py-4 border-2 border-zinc-200 text-zinc-400 font-black uppercase tracking-[0.2em] text-xs hover:text-black hover:border-black transition-all"
            >
              Abort
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row gap-8 items-start justify-between border-b border-zinc-100 pb-10">
        <div className="flex gap-10">
          <button
            onClick={() => setActiveTab('profile')}
            className={`text-[11px] font-black uppercase tracking-[0.3em] transition-all relative pb-2 ${activeTab === 'profile' ? 'text-black' : 'text-zinc-300 hover:text-zinc-500'}`}
          >
            Corporate Intel
            {activeTab === 'profile' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-black"></div>}
          </button>
          <button
            onClick={() => setActiveTab('fleet')}
            className={`text-[11px] font-black uppercase tracking-[0.3em] transition-all relative pb-2 ${activeTab === 'fleet' ? 'text-black' : 'text-zinc-300 hover:text-zinc-500'}`}
          >
            Fleet Status
            {activeTab === 'fleet' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-black"></div>}
          </button>
        </div>
        {activeTab === 'profile' && (
          <button
            onClick={handleStartEditing}
            className="flex items-center gap-3 px-6 py-2 bg-zinc-50 border border-zinc-200 text-black hover:bg-black hover:text-white transition-all text-[10px] font-black uppercase tracking-widest"
          >
            <Edit2 className="w-3 h-3" />
            <span>Modify Ops</span>
          </button>
        )}
      </div>

      {activeTab === 'fleet' ? (
        <Fleet />
      ) : (
        <div className="space-y-12">
          {/* Company Header Card - Industrial */}
          <div className="bg-black text-white p-12 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 opacity-10 italic font-black text-9xl select-none uppercase pointer-events-none tracking-tighter group-hover:opacity-20 transition-opacity">Entity</div>
            <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
              <div className="p-8 bg-white text-black border-4 border-zinc-800">
                <Building2 className="w-16 h-16" />
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-5xl font-black uppercase tracking-tighter italic mb-2 leading-none">{company.name}</h3>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-6">
                  <span className="text-[10px] font-mono tracking-[0.2em] text-zinc-500 uppercase border border-zinc-800 px-3 py-1">Callsign: {company.callsign}</span>
                  <span className="text-[10px] font-mono tracking-[0.2em] text-emerald-500 uppercase bg-emerald-500/10 px-3 py-1 border border-emerald-500/20">Operational Clear</span>
                </div>
                {company.motto && (
                  <p className="text-sm font-mono text-zinc-400 italic">"// {company.motto}"</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mt-12 pt-12 border-t border-zinc-800 relative z-10">
              <div className="space-y-1">
                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Logistics Hub</p>
                <p className="text-xs font-black uppercase flex items-center gap-2">
                  <MapPin className="w-3 h-3 text-emerald-500" /> {company.headquarters}
                </p>
              </div>
              <div className="space-y-1 text-right md:text-left">
                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">EST Registry</p>
                <p className="text-xs font-black uppercase flex items-center justify-end md:justify-start gap-2">
                  <Calendar className="w-3 h-3" /> {new Date(company.established).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Strategic Focus</p>
                <p className="text-xs font-black uppercase">{focusAreas.find(f => f.id === company.focusArea)?.name || 'Mixed Operations'}</p>
              </div>
              <div className="space-y-1 text-right md:text-left">
                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Security Clearance</p>
                <p className="text-xs font-black uppercase flex items-center justify-end md:justify-start gap-2">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" /> Level 4 Alpha
                </p>
              </div>
            </div>
          </div>

          {/* Stats Grid - Industrial */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-px bg-zinc-200 border border-zinc-200 shadow-sm overflow-hidden">
            {[
              { label: 'Aircrew Pool', val: company.pilots, icon: Users, color: 'text-zinc-400' },
              { label: 'Active Fleet', val: company.aircraft, icon: Plane, color: 'text-zinc-400' },
              { label: 'Total Sorties', val: company.totalFlights, icon: Award, color: 'text-zinc-400' },
              { label: 'Entity Age', val: `${Math.floor((new Date() - new Date(company.established)) / (1000 * 60 * 60 * 24))} D`, icon: Calendar, color: 'text-zinc-400' }
            ].map((stat, i) => (
              <div key={i} className="bg-white p-8 group hover:bg-zinc-50 transition-colors">
                <p className="text-[10px] font-mono tracking-[0.2em] text-zinc-400 uppercase mb-4">{stat.label}</p>
                <div className="flex items-end justify-between">
                  <p className="text-4xl font-black text-black leading-none">{stat.val}</p>
                  <stat.icon className={`w-8 h-8 ${stat.color} group-hover:text-black transition-colors`} />
                </div>
              </div>
            ))}
          </div>

          {/* About Section - Industrial */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center gap-4">
                <h3 className="text-sm font-black uppercase tracking-[0.3em] text-slate-400">Corporate Mandate</h3>
                <div className="flex-1 h-px bg-zinc-100"></div>
              </div>
              <div className="bg-white border border-zinc-100 p-8 leading-relaxed italic text-zinc-600 font-medium">
                {company.description || "The corporate mandate for Northwestern Airframes follows strict operational guidelines for regional air logistics."}
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <h3 className="text-sm font-black uppercase tracking-[0.3em] text-slate-400">Entity Status</h3>
                <div className="flex-1 h-px bg-zinc-100"></div>
              </div>
              <div className="bg-zinc-50 border border-zinc-100 p-8 space-y-6">
                <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-widest text-zinc-400">
                  <span>Market Index</span>
                  <span className="text-emerald-500">+12.4%</span>
                </div>
                <div className="h-0.5 bg-zinc-100"></div>
                <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-widest text-zinc-400">
                  <span>Risk Factor</span>
                  <span className="text-zinc-900">Nominal 0.02</span>
                </div>
                <div className="h-0.5 bg-zinc-100"></div>
                <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-widest text-zinc-400">
                  <span>Op Priority</span>
                  <span className="text-zinc-900">Alpha 1</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Company;