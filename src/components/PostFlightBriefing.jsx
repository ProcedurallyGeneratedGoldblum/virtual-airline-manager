import React, { useState } from 'react';
import { X, Plane, Clock, MapPin, DollarSign, AlertTriangle, CheckCircle, FileText } from 'lucide-react';
import { useAppContext } from './AppContext';

function PostFlightBriefing() {
    const { flightToComplete, completeFlightWithBriefing, cancelFlightBriefing } = useAppContext();

    const [briefingData, setBriefingData] = useState({
        actualDuration: '',
        fuelUsed: '',
        earnings: 0,
        landingQuality: 'smooth',
        weatherConditions: 'VFR',
        technicalDefects: '',
        severity: 'minor',
        notes: ''
    });

    // Don't render if no flight to complete
    if (!flightToComplete) return null;

    const handleInputChange = (field, value) => {
        setBriefingData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!briefingData.actualDuration) {
            alert('Please enter the actual flight duration');
            return;
        }

        // Calculate earnings based on flight distance and conditions
        const baseEarnings = flightToComplete.distance * 3; // $3 per nm
        let earningsMultiplier = 1;

        // Bonus for smooth landing
        if (briefingData.landingQuality === 'smooth') earningsMultiplier += 0.1;
        if (briefingData.landingQuality === 'butter') earningsMultiplier += 0.2;

        // Penalty for hard landing
        if (briefingData.landingQuality === 'hard') earningsMultiplier -= 0.15;
        if (briefingData.landingQuality === 'rough') earningsMultiplier -= 0.25;

        // Weather bonus for IFR
        if (briefingData.weatherConditions === 'IFR') earningsMultiplier += 0.15;
        if (briefingData.weatherConditions === 'MVFR') earningsMultiplier += 0.05;

        const finalEarnings = Math.round(baseEarnings * earningsMultiplier);

        completeFlightWithBriefing(flightToComplete.id, {
            ...briefingData,
            earnings: finalEarnings
        });

        // Reset form
        setBriefingData({
            actualDuration: '',
            fuelUsed: '',
            earnings: 0,
            landingQuality: 'smooth',
            weatherConditions: 'VFR',
            technicalDefects: '',
            severity: 'minor',
            notes: ''
        });
    };

    const handleCancel = () => {
        cancelFlightBriefing();
        setBriefingData({
            actualDuration: '',
            fuelUsed: '',
            earnings: 0,
            landingQuality: 'smooth',
            weatherConditions: 'VFR',
            technicalDefects: '',
            severity: 'minor',
            notes: ''
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
                {/* Header */}
                <div className="bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Post-Flight Briefing</h2>
                            <p className="text-sm text-gray-500">Submit your flight report to complete mission</p>
                        </div>
                    </div>
                    <button
                        onClick={handleCancel}
                        className="p-2 hover:bg-gray-100 rounded-full text-gray-500 hover:text-gray-700 transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Flight Info Summary */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase mb-1">Aircraft</p>
                            <div className="flex items-center gap-2">
                                <Plane className="w-4 h-4 text-gray-400" />
                                <span className="font-semibold text-gray-900">{flightToComplete.aircraftRegistration}</span>
                            </div>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase mb-1">Route</p>
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                <span className="font-semibold text-gray-900">
                                    {flightToComplete.route?.fromCode} → {flightToComplete.route?.toCode}
                                </span>
                            </div>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase mb-1">Est. Time</p>
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span className="font-semibold text-gray-900">{flightToComplete.duration}</span>
                            </div>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase mb-1">Pay Rate</p>
                            <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-green-600" />
                                <span className="font-semibold text-green-600">$3.00/nm</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-8">
                    {/* Flight Details Section */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide border-b border-gray-100 pb-2">Operational Data</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Actual Flight Duration <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={briefingData.actualDuration}
                                        onChange={(e) => handleInputChange('actualDuration', e.target.value)}
                                        placeholder="e.g., 2h 15m"
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Fuel Consumed
                                </label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">GAL</div>
                                    <input
                                        type="number"
                                        value={briefingData.fuelUsed}
                                        onChange={(e) => handleInputChange('fuelUsed', e.target.value)}
                                        placeholder="e.g., 450"
                                        className="w-full pl-12 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Flight Quality Section */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide border-b border-gray-100 pb-2">Performance & Conditions</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Landing Quality
                                </label>
                                <select
                                    value={briefingData.landingQuality}
                                    onChange={(e) => handleInputChange('landingQuality', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                                >
                                    <option value="butter">🧈 Butter (-0 fpm)</option>
                                    <option value="smooth">✨ Smooth (&lt;150 fpm)</option>
                                    <option value="normal">✅ Normal (&lt;300 fpm)</option>
                                    <option value="hard">⚠️ Hard (&gt;500 fpm)</option>
                                    <option value="rough">💥 Rough (&gt;800 fpm)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Weather Encountered
                                </label>
                                <select
                                    value={briefingData.weatherConditions}
                                    onChange={(e) => handleInputChange('weatherConditions', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                                >
                                    <option value="VFR">☀️ VFR (Clear)</option>
                                    <option value="MVFR">☁️ MVFR (Marginal)</option>
                                    <option value="IFR">🌧️ IFR (Instrument)</option>
                                    <option value="LIFR">🌫️ LIFR (Low Vis)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Technical Defects */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide border-b border-gray-100 pb-2">Maintenance Report</h3>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-4">
                                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                                <h4 className="font-semibold text-gray-900 text-sm">Discrepancy Log</h4>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 uppercase mb-1">
                                        Issue Description
                                    </label>
                                    <textarea
                                        value={briefingData.technicalDefects}
                                        onChange={(e) => handleInputChange('technicalDefects', e.target.value)}
                                        placeholder="No defects reported."
                                        rows={2}
                                        className="w-full px-4 py-2.5 border border-yellow-300 bg-white rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all placeholder:text-gray-400 text-sm"
                                    />
                                </div>
                                {briefingData.technicalDefects && (
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 uppercase mb-1">
                                            Severity Classification
                                        </label>
                                        <div className="flex gap-4">
                                            {['minor', 'major', 'critical'].map((sev) => (
                                                <label key={sev} className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="severity"
                                                        value={sev}
                                                        checked={briefingData.severity === sev}
                                                        onChange={(e) => handleInputChange('severity', e.target.value)}
                                                        className="text-yellow-600 focus:ring-yellow-500"
                                                    />
                                                    <span className="text-sm capitalize text-gray-800">{sev}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="flex-1 px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition shadow-sm"
                        >
                            Discard Report
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-6 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition shadow-sm flex items-center justify-center gap-2"
                        >
                            <CheckCircle className="w-5 h-5" />
                            Submit & Complete
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default PostFlightBriefing;
