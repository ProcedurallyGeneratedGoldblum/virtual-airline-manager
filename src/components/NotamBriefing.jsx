import React, { useState, useEffect } from 'react';
import { AlertTriangle, Info, ShieldAlert, Zap, User, ClipboardList, RefreshCw } from 'lucide-react';
import { getFlightBriefing } from '../utils/notamAPI';
import { getBriefingSummary } from '../utils/notamDecoder';

const NotamBriefing = ({ departureCode, arrivalCode }) => {
    const [briefing, setBriefing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [role, setRole] = useState('pilot'); // pilot | dispatcher
    const [viewRaw, setViewRaw] = useState(false);

    useEffect(() => {
        const fetchBriefing = async () => {
            setLoading(true);
            const data = await getFlightBriefing(departureCode, arrivalCode);
            setBriefing(data);
            setLoading(false);
        };
        fetchBriefing();
    }, [departureCode, arrivalCode]);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8 space-x-2 text-slate-400">
                <RefreshCw className="animate-spin" size={20} />
                <span>Generating AI Briefing...</span>
            </div>
        );
    }

    const depSummary = getBriefingSummary(briefing?.departure || [], role);
    const arrSummary = getBriefingSummary(briefing?.arrival || [], role);

    const NotamCard = ({ notam }) => {
        const severityColors = {
            high: 'border-red-500/30 bg-red-500/5',
            medium: 'border-amber-500/30 bg-amber-500/5',
            low: 'border-blue-500/30 bg-blue-500/5'
        };

        const Icon = notam.severity === 'high' ? ShieldAlert : notam.severity === 'medium' ? AlertTriangle : Info;

        return (
            <div className={`p-3 rounded-lg border mb-2 transition-all hover:scale-[1.01] ${severityColors[notam.severity]}`}>
                <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center space-x-2">
                        <Icon size={14} className={notam.severity === 'high' ? 'text-red-400' : notam.severity === 'medium' ? 'text-amber-400' : 'text-blue-400'} />
                        <span className="text-[10px] font-mono font-bold tracking-wider opacity-60 uppercase">{notam.id}</span>
                    </div>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed italic">
                    {viewRaw ? notam.raw : notam.decoded}
                </p>
            </div>
        );
    };

    return (
        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 shadow-2xl backdrop-blur-sm">
            {/* Header / Role Selector */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                        <Zap size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white flex items-center">
                            AI Flight Briefing
                            <span className="ml-2 px-2 py-0.5 rounded text-[10px] bg-indigo-500/20 text-indigo-300 font-mono uppercase tracking-tighter">Powered by Notamify</span>
                        </h3>
                        <p className="text-xs text-slate-400">Decoded real-time operational notices</p>
                    </div>
                </div>

                <div className="flex items-center bg-slate-800 rounded-lg p-1">
                    <button
                        onClick={() => setRole('pilot')}
                        className={`px-3 py-1 rounded-md text-xs font-medium flex items-center space-x-1 transition-all ${role === 'pilot' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        <User size={12} />
                        <span>Pilot</span>
                    </button>
                    <button
                        onClick={() => setRole('dispatcher')}
                        className={`px-3 py-1 rounded-md text-xs font-medium flex items-center space-x-1 transition-all ${role === 'dispatcher' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        <ClipboardList size={12} />
                        <span>Dispatch</span>
                    </button>
                </div>
            </div>

            {/* AI Insights Panel */}
            <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-indigo-500/10 to-transparent border-l-4 border-indigo-500">
                <div className="flex items-center space-x-2 mb-2 text-indigo-300">
                    <Zap size={14} className="animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-widest">Intelligent Synopsis</span>
                </div>
                <p className="text-sm text-slate-300 italic leading-relaxed">
                    {depSummary} {arrSummary}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Departure Zone */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center">
                            Departure <span className="ml-2 text-indigo-400">{departureCode}</span>
                        </h4>
                        <button
                            onClick={() => setViewRaw(!viewRaw)}
                            className="text-[10px] text-slate-500 hover:text-indigo-400 transition-colors uppercase font-mono"
                        >
                            {viewRaw ? 'Show Decoded' : 'Show Raw'}
                        </button>
                    </div>
                    <div className="space-y-2">
                        {briefing?.departure?.map((n, i) => <NotamCard key={i} notam={n} />)}
                        {briefing?.departure?.length === 0 && <p className="text-xs text-slate-600">No active notices.</p>}
                    </div>
                </div>

                {/* Arrival Zone */}
                <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center">
                        Arrival <span className="ml-2 text-indigo-400">{arrivalCode}</span>
                    </h4>
                    <div className="space-y-2">
                        {briefing?.arrival?.map((n, i) => <NotamCard key={i} notam={n} />)}
                        {briefing?.arrival?.length === 0 && <p className="text-xs text-slate-600">No active notices.</p>}
                    </div>
                </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/50 flex items-center justify-between text-[9px] text-slate-600 font-mono">
                <span>NOTAM DATA REV {new Date().toLocaleDateString()}</span>
                <span className="flex items-center space-x-1">
                    <ShieldAlert size={10} />
                    <span>Always verify raw sources before flight</span>
                </span>
            </div>
        </div>
    );
};

export default NotamBriefing;
