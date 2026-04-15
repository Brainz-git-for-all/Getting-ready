import React, { useState, useEffect, useRef } from 'react';
import { proxyService } from '../../api';

const NOTIFICATION_SOUND = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";

const PomodoroDashboard = ({ userId }) => {
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isRunning, setIsRunning] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [blockedSites, setBlockedSites] = useState([]);
    const [newSite, setNewSite] = useState('');
    const audioRef = useRef(new Audio(NOTIFICATION_SOUND));

    useEffect(() => { loadSites(); return () => { if (isRunning) proxyService.stopFocus(userId); }; }, []);

    useEffect(() => {
        let interval = null;
        if (isRunning && timeLeft > 0) { interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000); }
        else if (isRunning && timeLeft === 0) { handleComplete(); }
        return () => clearInterval(interval);
    }, [isRunning, timeLeft]);

    const loadSites = async () => {
        try {
            const res = await proxyService.getSites(userId);
            setBlockedSites(res.data || []);
        } catch (error) { console.error("Error loading sites", error); }
    };

    const toggleTimer = async () => {
        if (!isRunning) { await proxyService.startFocus(userId); setIsRunning(true); }
        else { await proxyService.stopFocus(userId); setIsRunning(false); }
    };

    const handleComplete = async () => {
        setIsRunning(false); audioRef.current.play();
        if (Notification.permission === "granted") { new Notification("Focus Time Complete!", { body: "Great job! Time for a break." }); }
        else if (Notification.permission !== "denied") { Notification.requestPermission().then(permission => { if (permission === "granted") new Notification("Focus Time Complete!"); }); }
        await proxyService.stopFocus(userId);
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

    const adjustTime = (amountInMinutes) => { if (!isRunning) setTimeLeft(prev => Math.max(60, prev + (amountInMinutes * 60))); };

    return (
        <div className="pomo-container">
            <div className="pomo-header">
                <h2>Pomodoro Focus</h2>
                <button className="settings-btn" onClick={() => setShowSettings(true)}>
                    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
                </button>
            </div>

            <div className="timer-wrapper">
                <div className="timer-circle">
                    {!isRunning && <button className="time-adjust minus" onClick={() => adjustTime(-5)}>-</button>}
                    <div className="time-display">{formatTime(timeLeft)}</div>
                    {!isRunning && <button className="time-adjust plus" onClick={() => adjustTime(5)}>+</button>}
                </div>
                <button className={`control-btn ${isRunning ? 'paused' : 'started'}`} onClick={toggleTimer}>
                    {isRunning ? 'Pause' : 'Start'}
                </button>
            </div>

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