import React, { useState } from 'react';
import MainDashboard from './components/MainDashboard/MainDashboard';
import SprintDashboard from './components/sprint/SprintDashboard';
import QuickTaskDashboard from './components/sprint/QuickTaskDashboard';
import HabitDashboard from './components/Habit/HabitDashboard';
import ScheduleDashboard from './components/Schedule/ScheduleDashboard';
import CalendarDashboard from './components/Schedule/CalendarDashboard';
import PomodoroDashboard from './components/Pomodoro/PomodoroDashboard';
import TipsDashboard from './components/tips/TipsDashboard'; // <-- NEW IMPORT
import InnovationDashboard from './components/Innovation/InnovationDashboard';
import FocusYouTubePlayer from './components/YouTube/FocusYouTubePlayer';
import Login from './components/login/Login';
import Register from './components/login/Register';
import AlertSystem from './components/AlertSystem';
import NotificationEngine from './components/NotificationEngine';
import SprintBot from './components/bot/SprintBot ';
import { authService } from './api';
import './App.css';

const Icons = {
  Dashboard: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>),
  Sprints: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>),
  Habits: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>),
  Schedule: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>),
  Calendar: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line><path d="M8 14h.01"></path><path d="M12 14h.01"></path><path d="M16 14h.01"></path><path d="M8 18h.01"></path><path d="M12 18h.01"></path><path d="M16 18h.01"></path></svg>),
  QuickTasks: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>),
  Timer: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>),
  Tips: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18h6" /><path d="M10 22h4" /><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 1 0 6 8c0 1.5.8 2.82 2.5 3.5.76.76 1.23 1.52 1.41 2.5z" /></svg>), // <-- NEW ICON
  Innovations: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z"></path><line x1="9" y1="21" x2="15" y2="21"></line><line x1="10" y1="17" x2="14" y2="17"></line></svg>),
  YouTube: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"></path><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"></polygon></svg>),
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
      <AlertSystem />
      <NotificationEngine userId={userId} />
      <SprintBot userId={userId} />

      <aside className="sidebar-modern">
        <div className="sidebar-brand">
          <div className="brand-logo">S</div>
          <span className="brand-name">SPRINT APP</span>
        </div>
        <nav className="nav-list">
          <button className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}><Icons.Dashboard /> <span>Overview</span></button>
          <button className={`nav-link ${activeTab === 'schedule' ? 'active' : ''}`} onClick={() => setActiveTab('schedule')}><Icons.Schedule /> <span>Schedule</span></button>
          <button className={`nav-link ${activeTab === 'calendar' ? 'active' : ''}`} onClick={() => setActiveTab('calendar')}><Icons.Calendar /> <span>Calendar</span></button>
          <button className={`nav-link ${activeTab === 'sprints' ? 'active' : ''}`} onClick={() => setActiveTab('sprints')}><Icons.Sprints /> <span>Sprints</span></button>
          <button className={`nav-link ${activeTab === 'quicktasks' ? 'active' : ''}`} onClick={() => setActiveTab('quicktasks')}><Icons.QuickTasks /> <span>Quick Tasks</span></button>
          <button className={`nav-link ${activeTab === 'habits' ? 'active' : ''}`} onClick={() => setActiveTab('habits')}><Icons.Habits /> <span>Habits</span></button>
          <button className={`nav-link ${activeTab === 'pomodoro' ? 'active' : ''}`} onClick={() => setActiveTab('pomodoro')}><Icons.Timer /> <span>Focus Time</span></button>
          <button className={`nav-link ${activeTab === 'tips' ? 'active' : ''}`} onClick={() => setActiveTab('tips')}><Icons.Tips /> <span>AI Tips</span></button>
          <button className={`nav-link ${activeTab === 'innovations' ? 'active' : ''}`} onClick={() => setActiveTab('innovations')}><Icons.Innovations /> <span>Innovations</span></button>
          <button className={`nav-link ${activeTab === 'youtube' ? 'active' : ''}`} onClick={() => setActiveTab('youtube')}><Icons.YouTube /> <span>Focus Watch</span></button>
        </nav>
        <div className="sidebar-bottom" style={{ marginTop: 'auto' }}>
          <button className="nav-link logout-link" onClick={handleLogout}><Icons.Logout /> <span>Sign Out</span></button>
        </div>
      </aside>

      <main className="main-viewport">
        <header className="viewport-header">
          <div className="header-title">
            <h2>{{ dashboard: 'Main Dashboard', schedule: 'Schedule Dashboard', calendar: 'Calendar', sprints: 'Sprints Dashboard', quicktasks: 'Quick Tasks', habits: 'Habits Dashboard', pomodoro: 'Focus Timer', tips: 'AI Tips', innovations: 'Innovations & Thoughts', youtube: 'Focus Watch' }[activeTab] || activeTab}</h2>
            <p>Welcome back, {localStorage.getItem('username')}</p>
          </div>
          <div className="user-profile" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {activeTab === 'schedule' && (
              <div className="global-schedule-actions" style={{ display: 'flex', gap: '8px' }}>
                <button className="btn-primary" onClick={() => window.dispatchEvent(new CustomEvent('open-block-modal'))}>+ Schedule Block</button>
              </div>
            )}
            <div className="avatar">{localStorage.getItem('username')?.charAt(0)?.toUpperCase() || 'U'}</div>
          </div>
        </header>
        <section className="viewport-content">
          {activeTab === 'dashboard' && <MainDashboard userId={userId} />}
          {activeTab === 'schedule' && <ScheduleDashboard userId={userId} />}
          {activeTab === 'calendar' && <CalendarDashboard userId={userId} />}
          {activeTab === 'sprints' && <SprintDashboard userId={userId} />}
          {activeTab === 'quicktasks' && <QuickTaskDashboard userId={userId} />}
          {activeTab === 'habits' && <HabitDashboard userId={userId} />}
          {/* Always mounted so the timer never resets on tab switch */}
          <div style={{ display: activeTab === 'pomodoro' ? 'block' : 'none' }}>
            <PomodoroDashboard userId={userId} />
          </div>
          {activeTab === 'tips' && <TipsDashboard userId={userId} />}
          {activeTab === 'innovations' && <InnovationDashboard userId={userId} />}
          {activeTab === 'youtube' && <FocusYouTubePlayer />}
        </section>
      </main>
    </div>
  );
}

export default App;