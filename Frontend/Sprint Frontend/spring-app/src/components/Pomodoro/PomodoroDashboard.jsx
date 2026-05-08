import React, { useState, useEffect, useRef } from 'react';
import { proxyService } from '../../api';

const NOTIFICATION_SOUND = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";

const PomodoroDashboard = ({ userId }) => {
    const [mode, setMode] = useState('FOCUS'); // 'FOCUS' or 'BREAK'
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [totalTime, setTotalTime] = useState(25 * 60); // Used to calculate progress percentage
    const [isRunning, setIsRunning] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [blockedSites, setBlockedSites] = useState([]);
    const [newSite, setNewSite] = useState('');
    const audioRef = useRef(new Audio(NOTIFICATION_SOUND));

    // Cleanup proxy on unmount
    useEffect(() => {
        loadSites();
        return () => { proxyService.stopFocus(userId); };
    }, [userId]);

    // Timer countdown logic
    useEffect(() => {
        let interval = null;
        if (isRunning && timeLeft > 0) {
            interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
        } else if (isRunning && timeLeft === 0) {
            handleComplete();
        }
        return () => clearInterval(interval);
    }, [isRunning, timeLeft]);

    const loadSites = async () => {
        try {
            const res = await proxyService.getSites(userId);
            setBlockedSites(res.data || []);
        } catch (error) { console.error("Error loading sites", error); }
    };

    const toggleTimer = async () => {
        if (!isRunning) {
            if (mode === 'FOCUS') await proxyService.startFocus(userId);
            setIsRunning(true);
        } else {
            if (mode === 'FOCUS') await proxyService.stopFocus(userId);
            setIsRunning(false);
        }
    };

    const triggerNotification = (title, body) => {
        if (Notification.permission === "granted") {
            new Notification(title, { body });
        } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") new Notification(title, { body });
            });
        }
    };

    const handleComplete = async () => {
        setIsRunning(false);
        audioRef.current.play();

        if (mode === 'FOCUS') {
            triggerNotification("Focus Time Complete!", "Great job! Time for a 5-minute break.");
            await proxyService.stopFocus(userId);
            setMode('BREAK');
            setTimeLeft(5 * 60);
            setTotalTime(5 * 60);
        } else {
            triggerNotification("Break Complete!", "Ready to focus again?");
            setMode('FOCUS');
            setTimeLeft(25 * 60);
            setTotalTime(25 * 60);
        }
    };

    const addSite = async (e) => {
        e.preventDefault(); if (!newSite) return;
        await proxyService.addSite({ userId, url: newSite });
        setNewSite(''); loadSites();
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    // Adjust time dynamically
    const adjustTime = (amountInMinutes) => {
        if (isRunning && amountInMinutes < 0) return;
        const amountInSeconds = amountInMinutes * 60;

        setTimeLeft(prev => {
            const newTime = Math.max(60, prev + amountInSeconds);
            // Keep totalTime in sync so the progress ring doesn't jump out of bounds
            setTotalTime(t => Math.max(60, t + amountInSeconds));
            return newTime;
        });
    };

    // --- SVG Progress Circle Math ---
    const circleRadius = 135; // Size of the ring
    const circleCircumference = 2 * Math.PI * circleRadius;
    const progressPercentage = timeLeft / totalTime;
    const strokeDashoffset = circleCircumference - (progressPercentage * circleCircumference);

    return (
        <div className="pomo-container">
            <div className="pomo-header">
                <h2>{mode === 'FOCUS' ? 'Pomodoro Focus' : 'Break Time'}</h2>
                <button className="settings-btn" onClick={() => setShowSettings(true)}>
                    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
                </button>
            </div>

            <div className="timer-wrapper">

                {/* SVG Animated Progress Ring */}
                <div className="timer-circle" style={{ border: 'none', position: 'relative' }}>

                    <svg width="300" height="300" style={{ position: 'absolute', transform: 'rotate(-90deg)', top: 0, left: 0 }}>
                        {/* Background track */}
                        <circle
                            cx="150" cy="150" r={circleRadius}
                            stroke="#e2e8f0" strokeWidth="10" fill="none"
                        />
                        {/* Colored moving progress track */}
                        <circle
                            cx="150" cy="150" r={circleRadius}
                            stroke={mode === 'FOCUS' ? 'var(--primary)' : 'var(--success)'}
                            strokeWidth="10"
                            fill="none"
                            strokeLinecap="round"
                            strokeDasharray={circleCircumference}
                            strokeDashoffset={strokeDashoffset}
                            style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s ease' }}
                        />
                    </svg>

                    {/* Timer Controls (Z-index ensures they are clickable above the SVG) */}
                    <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                        {!isRunning && (
                            <button className="time-adjust minus" style={{ position: 'absolute', left: '30px' }} onClick={() => adjustTime(-5)}>-</button>
                        )}

                        <div className="time-display" style={{ color: mode === 'BREAK' ? 'var(--success)' : 'var(--primary-dark)' }}>
                            {formatTime(timeLeft)}
                        </div>

                        <button className="time-adjust plus" style={{ position: 'absolute', right: '30px' }} onClick={() => adjustTime(5)}>+</button>
                    </div>
                </div>

                <button
                    className={`control-btn ${isRunning ? 'paused' : 'started'}`}
                    onClick={toggleTimer}
                    style={mode === 'BREAK' && !isRunning ? { backgroundColor: 'var(--success)' } : {}}
                >
                    {isRunning ? 'Pause' : 'Start'}
                </button>
            </div>

            {/* --- Settings Modal --- */}
            {showSettings && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Focus Mode Setup</h3>
                        </div>

                        <div style={{ background: 'var(--bg-main)', padding: '15px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px' }}>
                            <p style={{ margin: '0 0 10px 0' }}><strong>1-Time Setup:</strong> Paste this URL into your computer's "Automatic Proxy Configuration" settings:</p>
                            <input type="text" readOnly value={proxyService.getPacUrl(userId)} onClick={(e) => e.target.select()} style={{ width: '100%', padding: '8px', fontFamily: 'monospace', borderRadius: '4px', border: '1px solid var(--border)' }} />
                        </div>

                        <h4 style={{ marginTop: '20px', marginBottom: '10px' }}>Blocked Sites</h4>
                        <form onSubmit={addSite} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                            <input type="text" placeholder="e.g., youtube.com" value={newSite} onChange={(e) => setNewSite(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }} />
                            <button type="submit" className="btn-primary">Add</button>
                        </form>

                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, maxHeight: '200px', overflowY: 'auto' }}>
                            {blockedSites.map(site => (
                                <li key={site.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                                    <span>{site.url}</span>
                                    <button onClick={() => proxyService.deleteSite(site.id)} className="btn-delete">Remove</button>
                                </li>
                            ))}
                        </ul>

                        <div className="modal-actions">
                            <button className="btn-secondary" onClick={() => setShowSettings(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PomodoroDashboard;