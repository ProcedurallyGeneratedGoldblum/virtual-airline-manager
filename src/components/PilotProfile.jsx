import React, { useState } from 'react';
import { User, Award, TrendingUp, Clock, Plane, MapPin, Star, Trophy, Edit2, Save, X } from 'lucide-react';

function PilotProfile() {
  const [hasPilot, setHasPilot] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Pilot data - starts at zero
  const [pilot, setPilot] = useState({
    name: '',
    callsign: '',
    rank: 'Junior Pilot',
    license: '',
    joinDate: new Date().toISOString().split('T')[0],
    totalFlights: 0,
    totalHours: 0,
    totalDistance: 0,
    totalEarnings: 0,
    rating: 0,
    onTimePercentage: 0,
    safetyRating: 100,
    experience: 0,
    nextRankXP: 1000,
  });

  const [editForm, setEditForm] = useState(pilot);

  const licenseTypes = [
    { id: 'ppl', name: 'Private Pilot License (PPL)' },
    { id: 'cpl', name: 'Commercial Pilot License (CPL)' },
    { id: 'atpl', name: 'Airline Transport Pilot License (ATPL)' },
    { id: 'spl', name: 'Student Pilot License (SPL)' },
  ];

  const stats = [
    { label: 'Total Flights', value: pilot.totalFlights, icon: Plane, color: 'text-blue-600' },
    { label: 'Flight Hours', value: `${pilot.totalHours}h`, icon: Clock, color: 'text-green-600' },
    { label: 'Distance Flown', value: `${pilot.totalDistance.toLocaleString()} nm`, icon: MapPin, color: 'text-purple-600' },
    { label: 'Total Earnings', value: `$${pilot.totalEarnings.toLocaleString()}`, icon: TrendingUp, color: 'text-yellow-600' },
  ];

  const achievements = [
    { 
      name: 'First Flight', 
      description: 'Complete your first flight', 
      icon: '🛫', 
      earned: false,
      requirement: 'Complete 1 flight'
    },
    { 
      name: 'Getting Started', 
      description: 'Complete 10 flights', 
      icon: '✈️', 
      earned: false,
      requirement: 'Complete 10 flights'
    },
    { 
      name: 'Century Club', 
      description: 'Complete 100 flights', 
      icon: '💯', 
      earned: false,
      requirement: 'Complete 100 flights'
    },
    { 
      name: 'Bush Pilot', 
      description: 'Complete your first bush flight', 
      icon: '🏔️', 
      earned: false,
      requirement: 'Complete 1 backcountry flight'
    },
    { 
      name: 'Night Owl', 
      description: 'Complete 25 night flights', 
      icon: '🌙', 
      earned: false,
      requirement: 'Complete 25 night flights'
    },
    { 
      name: 'Weather Warrior', 
      description: 'Complete 10 IFR flights', 
      icon: '⛈️', 
      earned: false,
      requirement: 'Complete 10 IFR flights'
    },
  ];

  const handleStartEditing = () => {
    setEditForm(pilot);
    setIsEditing(true);
  };

  const handleCancelEditing = () => {
    setEditForm(pilot);
    setIsEditing(false);
  };

  const handleSavePilot = () => {
    if (editForm.name && editForm.callsign && editForm.license) {
      setPilot(editForm);
      setHasPilot(true);
      setIsEditing(false);
    } else {
      alert('Please fill in all required fields (Name, Callsign, License Type)');
    }
  };

  const handleInputChange = (field, value) => {
    setEditForm({
      ...editForm,
      [field]: value
    });
  };

  const getRankProgress = () => {
    return Math.round((pilot.experience / pilot.nextRankXP) * 100);
  };

  // If no pilot exists and not editing, show create form
  if (!hasPilot && !isEditing) {
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Pilot Profile</h2>
          <p className="text-gray-600">Create your virtual pilot profile</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 max-w-3xl mx-auto text-center">
          <User className="w-24 h-24 text-blue-900 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Create Your Pilot Profile</h3>
          <p className="text-gray-600 mb-8 max-w-xl mx-auto">
            Set up your pilot information to start tracking your flying career. 
            Build experience, earn achievements, and advance your rank.
          </p>
          <button
            onClick={() => setIsEditing(true)}
            className="bg-blue-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-800 transition text-lg"
          >
            Create Pilot Profile
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
            {hasPilot ? 'Edit Pilot Profile' : 'Create Pilot Profile'}
          </h2>
          <p className="text-gray-600">
            {hasPilot ? 'Update your pilot information' : 'Set up your virtual pilot'}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
          <div className="space-y-6">
            {/* Pilot Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., John Anderson"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Callsign */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Personal Callsign <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={editForm.callsign}
                onChange={(e) => handleInputChange('callsign', e.target.value.toUpperCase())}
                placeholder="e.g., EAGLE1"
                maxLength="10"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
              />
              <p className="text-xs text-gray-500 mt-1">Your unique pilot identifier</p>
            </div>

            {/* License Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                License Type <span className="text-red-600">*</span>
              </label>
              <select
                value={editForm.license}
                onChange={(e) => handleInputChange('license', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select your license type</option>
                {licenseTypes.map(license => (
                  <option key={license.id} value={license.id}>{license.name}</option>
                ))}
              </select>
            </div>

            {/* Starting Rank - Display Only */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Starting Rank
              </label>
              <div className="px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg">
                <p className="font-semibold text-gray-900">Junior Pilot</p>
                <p className="text-sm text-gray-600">Advance your rank by completing flights and earning experience</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                onClick={handleSavePilot}
                className="flex-1 bg-blue-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800 transition flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                {hasPilot ? 'Save Changes' : 'Create Pilot'}
              </button>
              {hasPilot && (
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

  // Display Pilot Profile
  return (
    <div>
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Pilot Profile</h2>
          <p className="text-gray-600">Your flying career and achievements</p>
        </div>
        <button
          onClick={handleStartEditing}
          className="flex items-center gap-2 px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition"
        >
          <Edit2 className="w-4 h-4" />
          Edit Profile
        </button>
      </div>

      {/* Profile Header Card */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 rounded-lg shadow-lg p-8 mb-6 text-white">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="bg-white rounded-full p-6">
              <User className="w-20 h-20 text-blue-900" />
            </div>
            
            {/* Pilot Info */}
            <div>
              <h3 className="text-3xl font-bold mb-2">{pilot.name}</h3>
              <div className="flex items-center gap-4 text-blue-100 mb-3">
                <span className="flex items-center gap-1">
                  <Award className="w-4 h-4" />
                  {pilot.rank}
                </span>
                <span>•</span>
                <span>Callsign: {pilot.callsign}</span>
                <span>•</span>
                <span>License: {licenseTypes.find(l => l.id === pilot.license)?.name}</span>
              </div>
              <div className="flex items-center gap-2">
                {pilot.rating > 0 ? (
                  <>
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <span className="text-xl font-semibold">{pilot.rating}</span>
                    <span className="text-blue-200">/ 5.0 Rating</span>
                  </>
                ) : (
                  <span className="text-blue-200">Complete flights to earn a rating</span>
                )}
              </div>
            </div>
          </div>

          {/* Join Date */}
          <div className="text-right">
            <p className="text-blue-200 text-sm">Member Since</p>
            <p className="text-xl font-semibold">
              {new Date(pilot.joinDate).toLocaleDateString('en-US', { 
                month: 'short', 
                year: 'numeric' 
              })}
            </p>
          </div>
        </div>

        {/* Experience Progress */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold">Experience Progress</span>
            <span className="text-sm">{pilot.experience} / {pilot.nextRankXP} XP</span>
          </div>
          <div className="w-full bg-blue-800 rounded-full h-3">
            <div 
              className="bg-yellow-400 h-3 rounded-full transition-all duration-500"
              style={{ width: `${getRankProgress()}%` }}
            ></div>
          </div>
          <p className="text-xs text-blue-200 mt-1">
            {pilot.nextRankXP - pilot.experience} XP until next rank
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <Icon className={`w-12 h-12 ${stat.color}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Performance Metrics */}
      {pilot.totalFlights > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">On-Time Performance</h3>
            <div className="flex items-center justify-center">
              <div className="relative w-32 h-32">
                <svg className="transform -rotate-90 w-32 h-32">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    className="text-gray-200"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 56}`}
                    strokeDashoffset={`${2 * Math.PI * 56 * (1 - pilot.onTimePercentage / 100)}`}
                    className="text-blue-600"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold text-gray-900">{pilot.onTimePercentage}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Safety Rating</h3>
            <div className="flex items-center justify-center">
              <div className="relative w-32 h-32">
                <svg className="transform -rotate-90 w-32 h-32">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    className="text-gray-200"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 56}`}
                    strokeDashoffset={`${2 * Math.PI * 56 * (1 - pilot.safetyRating / 100)}`}
                    className="text-green-600"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold text-gray-900">{pilot.safetyRating}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Overall Rating</h3>
            <div className="flex flex-col items-center justify-center h-32">
              <div className="flex gap-1 mb-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star
                    key={star}
                    className={`w-8 h-8 ${
                      star <= Math.floor(pilot.rating)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-4xl font-bold text-gray-900">{pilot.rating}</p>
              <p className="text-sm text-gray-600">out of 5.0</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-8 mb-8 text-center">
          <Plane className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to Start Flying?</h3>
          <p className="text-gray-600 mb-4">
            Complete your first flight to start tracking your performance metrics and earning achievements!
          </p>
          <button 
            onClick={() => window.location.hash = '#dispatch'}
            className="bg-blue-900 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-800 transition"
          >
            Go to Dispatch Center
          </button>
        </div>
      )}

      {/* Achievements Section */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-2 mb-6">
          <Trophy className="w-6 h-6 text-yellow-600" />
          <h3 className="text-xl font-bold text-gray-900">Achievements</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((achievement, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-2 transition ${
                achievement.earned
                  ? 'border-yellow-400 bg-yellow-50'
                  : 'border-gray-200 bg-gray-50 opacity-60'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-4xl">{achievement.icon}</span>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 mb-1">{achievement.name}</h4>
                  <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                  <span className="text-xs text-gray-500 font-semibold">
                    {achievement.requirement}
                  </span>
                </div>
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