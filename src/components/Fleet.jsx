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
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Fleet Management</h2>
          <p className="text-slate-400 mt-1 font-medium">Monitor health and schedule maintenance for your assets</p>
        </div>

        <div className="flex gap-4">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 px-4 py-2 rounded-xl flex items-center gap-3">
            <div className="bg-emerald-500/20 p-2 rounded-lg">
              <DollarSign className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Balance</p>
              <p className="text-lg font-bold text-emerald-400 leading-none">{formatCurrency(company?.balance || 0)}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Fleet Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Aircraft', value: fleet.length, icon: <ArrowUpCircle />, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Available', value: fleet.filter(a => a.status === 'available').length, icon: <CheckCircle2 />, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'In Flight', value: fleet.filter(a => a.status === 'in-flight').length, icon: <ArrowUpCircle />, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
          { label: 'Maintenance', value: fleet.filter(a => a.status === 'maintenance' || a.status === 'out-of-service').length, icon: <Settings />, color: 'text-amber-400', bg: 'bg-amber-500/10' },
        ].map((stat, i) => (
          <div key={i} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-5 rounded-2xl shadow-sm hover:border-slate-600/50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">{stat.label}</p>
                <p className="text-3xl font-black text-white">{stat.value}</p>
              </div>
              <div className={`${stat.bg} ${stat.color} p-3 rounded-2xl`}>
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
          <div className="p-12 text-center bg-slate-800/30 rounded-3xl border border-dashed border-slate-700/50">
            <div className="bg-slate-700/30 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ArrowUpCircle className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-300">Your Fleet is Empty</h3>
            <p className="text-slate-500 mt-2">Visit the Marketplace to acquire your first aircraft.</p>
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
  // Safe access helpers
  const ttaf = plane.conditionDetails?.airframe?.ttaf ?? plane.total_hours ?? plane.hours ?? 0;
  const smoh = plane.conditionDetails?.engine?.smoh ?? 0;
  const engineTbo = plane.conditionDetails?.engine?.tbo ?? 2000;

  // Component conditions
  const engineCond = plane.conditionDetails?.engine?.condition ?? 0;
  const airframeCond = plane.conditionDetails?.airframe?.condition ?? 0;
  const avionicsCond = plane.conditionDetails?.avionics?.condition ?? 0;
  const interiorCond = plane.conditionDetails?.interior?.condition ?? 0;

  return (
    <div className={`bg-slate-800/40 backdrop-blur-md border rounded-3xl overflow-hidden transition-all duration-300 ${isExpanded ? 'border-blue-500/50 ring-1 ring-blue-500/20 shadow-2xl' : 'border-slate-700/50 hover:border-slate-600 shadow-lg'}`}>
      <div className="p-6">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Image & Main Info Area */}
          <div className="flex-1 flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-56 h-40 bg-slate-700/50 rounded-2xl overflow-hidden relative flex-shrink-0 border border-slate-600/30">
              {plane.image && plane.image.startsWith('/') ? (
                <img src={plane.image} alt={plane.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center">
                  <span className="text-5xl drop-shadow-lg">{plane.image || '✈️'}</span>
                </div>
              )}

              {/* Registration Overlay */}
              <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-lg border border-slate-700/50 shadow-xl">
                <p className="text-sm font-black text-white tracking-widest leading-none">{plane.registration || 'N/A'}</p>
              </div>
            </div>

            <div className="flex-grow flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h3 className="text-2xl font-black text-white">{plane.name}</h3>
                <span className={`px-4 py-1.5 rounded-full text-xs font-black border transition-colors flex items-center gap-2 uppercase tracking-widest ${getStatusColor(plane.status)}`}>
                  {getStatusIcon(plane.status)}
                  {plane.status.replace('-', ' ')}
                </span>

                {plane.melList && plane.melList.length > 0 && (
                  <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {plane.melList.length} DEFECTS
                  </span>
                )}
              </div>

              <p className="text-slate-400 font-bold flex items-center gap-2 mb-4">
                <span className="bg-slate-700/50 px-2 py-0.5 rounded text-xs text-slate-300">{plane.manufacturer}</span>
                <span className="text-slate-600">•</span>
                <span className="text-sm">S/N: {plane.serialNumber || 'N/A'}</span>
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 p-4 bg-slate-900/40 rounded-2xl border border-slate-700/50">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                    <MapPin className="w-3 h-3" /> Location
                  </p>
                  <p className="text-sm font-bold text-slate-200">{plane.location.split(',')[0]} <span className="text-slate-500 font-medium">({plane.location.match(/\((.*?)\)/)?.[1] || ''})</span></p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                    <Clock className="w-3 h-3" /> TTAF
                  </p>
                  <p className="text-sm font-bold text-slate-200">{ttaf.toLocaleString()} <span className="text-slate-500 font-medium text-xs">hrs</span></p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                    <Wrench className="w-3 h-3" /> Eng SMOH
                  </p>
                  <p className={`text-sm font-bold ${smoh > engineTbo * 0.9 ? 'text-rose-400' : 'text-slate-200'}`}>
                    {Math.floor(smoh).toLocaleString()} <span className="text-slate-500 font-medium text-xs">hrs</span>
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" /> Next Insp
                  </p>
                  <p className={`text-sm font-bold ${plane.nextInspectionDue < 10 ? 'text-rose-500 animate-pulse' : plane.nextInspectionDue < 25 ? 'text-amber-400' : 'text-slate-200'}`}>
                    {plane.nextInspectionDue?.toFixed(1) || 0} <span className="text-slate-500 font-medium text-xs">hrs</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Health Metrics */}
          <div className="lg:w-72 flex flex-col justify-between border-l border-slate-700/50 pl-8">
            <div className="space-y-4">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                <Info className="w-3 h-3" /> Health Status
              </p>

              <HealthBar label="Engine" value={engineCond} getProgressBarColor={getProgressBarColor} getConditionColor={getConditionColor} />
              <HealthBar label="Avionics" value={avionicsCond} getProgressBarColor={getProgressBarColor} getConditionColor={getConditionColor} />
              <HealthBar label="Airframe" value={airframeCond} getProgressBarColor={getProgressBarColor} getConditionColor={getConditionColor} />
            </div>

            <button
              onClick={onToggle}
              className={`mt-6 w-full py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 ${isExpanded ? 'bg-slate-700 text-white shadow-inner' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-500/20 active:scale-95'}`}
            >
              {isExpanded ? (
                <>Close Service Center <ChevronUp className="w-4 h-4" /></>
              ) : (
                <>Maintenance & Repairs <ChevronDown className="w-4 h-4" /></>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Service Center Area */}
      {isExpanded && (
        <div className="bg-slate-900/60 border-t border-slate-700/50 p-8 space-y-8 animate-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-4">
            <div className="bg-amber-500/20 p-3 rounded-2xl">
              <Wrench className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white uppercase tracking-tight">Service Center</h3>
              <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">Station: {plane.location.split(',')[0]}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* DEFECT CHECKLIST */}
            <div className="bg-slate-800/40 rounded-3xl border border-slate-700/50 p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500" /> Defect Checklist (MEL)
                </h4>
              </div>

              {!plane.melList || plane.melList.length === 0 ? (
                <div className="py-12 flex flex-col items-center gap-4 bg-slate-900/40 rounded-2xl border border-dashed border-slate-700/50">
                  <div className="bg-emerald-500/10 p-4 rounded-full">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  </div>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Aircraft is clean - No defects reported</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {plane.melList.map((mel, idx) => (
                    <div key={idx} className="bg-slate-900/60 border border-slate-700/50 p-4 rounded-2xl flex items-center justify-between group hover:border-slate-600 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-xl ${mel.type === 'major' ? 'bg-rose-500/10' : 'bg-amber-500/10'}`}>
                          <AlertCircle className={`w-5 h-5 ${mel.type === 'major' ? 'text-rose-500' : 'text-amber-500'}`} />
                        </div>
                        <div>
                          <p className="text-slate-200 font-bold text-sm tracking-tight">{mel.item}</p>
                          <p className={`text-[10px] font-black uppercase tracking-widest ${mel.type === 'major' ? 'text-rose-400' : 'text-amber-400'}`}>{mel.type} DEFECT</p>
                        </div>
                      </div>
                      <button
                        onClick={() => repairAircraft(plane.id, 'MEL', mel)}
                        className="flex items-center gap-2 bg-slate-700 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200 active:scale-95 shadow-lg shadow-black/20"
                      >
                        <Wrench className="w-3.5 h-3.5" />
                        Fix <span className="opacity-50">•</span> {formatCurrency(mel.type === 'major' ? 2000 : 500)}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* COMPONENT SERVICES */}
            <div className="bg-slate-800/40 rounded-3xl border border-slate-700/50 p-6 shadow-xl">
              <h4 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                <Settings className="w-4 h-4 text-blue-400" /> Major Component Overhaul
              </h4>

              <div className="space-y-6">
                {[
                  { id: 'engine', label: 'Powerplant Overhaul', details: 'Reset SMOH to 0 & condition to 100%', repairCost: 2000, overhaulCost: 15000, current: engineCond },
                  { id: 'avionics', label: 'Systems & Avionics', details: 'Full diagnostic & component replacement', repairCost: 1000, overhaulCost: 5000, current: avionicsCond },
                  { id: 'airframe', label: 'Structural Inspection', details: 'Corrosion check & airframe cleanup', repairCost: 1500, overhaulCost: 8000, current: airframeCond },
                  { id: 'interior', label: 'Cabin Refurbishment', details: 'Seat re-covering & panel upgrades', repairCost: 500, overhaulCost: 2000, current: interiorCond },
                ].map(comp => (
                  <div key={comp.id} className="bg-slate-900/60 border border-slate-700/50 p-5 rounded-2xl">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-slate-200 font-black text-sm tracking-tight">{comp.label}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{comp.details}</p>
                      </div>
                      <div className={`text-sm font-black ${getConditionColor(comp.current)}`}>{comp.current}%</div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => repairAircraft(plane.id, 'COMPONENT', { component: comp.id, action: 'repair' })}
                        className="flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-700 hover:border-slate-500 text-slate-400 hover:text-white transition-all flex items-center justify-center gap-2"
                      >
                        Repair {formatCurrency(comp.repairCost)} <span className="text-slate-600 text-[8px]">+20%</span>
                      </button>
                      <button
                        onClick={() => repairAircraft(plane.id, 'COMPONENT', { component: comp.id, action: 'overhaul' })}
                        className="flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 hover:border-blue-500 transition-all flex items-center justify-center gap-2"
                      >
                        Overhaul {formatCurrency(comp.overhaulCost)} <span className="text-blue-500/50 hover:text-white/50 text-[8px]">RESET</span>
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
    <div className="space-y-1.5">
      <div className="flex justify-between items-end">
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
        <span className={`text-[10px] font-black ${getConditionColor(value)}`}>{value}%</span>
      </div>
      <div className="w-full bg-slate-900/50 rounded-full h-1.5 border border-slate-700/30">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${getProgressBarColor(value)}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export default Fleet;