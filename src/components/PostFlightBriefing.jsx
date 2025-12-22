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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white p-6 rounded-t-xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <FileText className="w-8 h-8" />
                            <div>
                                <h2 className="text-2xl font-bold">Post-Flight Briefing</h2>
                                <p className="text-blue-200">Complete your flight report</p>
                            </div>
                        </div>
                        <button
                            onClick={handleCancel}
                            className="p-2 hover:bg-blue-800 rounded-lg transition"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Flight Info Summary */}
                <div className="bg-blue-50 p-4 border-b border-blue-100">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex items-center gap-2">
                            <Plane className="w-5 h-5 text-blue-600" />
                            <div>
                                <p className="text-xs text-gray-600">Aircraft</p>
                                <p className="font-semibold text-gray-900">{flightToComplete.aircraftRegistration}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-blue-600" />
                            <div>
                                <p className="text-xs text-gray-600">Route</p>
                                <p className="font-semibold text-gray-900">
                                    {flightToComplete.route?.fromCode} → {flightToComplete.route?.toCode}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-blue-600" />
                            <div>
                                <p className="text-xs text-gray-600">Est. Duration</p>
                                <p className="font-semibold text-gray-900">{flightToComplete.duration}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-green-600" />
                            <div>
                                <p className="text-xs text-gray-600">Distance</p>
                                <p className="font-semibold text-gray-900">{flightToComplete.distance} nm</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Flight Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Actual Flight Duration <span className="text-red-600">*</span>
                            </label>
                            <input
                                type="text"
                                value={briefingData.actualDuration}
                                onChange={(e) => handleInputChange('actualDuration', e.target.value)}
                                placeholder="e.g., 3.5 or 3h 30m"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Fuel Used (gallons)
                            </label>
                            <input
                                type="number"
                                value={briefingData.fuelUsed}
                                onChange={(e) => handleInputChange('fuelUsed', e.target.value)}
                                placeholder="e.g., 45"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Flight Quality */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Landing Quality
                            </label>
                            <select
                                value={briefingData.landingQuality}
                                onChange={(e) => handleInputChange('landingQuality', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="butter">🧈 Butter (Perfect)</option>
                                <option value="smooth">✈️ Smooth (Good)</option>
                                <option value="normal">🛬 Normal</option>
                                <option value="hard">⚠️ Hard</option>
                                <option value="rough">❌ Rough</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Weather Conditions
                            </label>
                            <select
                                value={briefingData.weatherConditions}
                                onChange={(e) => handleInputChange('weatherConditions', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="VFR">VFR - Visual Flight Rules</option>
                                <option value="MVFR">MVFR - Marginal VFR</option>
                                <option value="IFR">IFR - Instrument Flight Rules</option>
                                <option value="LIFR">LIFR - Low IFR</option>
                            </select>
                        </div>
                    </div>

                    {/* Technical Defects */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <AlertTriangle className="w-5 h-5 text-yellow-600" />
                            <h3 className="font-semibold text-gray-900">Technical Defects Report</h3>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Describe any defects or issues (leave blank if none)
                                </label>
                                <textarea
                                    value={briefingData.technicalDefects}
                                    onChange={(e) => handleInputChange('technicalDefects', e.target.value)}
                                    placeholder="e.g., Slight vibration in left engine at high RPM, navigation lights dim..."
                                    rows={3}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            {briefingData.technicalDefects && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Defect Severity
                                    </label>
                                    <select
                                        value={briefingData.severity}
                                        onChange={(e) => handleInputChange('severity', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="minor">Minor - Can continue flying</option>
                                        <option value="major">Major - Requires maintenance</option>
                                        <option value="critical">Critical - Ground immediately</option>
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Additional Notes */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Additional Notes
                        </label>
                        <textarea
                            value={briefingData.notes}
                            onChange={(e) => handleInputChange('notes', e.target.value)}
                            placeholder="Any additional comments about the flight..."
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
                        >
                            <CheckCircle className="w-5 h-5" />
                            Complete Flight
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default PostFlightBriefing;
