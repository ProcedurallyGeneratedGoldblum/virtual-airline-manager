import React, { useState } from 'react';
import { useAppContext } from './AppContext';
import {
  Settings,
  AlertCircle,
  CheckCircle2,
  ArrowUpCircle,
  Clock,
  Wrench,
  Info,
  ChevronDown,
  ChevronUp,
  DollarSign,
  MapPin,
  Calendar
} from 'lucide-react';

function Fleet() {
  const { fleet, repairAircraft, company } = useAppContext();
  const [expandedAircraft, setExpandedAircraft] = useState(null);

  if (!fleet || !Array.isArray(fleet)) {
    return (
      <div className="p-8 text-center bg-slate-800 rounded-xl border border-slate-700">
        <AlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-200">Fleet Data Unavailable</h2>
        <p className="text-slate-400">No aircraft found in your fleet.</p>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'in-flight': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'maintenance': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'out-of-service': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'available': return <CheckCircle2 className="w-4 h-4" />;
      case 'in-flight': return <ArrowUpCircle className="w-4 h-4" />;
      case 'maintenance': return <Settings className="w-4 h-4" />;
      case 'out-of-service': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getConditionColor = (value) => {
    if (value > 80) return 'text-emerald-400';
    if (value > 50) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getProgressBarColor = (value) => {
    if (value > 80) return 'bg-emerald-500';
    if (value > 50) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-700 pb-6">
        <div>
          <h2 className="text-3xl font-bold text-white">Fleet Management</h2>
          <p className="text-gray-400 mt-1">Monitor aircraft health and maintenance</p>
        </div>

        <div className="bg-gray-800 px-4 py-2 rounded-lg border border-gray-700 flex items-center gap-3 shadow-sm">
          <div className="bg-emerald-900/30 p-2 rounded-md">
            <DollarSign className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase">Balance</p>
            <p className="text-lg font-bold text-emerald-500 leading-none">{formatCurrency(company?.balance || 0)}</p>
          </div>
        </div>
      </div>

      {/* Fleet Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Aircraft', value: fleet.length, icon: <ArrowUpCircle />, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Available', value: fleet.filter(a => a.status === 'available').length, icon: <CheckCircle2 />, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'In Flight', value: fleet.filter(a => a.status === 'in-flight').length, icon: <ArrowUpCircle />, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
          { label: 'Maintenance', value: fleet.filter(a => a.status === 'maintenance' || a.status === 'out-of-service').length, icon: <Settings />, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        ].map((stat, i) => (
          <div key={i} className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
              </div>
              <div className={`${stat.bg} ${stat.color} p-3 rounded-lg`}>
                {React.cloneElement(stat.icon, { className: 'w-6 h-6' })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Aircraft List */}
      <div className="grid grid-cols-1 gap-6">
        {fleet.map(plane => (
          <AircraftFleetCard
            key={plane.id}
            plane={plane}
            isExpanded={expandedAircraft === plane.id}
            onToggle={() => setExpandedAircraft(expandedAircraft === plane.id ? null : plane.id)}
            repairAircraft={repairAircraft}
            formatCurrency={formatCurrency}
            getStatusColor={getStatusColor}
            getStatusIcon={getStatusIcon}
            getConditionColor={getConditionColor}
            getProgressBarColor={getProgressBarColor}
          />
        ))}

        {fleet.length === 0 && (
          <div className="py-12 text-center bg-gray-800 rounded-xl border border-dashed border-gray-700">
            <div className="bg-gray-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <ArrowUpCircle className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className="text-xl font-bold text-white">Your Fleet is Empty</h3>
            <p className="text-gray-500 mt-2">Visit the Marketplace to acquire your first aircraft.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function AircraftFleetCard({
  plane,
  isExpanded,
  onToggle,
  repairAircraft,
  formatCurrency,
  getStatusColor,
  getStatusIcon,
  getConditionColor,
  getProgressBarColor
}) {
  // HELPER: Robust property access for mixed camelCase/snake_case/nested data
  const getProp = (obj, paths, fallback = 0) => {
    for (const path of paths) {
      const parts = path.split('.');
      let val = obj;
      for (const part of parts) {
        val = val ? val[part] : undefined;
      }
      if (val !== undefined && val !== null) return val;
    }
    return fallback;
  };

  const ttaf = getProp(plane, ['conditionDetails.airframe.ttaf', 'total_hours', 'totalHours', 'hours'], 0);
  const smoh = getProp(plane, ['conditionDetails.engine.smoh', 'engine_smoh', 'smoh'], 0);
  const engineTbo = getProp(plane, ['conditionDetails.engine.tbo', 'engine_tbo', 'tbo'], 2000);

  // Component conditions
  const engineCond = getProp(plane, ['conditionDetails.engine.condition', 'engine_condition', 'engineCondition'], 100);
  const airframeCond = getProp(plane, ['conditionDetails.airframe.condition', 'condition', 'airframeCondition'], 100);
  const avionicsCond = getProp(plane, ['conditionDetails.avionics.condition', 'avionics_condition', 'avionicsCondition'], 100);
  const interiorCond = getProp(plane, ['conditionDetails.interior.condition', 'interior_condition', 'interiorCondition'], 100);

  return (
    <div className={`bg-gray-800 rounded-xl overflow-hidden transition-all duration-300 border ${isExpanded ? 'border-blue-500 ring-1 ring-blue-500 shadow-lg' : 'border-gray-700 hover:border-gray-600 shadow-sm'}`}>
      <div className="p-6">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Image & Main Info Area */}
          <div className="flex-1 flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-48 h-32 bg-gray-700 rounded-lg overflow-hidden relative flex-shrink-0 border border-gray-600">
              {plane.image && plane.image.startsWith('/') ? (
                <img src={plane.image} alt={plane.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  <span className="text-4xl">{plane.image || '✈️'}</span>
                </div>
              )}
              <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-xs font-bold text-white">
                {plane.registration || 'N/A'}
              </div>
            </div>

            <div className="flex-grow">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h3 className="text-xl font-bold text-white">{plane.name}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${getStatusColor(plane.status)}`}>
                  {getStatusIcon(plane.status)}
                  {plane.status.replace('-', ' ')}
                </span>
                {plane.melList && plane.melList.length > 0 && (
                  <span className="bg-rose-900/30 text-rose-400 border border-rose-800 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {plane.melList.length} Issues
                  </span>
                )}
              </div>

              <p className="text-gray-400 text-sm mb-4 flex items-center gap-2">
                <span className="bg-gray-700 px-2 py-0.5 rounded text-gray-300">{plane.manufacturer}</span>
                <span>•</span>
                <span>S/N: {plane.serialNumber || 'N/A'}</span>
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700/50">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Location</p>
                  <p className="text-sm font-medium text-gray-200">{plane.location.split(',')[0]}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">TTAF</p>
                  <p className="text-sm font-medium text-gray-200">{ttaf.toLocaleString()} hrs</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Eng SMOH</p>
                  <p className={`text-sm font-medium ${smoh > engineTbo * 0.9 ? 'text-rose-400' : 'text-gray-200'}`}>
                    {Math.floor(smoh).toLocaleString()} hrs
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Next Insp</p>
                  <p className={`text-sm font-medium ${plane.nextInspectionDue < 10 ? 'text-rose-400' : 'text-gray-200'}`}>
                    {plane.nextInspectionDue?.toFixed(1) || 0} hrs
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Health Metrics */}
          <div className="lg:w-64 flex flex-col justify-between lg:border-l lg:border-gray-700 lg:pl-6">
            <div className="space-y-4">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Health Status</p>
              <HealthBar label="Engine" value={engineCond} getProgressBarColor={getProgressBarColor} getConditionColor={getConditionColor} />
              <HealthBar label="Avionics" value={avionicsCond} getProgressBarColor={getProgressBarColor} getConditionColor={getConditionColor} />
              <HealthBar label="Airframe" value={airframeCond} getProgressBarColor={getProgressBarColor} getConditionColor={getConditionColor} />
            </div>

            <button
              onClick={onToggle}
              className={`mt-6 w-full py-2.5 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2 ${isExpanded ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-blue-600 text-white hover:bg-blue-500'}`}
            >
              {isExpanded ? (
                <>Close Maintenance <ChevronUp className="w-4 h-4" /></>
              ) : (
                <>Maintenance <ChevronDown className="w-4 h-4" /></>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Service Center Area */}
      {isExpanded && (
        <div className="bg-gray-900/50 border-t border-gray-700 p-6 space-y-8">
          <div className="flex items-center gap-3">
            <div className="bg-amber-900/30 p-2 rounded-lg">
              <Wrench className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Service Center</h3>
              <p className="text-sm text-gray-500">Station: {plane.location.split(',')[0]}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* DEFECT CHECKLIST */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h4 className="text-sm font-bold text-white uppercase mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500" /> Defect Checklist (MEL)
              </h4>

              {!plane.melList || plane.melList.length === 0 ? (
                <div className="py-8 flex flex-col items-center gap-3 bg-gray-900/30 rounded-lg border border-dashed border-gray-700">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  <p className="text-gray-400 text-sm font-medium">No defects reported</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {plane.melList.map((mel, idx) => (
                    <div key={idx} className="bg-gray-900 border border-gray-700 p-4 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <AlertCircle className={`w-5 h-5 ${mel.type === 'major' ? 'text-rose-500' : 'text-amber-500'}`} />
                        <div>
                          <p className="text-gray-200 font-medium text-sm">{mel.item}</p>
                          <p className={`text-xs font-bold uppercase ${mel.type === 'major' ? 'text-rose-400' : 'text-amber-400'}`}>{mel.type} DEFECT</p>
                        </div>
                      </div>
                      <button
                        onClick={() => repairAircraft(plane.id, 'MEL', mel)}
                        className="flex items-center gap-2 bg-gray-700 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors"
                      >
                        <Wrench className="w-3.5 h-3.5" />
                        Fix • {formatCurrency(mel.type === 'major' ? 2000 : 500)}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* COMPONENT SERVICES */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h4 className="text-sm font-bold text-white uppercase mb-4 flex items-center gap-2">
                <Settings className="w-4 h-4 text-blue-400" /> Major Components
              </h4>

              <div className="space-y-4">
                {[
                  { id: 'engine', label: 'Powerplant', details: 'Overhaul: Reset SMOH to 0', repairCost: 2000, overhaulCost: 15000, current: engineCond },
                  { id: 'avionics', label: 'Avionics', details: 'Full diagnostic & repair', repairCost: 1000, overhaulCost: 5000, current: avionicsCond },
                  { id: 'airframe', label: 'Airframe', details: 'Structural inspection', repairCost: 1500, overhaulCost: 8000, current: airframeCond },
                  { id: 'interior', label: 'Interior', details: 'Cabin refurbishment', repairCost: 500, overhaulCost: 2000, current: interiorCond },
                ].map(comp => (
                  <div key={comp.id} className="bg-gray-900 border border-gray-700 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-gray-200 font-bold text-sm">{comp.label}</p>
                        <p className="text-xs text-gray-500">{comp.details}</p>
                      </div>
                      <div className={`text-sm font-bold ${getConditionColor(comp.current)}`}>{comp.current}%</div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => repairAircraft(plane.id, 'COMPONENT', { component: comp.id, action: 'repair' })}
                        className="flex-1 py-2 rounded-lg text-xs font-medium border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white transition-colors"
                      >
                        Repair {formatCurrency(comp.repairCost)} <span className="text-emerald-500 font-bold">+20%</span>
                      </button>
                      <button
                        onClick={() => repairAircraft(plane.id, 'COMPONENT', { component: comp.id, action: 'overhaul' })}
                        className="flex-1 py-2 rounded-lg text-xs font-medium bg-blue-900/30 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-800 hover:border-blue-500 transition-colors"
                      >
                        Overhaul {formatCurrency(comp.overhaulCost)}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function HealthBar({ label, value, getProgressBarColor, getConditionColor }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-end">
        <span className="text-xs font-medium text-gray-500">{label}</span>
        <span className={`text-xs font-bold ${getConditionColor(value)}`}>{value}%</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${getProgressBarColor(value)}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export default Fleet;