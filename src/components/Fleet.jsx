import React from 'react';
import { useAppContext } from './AppContext';
import { Plane, CheckCircle, Clock, Wrench, AlertTriangle, Lock } from 'lucide-react';

function Fleet() {
  const { fleet } = useAppContext();

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
        {fleet.map(plane => (
          <div key={plane.id} className="bg-white rounded-lg shadow-lg p-6">
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
                <p className="text-sm text-gray-600">Condition</p>
                <p className={`text-lg font-bold capitalize ${getConditionColor(plane.condition)}`}>
                  {plane.condition}
                </p>
                {/* Detailed Condition */}
                {plane.conditionDetails && (
                  <div className="text-xs mt-1 space-y-1">
                    <div className="flex justify-between gap-2">
                      <span>Eng:</span>
                      <span className={plane.conditionDetails.engine.condition > 80 ? 'text-green-600' : 'text-orange-600'}>
                        {plane.conditionDetails.engine.condition}%
                      </span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span>Avionics:</span>
                      <span>{plane.conditionDetails.avionics.condition}%</span>
                    </div>
                  </div>
                )}
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

            {/* Locked Status */}
            {plane.lockedBy && plane.status === 'in-flight' && (
              <div className="bg-orange-50 border-l-4 border-orange-400 p-3 rounded mb-3">
                <p className="text-sm font-semibold text-orange-900">🔒 Aircraft Locked</p>
                <p className="text-sm text-orange-800">
                  This aircraft is currently assigned to an active flight and cannot be used until the flight is completed.
                </p>
              </div>
            )}

            {/* Maintenance Notes */}
            {plane.maintenanceNotes && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
                <p className="text-sm font-semibold text-yellow-900">🔧 Maintenance:</p>
                <p className="text-sm text-yellow-800">{plane.maintenanceNotes}</p>
              </div>
            )}

            {/* Inspection Warning */}
            {plane.nextInspectionDue < 20 && plane.status !== 'maintenance' && (
              <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded mt-3">
                <p className="text-sm font-semibold text-red-900">⚠️ Inspection Due Soon</p>
                <p className="text-sm text-red-800">
                  This aircraft requires inspection within {plane.nextInspectionDue.toFixed(1)} hours
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Fleet;