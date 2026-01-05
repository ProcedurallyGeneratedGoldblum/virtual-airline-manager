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
    { id: 'dashboard', name: 'Fleet Ops', icon: Plane },
    { id: 'dispatch', name: 'Dispatch', icon: Radio },
    { id: 'flightlog', name: 'Logbook', icon: BookOpen },
    { id: 'marketplace', name: 'Hangar', icon: Building2 },
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
      <div className="min-h-screen bg-[#242424] text-white font-sans selection:bg-blue-500 selection:text-white">
        {/* Navigation Bar */}
        <nav className="bg-[#1a1a1a] border-b border-gray-800 shadow-lg sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <Plane className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold tracking-tight text-white">VA Manager</span>
              </div>

              <div className="flex gap-1 bg-[#242424] p-1 rounded-lg border border-gray-800">
                {navigation.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setCurrentPage(item.id)}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
                      ${currentPage === item.id
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'}
                    `}
                  >
                    <item.icon className={`w-4 h-4 ${currentPage === item.id ? 'text-blue-100' : 'text-gray-500'}`} />
                    <span>{item.name}</span>
                  </button>
                ))}
              </div>

              <div className="w-8"></div> {/* Spacer for centering balance if needed later */}
            </div>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 shadow-xl min-h-[80vh] p-6 lg:p-8">
            {renderPage()}
          </div>
        </main>

        <PostFlightBriefing />
      </div>
    </AppProvider>
  );
}

export default App;