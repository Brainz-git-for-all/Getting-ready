import React, { useState, useEffect } from 'react';
import Login from './components/Login/Login';
import SprintDashboard from './components/sprint/SprintDashboard';
import HabitDashboard from './components/Habit/HabitDashboard';
import { authService } from './api';
import './App.css';

function App() {
  // FIXED: Safely parse localStorage so we don't accidentally use the string "null"
  const storedUserId = localStorage.getItem('userId');
  const initialUserId = (storedUserId !== 'null' && storedUserId !== 'undefined') ? storedUserId : null;

  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true');
  const [userId, setUserId] = useState(initialUserId);
  const [activeTab, setActiveTab] = useState('sprints');

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setUserId(localStorage.getItem('userId'));
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      localStorage.clear();
      setIsLoggedIn(false);
      setUserId(null);
    }
  };

  if (!isLoggedIn) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="dashboard-layout">
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

      <main className="main-content">
        <header className="content-header">
          <h1>
            {activeTab === 'sprints' ? 'Sprint Management' : 'Habit Tracker'}
          </h1>
          <div className="user-badge">
            {localStorage.getItem('username') || 'User'}
          </div>
        </header>

        <section className="content-body">
          {activeTab === 'sprints' ? (
            <SprintDashboard userId={userId} />
          ) : (
            <HabitDashboard userId={userId} />
          )}
        </section>
      </main>
    </div>
  );
}

export default App;