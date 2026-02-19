import React, { useState, useEffect } from 'react';
import Login from '../Login/Login';
import SprintDashboard from '../sprint/SprintDashboard';
import { authService } from '../../api';
import '../../App';

function App() {
    // Start with whatever is in localStorage, but we will verify it
    const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogout = async () => {
        try {
            await authService.logout();
        } catch (err) {
            console.error("Logout cleanup on server failed, clearing local state anyway.");
        } finally {
            localStorage.clear();
            setIsLoggedIn(false);
        }
    };

    // This ensures the app doesn't break if a 404 occurs
    if (!isLoggedIn) {
        return <Login onLoginSuccess={() => setIsLoggedIn(true)} />;
    }

    return (
        <div className="app-wrapper">
            <nav className="top-nav">
                <div className="nav-user">
                    <span>User: <strong>{localStorage.getItem('username') || 'Guest'}</strong></span>
                </div>
                <button onClick={handleLogout} className="btn-logout">Logout</button>
            </nav>
            <SprintDashboard />
        </div>
    );
}

export default App;