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
      <div className="container" style={{ margin: '0 auto', maxWidth: '1280px', padding: '2rem', textAlign: 'center' }}>
        <div>
          <a href="https://vitejs.dev" target="_blank" rel="noreferrer">
            <img src="/vite.svg" className="logo" alt="Vite logo" style={{ height: '6em', padding: '1.5em', willChange: 'filter', transition: 'filter 300ms' }} />
          </a>
          <a href="https://react.dev" target="_blank" rel="noreferrer">
            <img src="/logo.png" className="logo react" alt="React logo" style={{ height: '6em', padding: '1.5em', willChange: 'filter', transition: 'filter 300ms' }} />
          </a>
        </div>
        <h1>Vite + React</h1>

        {/* Navigation */}
        <div style={{ margin: '2rem 0', display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {navigation.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              style={{
                backgroundColor: currentPage === item.id ? '#646cff' : '#1a1a1a',
                color: 'white'
              }}
            >
              {item.name}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div style={{ padding: '2rem', textAlign: 'left' }}>
          {renderPage()}
        </div>

        <p className="read-the-docs" style={{ color: '#888', marginTop: '2rem' }}>
          Click on the Vite and React logos to learn more
        </p>

        <PostFlightBriefing />
      </div>
    </AppProvider>
  );
}

export default App;