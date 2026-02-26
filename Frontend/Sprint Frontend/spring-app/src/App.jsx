import React, { useState, useEffect } from 'react';
import Login from './components/Login/Login';
import SprintDashboard from './components/sprint/SprintDashboard';
import HabitDashboard from './components/Habit/HabitDashboard';
import { authService } from './api';
import './App.css';

function App() {
  // 1. Initialize state from localStorage
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true');
  const [userId, setUserId] = useState(localStorage.getItem('userId'));

  // 2. Tab Navigation state
  const [activeTab, setActiveTab] = useState('sprints');

  // 3. Handle successful login
  const handleLoginSuccess = () => {
    // When login succeeds, we pull the newly saved values from localStorage
    setIsLoggedIn(true);
    setUserId(localStorage.getItem('userId'));
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      // Clean up all user data on logout
      localStorage.clear();
      setIsLoggedIn(false);
      setUserId(null);
    }
  };

  // If not logged in, show the Login component and pass the success handler
  if (!isLoggedIn) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="dashboard-layout">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <span className="icon">💎</span>
          <span className="label">MyLife</span>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === 'sprints' ? 'active' : ''}`}
            onClick={() => setActiveTab('sprints')}
            title="Sprints"
          >
            <span className="icon">🚀</span>
            <span className="label">Sprints</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'habits' ? 'active' : ''}`}
            onClick={() => setActiveTab('habits')}
            title="Habits"
          >
            <span className="icon">✅</span>
            <span className="label">Habits</span>
          </button>

          <button className="nav-item disabled" title="Exercise">
            <span className="icon">🏋️</span>
            <span className="label">Exercise</span>
          </button>

          <button className="nav-item disabled" title="Calendar">
            <span className="icon">📅</span>
            <span className="label">Calendar</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn" title="Logout">
            <span className="icon">🚪</span>
            <span className="label">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="content-header">
          <h1>
            {activeTab === 'sprints' ? 'Sprint Management' : 'Habit Tracker'}
          </h1>
          <div className="user-badge">
            {localStorage.getItem('username')}
          </div>
        </header>

        <section className="content-body">
          {activeTab === 'sprints' ? (
            /* Pass userId to Sprints if needed */
            <SprintDashboard userId={userId} />
          ) : (
            /* CRITICAL: Pass the userId prop to the HabitDashboard */
            <HabitDashboard userId={userId} />
          )}
        </section>
      </main>
    </div>
  );
}

export default App;