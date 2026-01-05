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
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex p-4 bg-gray-800 rounded-full mb-6">
            <Building2 className="w-12 h-12 text-blue-500" />
          </div>
          <h3 className="text-3xl font-bold text-white mb-4">Initialize Airline</h3>
          <p className="text-gray-400 mb-8 leading-relaxed">
            Begin your aviation operations. Establish your identity, secure your hub, and initiate fleet acquisition.
          </p>
          <button
            onClick={() => setIsEditing(true)}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-500 transition-colors"
          >
            Create Company
          </button>
        </div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white">Company Configuration</h2>
          <p className="text-gray-400 mt-1">Modify core operational parameters for your airline.</p>
        </div>

        <div className="bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-700 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Airline Name</label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="My Airline"
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Callsign</label>
              <input
                type="text"
                value={editForm.callsign}
                onChange={(e) => handleInputChange('callsign', e.target.value.toUpperCase())}
                placeholder="AIRLINE"
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white uppercase focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Primary Hub (HQ)</label>
            <select
              value={editForm.headquarters}
              onChange={(e) => handleInputChange('headquarters', e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
            >
              <option value="">Select Hub...</option>
              {europeanLocations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-400 mb-2">Operational Focus</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {focusAreas.map(focus => (
                <button
                  key={focus.id}
                  onClick={() => handleInputChange('focusArea', focus.id)}
                  className={`p-4 rounded-xl text-left border transition-all ${editForm.focusArea === focus.id
                    ? 'bg-blue-600/20 border-blue-500 ring-1 ring-blue-500'
                    : 'bg-gray-900 border-gray-700 hover:border-gray-500'
                    }`}
                >
                  <p className={`font-bold ${editForm.focusArea === focus.id ? 'text-blue-400' : 'text-gray-300'}`}>{focus.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{focus.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-gray-700">
            <button
              onClick={handleSaveCompany}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-500 transition-colors"
            >
              Save Changes
            </button>
            <button
              onClick={handleCancelEditing}
              className="px-8 bg-gray-700 text-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row gap-8 items-start justify-between border-b border-gray-700 pb-6">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'profile' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'}`}
          >
            Company Profile
          </button>
          <button
            onClick={() => setActiveTab('fleet')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'fleet' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'}`}
          >
            Fleet Management
          </button>
        </div>
        {activeTab === 'profile' && (
          <button
            onClick={handleStartEditing}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors border border-gray-700 font-medium text-sm"
          >
            <Edit2 className="w-4 h-4" />
            <span>Edit Company</span>
          </button>
        )}
      </div>

      {activeTab === 'fleet' ? (
        <Fleet />
      ) : (
        <div className="space-y-8">
          {/* Company Header Card */}
          <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 shadow-lg">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="p-6 bg-gray-700 rounded-full">
                <Building2 className="w-12 h-12 text-blue-400" />
              </div>
              <div className="text-center md:text-left flex-1">
                <h3 className="text-4xl font-bold text-white mb-2">{company.name}</h3>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900/50 text-blue-200 border border-blue-800">
                    Callsign: {company.callsign}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-900/50 text-emerald-200 border border-emerald-800">
                    Operational
                  </span>
                </div>
                {company.motto && (
                  <p className="text-gray-400 italic">"{company.motto}"</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-8 pt-8 border-t border-gray-700">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase mb-1">Headquarters</p>
                <p className="text-sm font-bold text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-500" /> {company.headquarters}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase mb-1">Established</p>
                <p className="text-sm font-bold text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-500" /> {new Date(company.established).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase mb-1">Focus</p>
                <p className="text-sm font-bold text-white">{focusAreas.find(f => f.id === company.focusArea)?.name || 'General Operations'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase mb-1">Security Level</p>
                <p className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-purple-500" /> Level 4
                </p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: 'Pilots', val: company.pilots, icon: Users, color: 'text-blue-500' },
              { label: 'Aircraft', val: company.aircraft, icon: Plane, color: 'text-emerald-500' },
              { label: 'Total Flights', val: company.totalFlights, icon: Award, color: 'text-yellow-500' },
              { label: 'Days Active', val: `${Math.floor((new Date() - new Date(company.established)) / (1000 * 60 * 60 * 24))}`, icon: Calendar, color: 'text-purple-500' }
            ].map((stat, i) => (
              <div key={i} className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  <span className="text-sm font-medium text-gray-400">{stat.label}</span>
                </div>
                <p className="text-2xl font-bold text-white">{stat.val}</p>
              </div>
            ))}
          </div>

          {/* Info Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-xl font-bold text-white">About</h3>
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 text-gray-300 leading-relaxed">
                {company.description || "The corporate mandate for this airline follows strict operational guidelines for regional air logistics."}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white">Status</h3>
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Market Index</span>
                  <span className="text-emerald-400 font-bold">+12.4%</span>
                </div>
                <div className="h-px bg-gray-700"></div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Risk Factor</span>
                  <span className="text-white font-bold">Low</span>
                </div>
                <div className="h-px bg-gray-700"></div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Priority</span>
                  <span className="text-white font-bold">High</span>
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