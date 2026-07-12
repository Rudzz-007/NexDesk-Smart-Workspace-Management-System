import React, { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { authService } from './api/authService';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Sync state on boot with current local storage token context
  useEffect(() => {
    setIsAuthenticated(authService.isAuthenticated());
  }, []);

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-6">
      <div className="max-w-xl w-full bg-white rounded-2xl p-8 shadow-xl border border-slate-100 text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 mb-2">
          🔓
        </div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">
          Welcome to NexDesk Terminal
        </h1>
        <p className="text-slate-500 max-w-sm mx-auto">
          Your cryptographic authentication token is active. The workspace control network is ready for orchestration.
        </p>
        <div className="pt-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl transition shadow-md"
          >
            Disconnect Terminal
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
