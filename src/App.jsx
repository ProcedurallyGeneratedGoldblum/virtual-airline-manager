import React, { useState } from 'react';
import { Plane, LayoutDashboard, Radio, ShoppingBag, BookOpen, User, Building2 } from 'lucide-react';
import { AppProvider } from './components/AppContext';
import Dashboard from './components/Dashboard';
import DispatchCenter from './components/DispatchCenter';
import Marketplace from './components/Marketplace';
import FlightLog from './components/FlightLog';
import PilotProfile from './components/PilotProfile';
import Company from './components/Company';
import PostFlightBriefing from './components/PostFlightBriefing';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'company', name: 'Company', icon: Building2 },
    { id: 'dispatch', name: 'Dispatch Center', icon: Radio },
    { id: 'marketplace', name: 'Marketplace', icon: ShoppingBag },
    { id: 'flightlog', name: 'Flight Log', icon: BookOpen },
    { id: 'profile', name: 'Profile', icon: User },
  ];

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'company':
        return <Company />;
      case 'dispatch':
        return <DispatchCenter />;
      case 'marketplace':
        return <Marketplace />;
      case 'flightlog':
        return <FlightLog />;
      case 'profile':
        return <PilotProfile />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <AppProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        {/* Header */}
        <header className="bg-gradient-to-r from-blue-900 to-blue-700 text-white shadow-lg">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Plane className="w-8 h-8" />
                <div>
                  <h1 className="text-2xl font-bold">Virtual Airline Management Center</h1>
                  <p className="text-sm text-blue-200">Pilot Operations - MSFS2024</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <nav className="bg-white shadow-md border-b border-gray-200">
          <div className="container mx-auto px-6">
            <div className="flex gap-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentPage(item.id)}
                    className={`flex items-center gap-2 px-6 py-4 font-semibold transition border-b-4 ${isActive
                        ? 'text-blue-900 border-blue-900 bg-blue-50'
                        : 'text-gray-600 border-transparent hover:text-blue-900 hover:bg-gray-50'
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="hidden sm:inline">{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="container mx-auto px-6 py-8">
          {renderPage()}
        </main>

        {/* Post Flight Briefing Modal */}
        <PostFlightBriefing />
      </div>
    </AppProvider>
  );
}

export default App;