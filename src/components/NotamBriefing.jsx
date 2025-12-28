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
            <div className="flex items-center justify-center p-12 space-x-3 text-zinc-400">
                <RefreshCw className="animate-spin" size={18} />
                <span className="text-[10px] font-mono uppercase tracking-[0.2em]">Analyzing Intel...</span>
            </div>
        );
    }

    const depSummary = getBriefingSummary(briefing?.departure || [], role);
    const arrSummary = getBriefingSummary(briefing?.arrival || [], role);

    const NotamCard = ({ notam }) => {
        const severityColors = {
            high: 'border-red-900/50 bg-red-900/5',
            medium: 'border-amber-900/50 bg-amber-900/5',
            low: 'border-zinc-200 bg-zinc-50'
        };

        const Icon = notam.severity === 'high' ? ShieldAlert : notam.severity === 'medium' ? AlertTriangle : Info;

        return (
            <div className={`p-4 rounded-none border mb-1 transition-all hover:border-black group ${severityColors[notam.severity]}`}>
                <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                        <Icon size={12} className={notam.severity === 'high' ? 'text-red-600' : notam.severity === 'medium' ? 'text-amber-600' : 'text-zinc-400'} />
                        <span className="text-[9px] font-mono font-black tracking-widest text-zinc-400 uppercase">{notam.id}</span>
                    </div>
                </div>
                <p className={`text-xs leading-relaxed font-medium ${notam.severity === 'low' ? 'text-zinc-600' : 'text-zinc-900 italic'}`}>
                    {viewRaw ? notam.raw : notam.decoded}
                </p>
            </div>
        );
    };

    return (
        <div className="p-8 rounded-none bg-white border-2 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,0.05)]">
            {/* Header / Role Selector */}
            <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6 border-b-4 border-black pb-8">
                <div className="flex items-center space-x-4">
                    <div className="p-3 bg-black text-white rounded-none">
                        <Zap size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-black uppercase tracking-tighter italic flex items-center">
                            Operational Intel
                            <span className="ml-3 px-2 py-0.5 border border-black text-[8px] font-mono uppercase tracking-widest bg-emerald-50 text-emerald-700">Live Feed</span>
                        </h3>
                        <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest mt-1">Northwestern Airframes Dispatch Division</p>
                    </div>
                </div>

                <div className="flex items-center bg-zinc-100 p-1 rounded-none border border-zinc-200">
                    <button
                        onClick={() => setRole('pilot')}
                        className={`px-6 py-2 rounded-none text-[10px] font-black uppercase tracking-widest transition-all ${role === 'pilot' ? 'bg-black text-white' : 'text-zinc-400 hover:text-black'}`}
                    >
                        <span>Pilot Brief</span>
                    </button>
                    <button
                        onClick={() => setRole('dispatcher')}
                        className={`px-6 py-2 rounded-none text-[10px] font-black uppercase tracking-widest transition-all ${role === 'dispatcher' ? 'bg-black text-white' : 'text-zinc-400 hover:text-black'}`}
                    >
                        <span>Dispatch Summary</span>
                    </button>
                </div>
            </div>

            {/* AI Insights Panel - Industrial Style */}
            <div className="mb-10 p-6 bg-zinc-50 border-l-4 border-black relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-5 italic font-black text-4xl select-none uppercase">Intel</div>
                <div className="flex items-center space-x-2 mb-3 text-black">
                    <Zap size={14} />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Automated Synopsis</span>
                </div>
                <p className="text-sm text-zinc-700 italic leading-relaxed font-semibold max-w-3xl">
                    {depSummary} {arrSummary}
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Departure Zone */}
                <div>
                    <div className="flex items-center justify-between mb-4 border-b border-zinc-100 pb-2">
                        <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] flex items-center">
                            Departure <span className="ml-3 text-black bg-zinc-100 px-2 py-1">{departureCode}</span>
                        </h4>
                        <button
                            onClick={() => setViewRaw(!viewRaw)}
                            className="text-[9px] font-mono font-bold text-zinc-400 hover:text-black transition-colors uppercase border border-zinc-200 px-2 py-1"
                        >
                            {viewRaw ? 'Decoded' : 'Raw Data'}
                        </button>
                    </div>
                    <div className="space-y-1">
                        {briefing?.departure?.map((n, i) => <NotamCard key={i} notam={n} />)}
                        {briefing?.departure?.length === 0 && <p className="text-[10px] font-mono text-zinc-300 uppercase italic">Intel secure. No threats detected.</p>}
                    </div>
                </div>

                {/* Arrival Zone */}
                <div>
                    <div className="flex items-center mb-4 border-b border-zinc-100 pb-2">
                        <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] flex items-center">
                            Arrival <span className="ml-3 text-black bg-zinc-100 px-2 py-1">{arrivalCode}</span>
                        </h4>
                    </div>
                    <div className="space-y-1">
                        {briefing?.arrival?.map((n, i) => <NotamCard key={i} notam={n} />)}
                        {briefing?.arrival?.length === 0 && <p className="text-[10px] font-mono text-zinc-300 uppercase italic">Intel secure. No threats detected.</p>}
                    </div>
                </div>
            </div>

            <div className="mt-12 pt-6 border-t border-zinc-100 flex flex-col md:flex-row items-center justify-between gap-4">
                <span className="text-[9px] font-mono text-zinc-300 uppercase tracking-widest">Auth Code: NWAF-OP-{new Date().getTime().toString().slice(-6)}</span>
                <div className="flex items-center space-x-4 opacity-30">
                    <span className="text-[9px] font-mono uppercase tracking-widest">Always Verify Raw Sources</span>
                    <ShieldAlert size={12} className="text-black" />
                </div>
            </div>
        </div>
    );
};

export default NotamBriefing;
