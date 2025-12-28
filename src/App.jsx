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
      <div className="min-h-screen bg-[#FDFDFD] text-slate-900 font-sans selection:bg-slate-900 selection:text-white">
        {/* Header */}
        <header className="bg-black text-white py-8 border-b border-zinc-200">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <img src="/logo.png" alt="Northwestern Airframes" className="h-16 w-auto invert brightness-0" />
                <div className="h-10 w-px bg-zinc-800 hidden md:block"></div>
                <div>
                  <h1 className="text-3xl font-black tracking-tighter uppercase italic">Northwestern Airframes</h1>
                  <p className="text-[10px] font-mono tracking-[0.2em] text-zinc-500 uppercase mt-1">Industrial Operations • MSFS2024 Division</p>
                </div>
              </div>
              <div className="hidden lg:flex items-center gap-8 text-[10px] font-mono tracking-widest text-zinc-400 uppercase">
                <div className="flex flex-col items-end">
                  <span>Op Stat</span>
                  <span className="text-emerald-500">Active</span>
                </div>
                <div className="flex flex-col items-end border-l border-zinc-800 pl-8">
                  <span>Network</span>
                  <span className="text-white">Live Feed</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Minimal Taxonomy Navigation */}
        <nav className="bg-white border-b border-zinc-200 sticky top-0 z-50">
          <div className="container mx-auto px-6">
            <div className="flex justify-center md:justify-start overflow-x-auto no-scrollbar">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentPage(item.id)}
                    className={`group relative flex items-center gap-3 px-8 py-5 text-[11px] font-bold tracking-[0.15em] uppercase transition-all ${isActive
                      ? 'text-black'
                      : 'text-zinc-400 hover:text-black'
                      }`}
                  >
                    <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-black stroke-[3px]' : 'text-zinc-400'}`} />
                    <span>{item.name}</span>
                    {isActive && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black"></div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Rugged Main Content Area */}
        <main className="container mx-auto px-6 py-12">
          <div className="max-w-7xl mx-auto">
            {renderPage()}
          </div>
        </main>

        {/* Minimal Footer */}
        <footer className="border-t border-zinc-200 py-12 bg-zinc-50">
          <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4 opacity-30">
              <img src="/logo.png" alt="Northwestern Airframes" className="h-8 w-auto grayscale" />
              <span className="text-[10px] font-mono tracking-widest">EST. 2024</span>
            </div>
            <div className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest">
              Built for the rugged skies of the northwest
            </div>
          </div>
        </footer>

        {/* Post Flight Briefing Modal */}
        <PostFlightBriefing />
      </div>
    </AppProvider>
  );
}

export default App;