import React, { useState } from 'react';
import Login from './components/Login/Login';
import SprintDashboard from './components/sprint/SprintDashboard';
import { authService } from './api';
import './App.css';

function App() {
  // Single source of truth for authentication
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true');

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      localStorage.clear();
      setIsLoggedIn(false);
    }
  };

  if (!isLoggedIn) {
    return <Login onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="app-container">
      <nav className="top-nav">
        <div className="nav-user">
          <span>User: <strong>{localStorage.getItem('username') || 'Guest'}</strong></span>
        </div>
        <button onClick={handleLogout} className="btn-logout">Logout</button>
      </nav>
      <main>
        <SprintDashboard />
      </main>
    </div>
  );
}

export default App;