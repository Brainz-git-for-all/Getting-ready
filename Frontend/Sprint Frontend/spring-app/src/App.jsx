import React, { useState } from 'react';
import Login from './components/Login/Login';
import SprintDashboard from './components/sprint/SprintDashboard';
import { authService } from './api';

function App() {
  // We check if a username exists in storage to persist the UI state
  const [user, setUser] = useState(localStorage.getItem('username'));

  const handleLogout = async () => {
    await authService.logout(); // Tells backend to clear the cookie
    localStorage.clear();
    setUser(null);
  };

  return (
    <div className="app-container">
      {!user ? (
        <Login onLoginSuccess={() => setUser(localStorage.getItem('username'))} />
      ) : (
        <>
          <nav className="top-nav">
            <span>Logged in as: <strong>{user}</strong></span>
            <button onClick={handleLogout}>Logout</button>
          </nav>
          <SprintDashboard />
        </>
      )}
    </div>
  );
}

export default App;