import React, { useState } from 'react';
import Login from './components/Login/Login';
import SprintDashboard from './components/sprint/SprintDashboard';
import HabitDashboard from './components/Habit/HabitDashboard';
import { authService } from './api';
import './App.css';

function App() {
  // Check if user is logged in based on localStorage
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true');

  // Track which module is currently displayed in the main area
  const [activeTab, setActiveTab] = useState('sprints');

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      // Clean up local storage and reset state
      localStorage.clear();
      setIsLoggedIn(false);
    }
  };

  // If not logged in, show the Login component
  if (!isLoggedIn) {
    return <Login onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="dashboard-layout">
      {/* Sidebar Navigation - Collapsed by default, expands on hover */}
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

          {/* Placeholder icons for future expansion */}
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
            <SprintDashboard />
          ) : (
            <HabitDashboard />
          )}
        </section>
      </main>
    </div>
  );
}

export default App;