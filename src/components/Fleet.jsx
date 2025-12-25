import React, { useState } from 'react';
import { useAppContext } from './AppContext';
import { Plane, CheckCircle, Clock, Wrench, AlertTriangle, Lock, ChevronDown, ChevronUp, Hammer } from 'lucide-react';

function Fleet() {
  const { fleet, repairAircraft, company } = useAppContext();
  const [expandedAircraft, setExpandedAircraft] = useState(null);

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'in-flight': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'out-of-service': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'available': return <CheckCircle className="w-5 h-5" />;
      case 'in-flight': return <Plane className="w-5 h-5" />;
      case 'maintenance': return <Wrench className="w-5 h-5" />;
      case 'out-of-service': return <AlertTriangle className="w-5 h-5" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  const getConditionColor = (condition) => {
    switch (condition) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'fair': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getProgressBarColor = (value) => {
    if (value > 80) return 'bg-green-600';
    if (value > 50) return 'bg-yellow-500';
    return 'bg-red-600';
  };

  const handleRepair = (aircraftId, type, itemData) => {
    const success = repairAircraft(aircraftId, type, itemData);
    if (success) {
      // Optional: Sound effect or toast
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Fleet Management</h2>
        <p className="text-gray-600">Manage your aircraft and track maintenance</p>
      </div>

      {/* Fleet Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Aircraft</p>
              <p className="text-3xl font-bold text-gray-900">{fleet.length}</p>
            </div>
            <Plane className="w-12 h-12 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Available</p>
              <p className="text-3xl font-bold text-green-600">
                {fleet.filter(a => a.status === 'available').length}
              </p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">In Flight</p>
              <p className="text-3xl font-bold text-blue-600">
                {fleet.filter(a => a.status === 'in-flight').length}
              </p>
            </div>
            <Plane className="w-12 h-12 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Maintenance</p>
              <p className="text-3xl font-bold text-yellow-600">
                {fleet.filter(a => a.status === 'maintenance').length}
              </p>
            </div>
            <Wrench className="w-12 h-12 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Aircraft List */}
      <div className="space-y-4">
        {fleet.map(plane => {
          const isExpanded = expandedAircraft === plane.id;

          return (
            <div key={plane.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-bold text-gray-900">{plane.registration}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 ${getStatusColor(plane.status)}`}>
                        {getStatusIcon(plane.status)}
                        {plane.status.toUpperCase().replace('-', ' ')}
                      </span>
                      {plane.lockedBy && (
                        <span className="px-3 py-1 rounded-full text-sm font-semibold bg-orange-100 text-orange-800 flex items-center gap-1">
                          <Lock className="w-4 h-4" />
                          LOCKED
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 font-medium">{plane.type}</p>
                  </div>

                  <div className="text-right">
                    <div className="flex flex-col items-end gap-2">
                      <div>
                        <p className="text-sm text-gray-600">Condition</p>
                        <p className={`text-lg font-bold capitalize ${getConditionColor(plane.condition)}`}>
                          {plane.condition}
                        </p>
                      </div>
                      <button
                        onClick={() => setExpandedAircraft(isExpanded ? null : plane.id)}
                        className="flex items-center gap-1 text-blue-600 font-semibold hover:text-blue-800"
                      >
                        {isExpanded ? 'Close Service Center' : 'Open Service Center'}
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Aircraft Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-600 uppercase font-semibold mb-1">Location</p>
                    <p className="font-semibold text-gray-900">{plane.location}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-600 uppercase font-semibold mb-1">Total Hours</p>
                    <p className="font-semibold text-gray-900">{plane.totalHours.toFixed(1)} hrs</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-600 uppercase font-semibold mb-1">Since Inspection</p>
                    <p className="font-semibold text-gray-900">{plane.hoursSinceInspection.toFixed(1)} hrs</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-600 uppercase font-semibold mb-1">Next Inspection</p>
                    <p className={`font-semibold ${plane.nextInspectionDue < 20 ? 'text-red-600' : 'text-gray-900'}`}>
                      {plane.nextInspectionDue.toFixed(1)} hrs
                    </p>
                  </div>
                </div>

                {/* Status Messages */}
                {plane.lockedBy && plane.status === 'in-flight' && (
                  <div className="bg-orange-50 border-l-4 border-orange-400 p-3 rounded mb-3">
                    <p className="text-sm font-semibold text-orange-900">🔒 Aircraft Locked</p>
                    <p className="text-sm text-orange-800">
                      This aircraft is currently assigned to an active flight and cannot be used until the flight is completed.
                    </p>
                  </div>
                )}

                {plane.maintenanceNotes && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
                    <p className="text-sm font-semibold text-yellow-900">🔧 Maintenance:</p>
                    <p className="text-sm text-yellow-800">{plane.maintenanceNotes}</p>
                  </div>
                )}
              </div>

              {/* Service Center (Expanded) */}
              {isExpanded && (
                <div className="bg-gray-50 border-t border-gray-200 p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Wrench className="w-6 h-6 text-blue-600" />
                    <h3 className="text-xl font-bold text-gray-900">Service Center</h3>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* MEL Items */}
                    <div className="bg-white rounded-lg shadow p-4">
                      <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-orange-500" />
                        Defect Checklist (MEL)
                      </h4>
                      {!plane.melList || plane.melList.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded border border-dashed">
                          <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                          <p>No defects reported. Aircraft is clean.</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {plane.melList.map((mel, idx) => (
                            <div key={idx} className="flex justify-between items-center p-3 bg-red-50 border border-red-100 rounded">
                              <div>
                                <p className="font-semibold text-red-900">{mel.item}</p>
                                <span className="text-xs px-2 py-0.5 rounded bg-red-200 text-red-800 uppercase font-bold">
                                  {mel.type}
                                </span>
                              </div>
                              <button
                                onClick={() => handleRepair(plane.id, 'MEL', mel)}
                                className="flex items-center gap-1 bg-white border border-green-600 text-green-700 hover:bg-green-50 px-3 py-1.5 rounded text-sm font-semibold transition"
                              >
                                <Hammer className="w-3 h-3" />
                                Fix (${mel.type === 'major' ? '2,000' : '500'})
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Component Health */}
                    <div className="bg-white rounded-lg shadow p-4">
                      <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-blue-500" />
                        Component Health
                      </h4>

                      {plane.conditionDetails ? (
                        <div className="space-y-6">
                          {Object.entries(plane.conditionDetails).map(([key, data]) => (
                            <div key={key}>
                              <div className="flex justify-between items-end mb-1">
                                <span className="capitalize font-semibold text-gray-700">{key}</span>
                                <span className={`text-sm font-bold ${getConditionColor(data.condition > 80 ? 'excellent' : data.condition > 50 ? 'fair' : 'poor')}`}>
                                  {data.condition}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                                <div
                                  className={`h-2.5 rounded-full ${getProgressBarColor(data.condition)}`}
                                  style={{ width: `${data.condition}%` }}
                                ></div>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex gap-2 justify-end">
                                {data.condition < 100 && (
                                  <>
                                    <button
                                      onClick={() => handleRepair(plane.id, 'COMPONENT', { component: key, action: 'repair' })}
                                      className="text-xs px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded border border-blue-200"
                                    >
                                      Repair (+20%)
                                    </button>
                                    <button
                                      onClick={() => handleRepair(plane.id, 'COMPONENT', { component: key, action: 'overhaul' })}
                                      className="text-xs px-2 py-1 bg-white text-gray-700 hover:bg-gray-50 rounded border border-gray-300"
                                    >
                                      Overhaul (Reset)
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 italic">Advanced condition data not available for this legacy aircraft.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  );
}

export default Fleet;