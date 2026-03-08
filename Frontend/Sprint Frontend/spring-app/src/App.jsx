import React, { useState } from 'react';
import Login from './components/Login/Login';
import MainDashboard from './components/MainDashboard/MainDashboard';
import SprintDashboard from './components/sprint/SprintDashboard';
import HabitDashboard from './components/Habit/HabitDashboard';
import LinkDashboard from './components/Link/LinkDashboard';
import ReminderDashboard from './components/Reminder/ReminderDashboard'; // <-- NEW IMPORT
import { authService } from './api';
import './App.css';

const Icons = {
  Dashboard: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>),
  Sprints: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>),
  Habits: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>),
  Links: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>),
  // <-- NEW BELL ICON FOR REMINDERS
  Reminders: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>),
  Logout: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>)
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true');
  const [userId, setUserId] = useState(localStorage.getItem('userId'));
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setUserId(localStorage.getItem('userId'));
  };

  const handleLogout = async () => {
    try { await authService.logout(); } finally {
      localStorage.clear();
      setIsLoggedIn(false);
      setUserId(null);
    }
  };

  if (!isLoggedIn) return <Login onLoginSuccess={handleLoginSuccess} />;

  return (
    <div className="app-container">
      <aside className="sidebar-modern">
        <div className="sidebar-brand">
          <div className="brand-logo">M</div>
          <span className="brand-name">MY SPACE</span>
        </div>

        <nav className="nav-list">
          <button className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <Icons.Dashboard /> <span>Overview</span>
          </button>
          <button className={`nav-link ${activeTab === 'sprints' ? 'active' : ''}`} onClick={() => setActiveTab('sprints')}>
            <Icons.Sprints /> <span>Sprints</span>
          </button>
          <button className={`nav-link ${activeTab === 'habits' ? 'active' : ''}`} onClick={() => setActiveTab('habits')}>
            <Icons.Habits /> <span>Habits</span>
          </button>
          <button className={`nav-link ${activeTab === 'links' ? 'active' : ''}`} onClick={() => setActiveTab('links')}>
            <Icons.Links /> <span>Saved Links</span>
          </button>
          {/* NEW REMINDERS TAB */}
          <button className={`nav-link ${activeTab === 'reminders' ? 'active' : ''}`} onClick={() => setActiveTab('reminders')}>
            <Icons.Reminders /> <span>Reminders</span>
          </button>
        </nav>

        <div className="sidebar-bottom">
          <button className="nav-link logout-link" onClick={handleLogout}>
            <Icons.Logout /> <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="main-viewport">
        <header className="viewport-header">
          <div className="header-title">
            <h2>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Dashboard</h2>
            <p>Welcome back, {localStorage.getItem('username')}</p>
          </div>
          <div className="user-profile">
            <div className="avatar">{localStorage.getItem('username')?.charAt(0)?.toUpperCase() || 'U'}</div>
          </div>
        </header>

        <section className="viewport-content">
          {activeTab === 'dashboard' && <MainDashboard userId={userId} />}
          {activeTab === 'sprints' && <SprintDashboard userId={userId} />}
          {activeTab === 'habits' && <HabitDashboard userId={userId} />}
          {activeTab === 'links' && <LinkDashboard userId={userId} />}
          {/* NEW REMINDERS VIEW */}
          {activeTab === 'reminders' && <ReminderDashboard userId={userId} />}
        </section>
      </main>
    </div>
  );
}

export default App;