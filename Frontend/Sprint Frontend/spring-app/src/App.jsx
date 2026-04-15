import React, { useState } from 'react';
import MainDashboard from './components/MainDashboard/MainDashboard';
import SprintDashboard from './components/sprint/SprintDashboard';
import HabitDashboard from './components/Habit/HabitDashboard';
import ScheduleDashboard from './components/Schedule/ScheduleDashboard';
import PomodoroDashboard from './components/Pomodoro/PomodoroDashboard';
import Login from './components/login/Login';
import Register from './components/login/Register';
import AlertSystem from './components/AlertSystem'; // <-- NEW
import { authService } from './api';
import './App.css';

const Icons = {
  Dashboard: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>),
  Sprints: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>),
  Habits: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>),
  Schedule: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>),
  Timer: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>),
  Logout: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>)
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true');
  const [userId, setUserId] = useState(localStorage.getItem('userId'));
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showRegister, setShowRegister] = useState(false);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setUserId(localStorage.getItem('userId'));
    setActiveTab('dashboard');
  };

  const handleLogout = async () => {
    try { await authService.logout(); } finally {
      localStorage.clear();
      setIsLoggedIn(false);
      setUserId(null);
    }
  };

  if (!isLoggedIn) {
    if (showRegister) return <Register onLoginSuccess={handleLoginSuccess} onSwitchToLogin={() => setShowRegister(false)} />;
    return <Login onLoginSuccess={handleLoginSuccess} onSwitchToRegister={() => setShowRegister(true)} />;
  }

  return (
    <div className="app-container">
      <AlertSystem /> {/* <-- Custom Alert Modal Container */}
      <aside className="sidebar-modern">
        <div className="sidebar-brand">
          <div className="brand-logo">M</div>
          <span className="brand-name">MY SPACE</span>
        </div>
        <nav className="nav-list">
          <button className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}><Icons.Dashboard /> <span>Overview</span></button>
          <button className={`nav-link ${activeTab === 'schedule' ? 'active' : ''}`} onClick={() => setActiveTab('schedule')}><Icons.Schedule /> <span>Schedule</span></button>
          <button className={`nav-link ${activeTab === 'sprints' ? 'active' : ''}`} onClick={() => setActiveTab('sprints')}><Icons.Sprints /> <span>Sprints</span></button>
          <button className={`nav-link ${activeTab === 'habits' ? 'active' : ''}`} onClick={() => setActiveTab('habits')}><Icons.Habits /> <span>Habits</span></button>
          <button className={`nav-link ${activeTab === 'pomodoro' ? 'active' : ''}`} onClick={() => setActiveTab('pomodoro')}><Icons.Timer /> <span>Focus Time</span></button>
        </nav>
        <div className="sidebar-bottom" style={{ marginTop: 'auto' }}>
          <button className="nav-link logout-link" onClick={handleLogout}><Icons.Logout /> <span>Sign Out</span></button>
        </div>
      </aside>

      <main className="main-viewport">
        <header className="viewport-header">
          <div className="header-title">
            <h2>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Dashboard</h2>
            <p>Welcome back, {localStorage.getItem('username')}</p>
          </div>
          <div className="user-profile" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {activeTab === 'schedule' && (
              <div className="global-schedule-actions" style={{ display: 'flex', gap: '8px' }}>
                <button className="btn-secondary" onClick={() => window.dispatchEvent(new CustomEvent('toggle-cat-view'))}>Categories</button>
                <button className="btn-primary" onClick={() => window.dispatchEvent(new CustomEvent('open-block-modal'))}>+ Block</button>
              </div>
            )}
            <div className="avatar">{localStorage.getItem('username')?.charAt(0)?.toUpperCase() || 'U'}</div>
          </div>
        </header>
        <section className="viewport-content">
          {activeTab === 'dashboard' && <MainDashboard userId={userId} />}
          {activeTab === 'schedule' && <ScheduleDashboard userId={userId} />}
          {activeTab === 'sprints' && <SprintDashboard userId={userId} />}
          {activeTab === 'habits' && <HabitDashboard userId={userId} />}
          {activeTab === 'pomodoro' && <PomodoroDashboard userId={userId} />}
        </section>
      </main>
    </div>
  );
}

export default App;