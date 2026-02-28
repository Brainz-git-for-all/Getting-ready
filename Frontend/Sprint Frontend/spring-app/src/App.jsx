import React, { useState, useEffect } from 'react';
import Login from './components/Login/Login';
import MainDashboard from './components/MainDashboard/MainDashboard'; // <--- NEW
import SprintDashboard from './components/sprint/SprintDashboard';
import HabitDashboard from './components/Habit/HabitDashboard';
import { authService } from './api';
import './App.css';

function App() {
  const storedUserId = localStorage.getItem('userId');
  const initialUserId = (storedUserId !== 'null' && storedUserId !== 'undefined') ? storedUserId : null;

  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true');
  const [userId, setUserId] = useState(initialUserId);

  // <--- Set 'dashboard' as the default view
  const [activeTab, setActiveTab] = useState('dashboard');

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
          {/* <--- NEW Dashboard Nav Item */}
          <button
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
            title="Dashboard"
          >
            <span className="icon">📊</span>
            <span className="label">Dashboard</span>
          </button>

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
            {activeTab === 'dashboard' ? 'Overview Dashboard' :
              activeTab === 'sprints' ? 'Sprint Management' : 'Habit Tracker'}
          </h1>
          <div className="user-badge">
            {localStorage.getItem('username') || 'User'}
          </div>
        </header>

        <section className="content-body">
          {/* <--- Render Dashboard Component */}
          {activeTab === 'dashboard' ? (
            <MainDashboard userId={userId} />
          ) : activeTab === 'sprints' ? (
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