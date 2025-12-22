import React, { useState } from 'react';
import { Building2, Edit2, Save, X, Plane, Users, MapPin, Calendar } from 'lucide-react';
import airportsData from '../data/airports.json';

import { useAppContext } from './AppContext';

function Company() {
  const { company, updateCompany } = useAppContext();
  const [isEditing, setIsEditing] = useState(false);
  // Determine if company is set up based on name presence
  const hasCompany = !!company.name;

  // Format airports from JSON for dropdown display
  const europeanLocations = airportsData.map(
    airport => `${airport.name}, ${airport.country} (${airport.icao})`
  );

  const [editForm, setEditForm] = useState(company);

  const focusAreas = [
    { id: 'bush', name: 'Bush Operations', description: 'Remote and backcountry flying' },
    { id: 'cargo', name: 'Cargo Transport', description: 'Freight and logistics' },
    { id: 'passenger', name: 'Passenger Service', description: 'Regional air travel' },
    { id: 'charter', name: 'Charter Flights', description: 'On-demand aviation services' },
    { id: 'medical', name: 'Medical Transport', description: 'Emergency and medical flights' },
    { id: 'mixed', name: 'Mixed Operations', description: 'Diverse flight operations' }
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
      alert('Please fill in all required fields (Name, Callsign, Headquarters)');
    }
  };

  const handleInputChange = (field, value) => {
    setEditForm({
      ...editForm,
      [field]: value
    });
  };

  // If no company exists and not editing, show create form
  if (!hasCompany && !isEditing) {
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Company Profile</h2>
          <p className="text-gray-600">Create your virtual airline company</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 max-w-3xl mx-auto text-center">
          <Building2 className="w-24 h-24 text-blue-900 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Start Your Virtual Airline</h3>
          <p className="text-gray-600 mb-8 max-w-xl mx-auto">
            Start your own regional aviation company in Europe. Choose your company name,
            headquarters, and begin building your fleet and reputation.
          </p>
          <button
            onClick={() => setIsEditing(true)}
            className="bg-blue-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-800 transition text-lg"
          >
            Create Company
          </button>
        </div>
      </div>
    );
  }

  // Edit/Create Form
  if (isEditing) {
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {hasCompany ? 'Edit Company Profile' : 'Create Your Company'}
          </h2>
          <p className="text-gray-600">
            {hasCompany ? 'Update your company information' : 'Set up your virtual airline'}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
          <div className="space-y-6">
            {/* Company Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Company Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., Skyward Air"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Callsign */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Company Callsign <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={editForm.callsign}
                onChange={(e) => handleInputChange('callsign', e.target.value.toUpperCase())}
                placeholder="e.g., SKYWARD"
                maxLength="10"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
              />
              <p className="text-xs text-gray-500 mt-1">Used as radio callsign for flights</p>
            </div>

            {/* Headquarters */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Headquarters <span className="text-red-600">*</span>
              </label>
              <select
                value={editForm.headquarters}
                onChange={(e) => handleInputChange('headquarters', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a location</option>
                {europeanLocations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>

            {/* Focus Area */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Primary Focus
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {focusAreas.map(focus => (
                  <button
                    key={focus.id}
                    onClick={() => handleInputChange('focusArea', focus.id)}
                    className={`p-4 rounded-lg border-2 text-left transition ${editForm.focusArea === focus.id
                      ? 'border-blue-900 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <p className="font-semibold text-gray-900">{focus.name}</p>
                    <p className="text-sm text-gray-600">{focus.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Company Motto */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Company Motto
              </label>
              <input
                type="text"
                value={editForm.motto}
                onChange={(e) => handleInputChange('motto', e.target.value)}
                placeholder="e.g., Connecting Communities Since 2024"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Company Description
              </label>
              <textarea
                value={editForm.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Tell us about your company..."
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                onClick={handleSaveCompany}
                className="flex-1 bg-blue-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800 transition flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                {hasCompany ? 'Save Changes' : 'Create Company'}
              </button>
              {hasCompany && (
                <button
                  onClick={handleCancelEditing}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition flex items-center gap-2"
                >
                  <X className="w-5 h-5" />
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Display Company Profile
  return (
    <div>
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Company Profile</h2>
          <p className="text-gray-600">Your virtual airline information</p>
        </div>
        <button
          onClick={handleStartEditing}
          className="flex items-center gap-2 px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition"
        >
          <Edit2 className="w-4 h-4" />
          Edit Company
        </button>
      </div>

      {/* Company Header Card */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 rounded-lg shadow-lg p-8 mb-6 text-white">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-6">
            <div className="bg-white rounded-lg p-6">
              <Building2 className="w-16 h-16 text-blue-900" />
            </div>
            <div>
              <h3 className="text-4xl font-bold mb-2">{company.name}</h3>
              <p className="text-xl text-blue-100 mb-3">Callsign: {company.callsign}</p>
              {company.motto && (
                <p className="text-blue-200 italic">"{company.motto}"</p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-blue-600">
          <div>
            <p className="text-blue-200 text-sm mb-1">Headquarters</p>
            <p className="font-semibold flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {company.headquarters}
            </p>
          </div>
          <div>
            <p className="text-blue-200 text-sm mb-1">Established</p>
            <p className="font-semibold flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {new Date(company.established).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </p>
          </div>
          <div>
            <p className="text-blue-200 text-sm mb-1">Focus Area</p>
            <p className="font-semibold">
              {focusAreas.find(f => f.id === company.focusArea)?.name || 'Mixed Operations'}
            </p>
          </div>
          <div>
            <p className="text-blue-200 text-sm mb-1">Operations Type</p>
            <p className="font-semibold">
              {focusAreas.find(f => f.id === company.focusArea)?.description || 'Various'}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Pilots</p>
              <p className="text-3xl font-bold text-gray-900">{company.pilots}</p>
            </div>
            <Users className="w-12 h-12 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Fleet Size</p>
              <p className="text-3xl font-bold text-gray-900">{company.aircraft}</p>
            </div>
            <Plane className="w-12 h-12 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Flights</p>
              <p className="text-3xl font-bold text-gray-900">{company.totalFlights}</p>
            </div>
            <Plane className="w-12 h-12 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Company Age</p>
              <p className="text-3xl font-bold text-gray-900">
                {Math.floor((new Date() - new Date(company.established)) / (1000 * 60 * 60 * 24))} days
              </p>
            </div>
            <Calendar className="w-12 h-12 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Company Description */}
      {company.description && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">About Us</h3>
          <p className="text-gray-700 leading-relaxed">{company.description}</p>
        </div>
      )}

      {/* Company Achievements */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Company Milestones</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
            <span className="text-2xl">🎉</span>
            <div>
              <p className="font-semibold text-gray-900">Company Established</p>
              <p className="text-sm text-gray-600">
                {new Date(company.established).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg opacity-50">
            <span className="text-2xl">🏆</span>
            <div>
              <p className="font-semibold text-gray-900">First 10 Flights</p>
              <p className="text-sm text-gray-600">Complete 10 successful flights</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg opacity-50">
            <span className="text-2xl">✈️</span>
            <div>
              <p className="font-semibold text-gray-900">Fleet Builder</p>
              <p className="text-sm text-gray-600">Own 5 aircraft</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Company;

// Force recompile