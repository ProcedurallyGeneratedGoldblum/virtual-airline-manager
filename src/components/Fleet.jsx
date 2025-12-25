import React, { useState } from 'react';
import { useAppContext } from './AppContext';
// import { Plane, CheckCircle, Clock, Wrench, AlertTriangle, Lock, ChevronDown, ChevronUp } from 'lucide-react';

function Fleet() {
  const { fleet } = useAppContext();
  const [expandedAircraft, setExpandedAircraft] = useState(null);

  if (!fleet) return <div>Loading Fleet Data...</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Fleet Debug View</h2>
      <p className="mb-4">If you can see this, the Fleet component is mounting correctly.</p>

      <div className="space-y-4">
        {fleet.map(plane => (
          <div key={plane.id} className="border p-4 rounded shadow bg-white">
            <h3 className="font-bold text-lg">{plane.registration}</h3>
            <p>Type: {plane.type}</p>
            <p>Status: {plane.status}</p>
            <p>Condition: {plane.condition}</p>
            {/* Condition Details Debug */}
            {plane.conditionDetails && (
              <div className="mt-2 text-sm bg-gray-100 p-2">
                Has Detailed Condition Data: Yes
              </div>
            )}
            {!plane.conditionDetails && (
              <div className="mt-2 text-sm text-gray-500">
                Legacy Aircraft (No details)
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Fleet;