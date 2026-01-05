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
            <div className="flex items-center justify-center p-12 space-x-3 text-gray-400">
                <RefreshCw className="animate-spin" size={18} />
                <span className="text-xs font-medium uppercase tracking-wide">Loading data...</span>
            </div>
        );
    }

    const depSummary = getBriefingSummary(briefing?.departure || [], role);
    const arrSummary = getBriefingSummary(briefing?.arrival || [], role);

    const NotamCard = ({ notam }) => {
        const severityColors = {
            high: 'border-red-500 bg-red-50',
            medium: 'border-amber-500 bg-amber-50',
            low: 'border-blue-200 bg-blue-50'
        };

        const Icon = notam.severity === 'high' ? ShieldAlert : notam.severity === 'medium' ? AlertTriangle : Info;

        return (
            <div className={`p-4 rounded-lg border-l-4 mb-2 ${severityColors[notam.severity]}`}>
                <div className="flex items-start gap-3">
                    <Icon size={16} className={`mt-0.5 shrink-0 ${notam.severity === 'high' ? 'text-red-600' : notam.severity === 'medium' ? 'text-amber-600' : 'text-blue-500'}`} />
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-gray-500 uppercase">{notam.id}</span>
                        </div>
                        <p className={`text-sm leading-relaxed ${notam.severity === 'low' ? 'text-gray-700' : 'text-gray-900 font-medium'}`}>
                            {viewRaw ? notam.raw : notam.decoded}
                        </p>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <FileText className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-900">NOTAM Briefing</h3>
                    <p className="text-sm text-gray-500">Notice to Air Missions for relevant aerodromes</p>
                </div>
                <div className="ml-auto flex bg-gray-100 rounded-lg p-1">
                    <button
                        onClick={() => setRole('pilot')}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${role === 'pilot' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Pilot
                    </button>
                    <button
                        onClick={() => setRole('dispatcher')}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${role === 'dispatcher' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Dispatch
                    </button>
                </div>
            </div>

            {/* AI Summary */}
            <div className="mb-8 bg-blue-50 border border-blue-100 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2 text-blue-800">
                    <Zap size={16} />
                    <span className="text-xs font-bold uppercase tracking-wide">AI Synopsis</span>
                </div>
                <p className="text-sm text-blue-900 leading-relaxed">
                    {depSummary} {arrSummary}
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Departure Zone */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                            Departure <span className="bg-gray-100 text-gray-900 px-2 py-0.5 rounded text-xs">{departureCode}</span>
                        </h4>
                        <button
                            onClick={() => setViewRaw(!viewRaw)}
                            className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
                        >
                            {viewRaw ? 'Show Decoded' : 'Show Raw Data'}
                        </button>
                    </div>
                    <div className="space-y-3">
                        {briefing?.departure?.map((n, i) => <NotamCard key={i} notam={n} />)}
                        {briefing?.departure?.length === 0 && <p className="text-sm text-gray-400 italic">No active NOTAMs found.</p>}
                    </div>
                </div>

                {/* Arrival Zone */}
                <div>
                    <div className="flex items-center mb-4">
                        <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                            Arrival <span className="bg-gray-100 text-gray-900 px-2 py-0.5 rounded text-xs">{arrivalCode}</span>
                        </h4>
                    </div>
                    <div className="space-y-3">
                        {briefing?.arrival?.map((n, i) => <NotamCard key={i} notam={n} />)}
                        {briefing?.arrival?.length === 0 && <p className="text-sm text-gray-400 italic">No active NOTAMs found.</p>}
                    </div>
                </div>
            </div>

            <div className="mt-8 pt-4 border-t border-gray-100 text-center">
                <p className="text-xs text-gray-400 flex items-center justify-center gap-2">
                    <ShieldAlert size={12} />
                    Simulated data for virtual aviation use only. Not for real-world navigation.
                </p>
            </div>
        </div>
    );
};

export default NotamBriefing;
