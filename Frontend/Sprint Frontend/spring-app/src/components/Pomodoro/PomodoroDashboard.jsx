import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { proxyService } from '../../api';

const SUCCESS_SOUND = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";
const FAIL_SOUND = "https://assets.mixkit.co/active_storage/sfx/2955/2955-preview.mp3";

// Simple Local XP Engine
export const xpEngine = {
    add: (userId, amount, isPenalty = false) => {
        const today = new Date().toISOString().split('T')[0];
        let totalXp = parseInt(localStorage.getItem(`xp_total_${userId}`) || '0');
        totalXp = Math.max(0, totalXp + amount);
        localStorage.setItem(`xp_total_${userId}`, totalXp);

        let dailyStats = JSON.parse(localStorage.getItem(`xp_daily_${userId}_${today}`) || '{"earned": 0, "lost": 0}');
        if (isPenalty) dailyStats.lost += Math.abs(amount);
        else dailyStats.earned += amount;
        localStorage.setItem(`xp_daily_${userId}_${today}`, JSON.stringify(dailyStats));

        return totalXp;
    }
};

const PomodoroDashboard = ({ userId }) => {
    const [mode, setMode] = useState('FOCUS');
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [totalTime, setTotalTime] = useState(25 * 60);
    const [isRunning, setIsRunning] = useState(false);

    // NEW: Streak Tracker
    const [focusStreak, setFocusStreak] = useState(0);

    const successAudio = useRef(new Audio(SUCCESS_SOUND));
    const failAudio = useRef(new Audio(FAIL_SOUND));

    // Calculate current XP reward based on streak
    const calculateXpReward = () => {
        const base = 50;
        const bonus = focusStreak > 0 ? (focusStreak * 15) : 0;
        return base + bonus;
    };

    // STRICT MODE: Tab Visibility Tracker
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden && isRunning && mode === 'FOCUS') {
                setIsRunning(false);
                failAudio.current.play();
                xpEngine.add(userId, -20, true);

                // Reset Streak!
                setFocusStreak(0);

                alert("❌ STRICT MODE: You switched tabs!\nPenalty: -20 XP.\nStreak Reset to 0.\nFocus timer has been reset.");

                setTimeLeft(25 * 60);
                setTotalTime(25 * 60);
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    }, [isRunning, mode, userId]);

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

    const toggleTimer = async () => {
        if (!isRunning) setIsRunning(true);
        else setIsRunning(false);
    };

    const triggerDopamine = (isLongBreak) => {
        successAudio.current.play();
        // Bigger confetti explosion for a long break!
        confetti({
            particleCount: isLongBreak ? 300 : 150,
            spread: isLongBreak ? 100 : 70,
            origin: { y: 0.6 },
            colors: ['#4f46e5', '#10b981', '#f59e0b', '#ec4899']
        });
    };

    const handleComplete = async () => {
        setIsRunning(false);

        if (mode === 'FOCUS') {
            const newStreak = focusStreak + 1;
            setFocusStreak(newStreak);

            const xpEarned = calculateXpReward();
            xpEngine.add(userId, xpEarned, false);

            // Standard Pomodoro: Every 4th session = 15 min break. Otherwise 5 mins.
            const isLongBreak = (newStreak % 4 === 0);
            const breakMinutes = isLongBreak ? 15 : 5;

            triggerDopamine(isLongBreak);

            if (Notification.permission === "granted") {
                new Notification("Focus Complete! 🔥", {
                    body: `+${xpEarned} XP Earned! Streak: ${newStreak}\nTime for a ${breakMinutes}-minute break.`
                });
            }

            setMode('BREAK');
            setTimeLeft(breakMinutes * 60);
            setTotalTime(breakMinutes * 60);
        } else {
            successAudio.current.play();
            if (Notification.permission === "granted") new Notification("Break Over!", { body: "Ready to keep the streak going?" });

            setMode('FOCUS');
            setTimeLeft(25 * 60);
            setTotalTime(25 * 60);
        }
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const adjustTime = (amountInMinutes) => {
        if (isRunning && amountInMinutes < 0) return;
        const amountInSeconds = amountInMinutes * 60;
        setTimeLeft(prev => {
            const newTime = Math.max(60, prev + amountInSeconds);
            setTotalTime(t => Math.max(60, t + amountInSeconds));
            return newTime;
        });
    };

    const circleRadius = 135;
    const circleCircumference = 2 * Math.PI * circleRadius;
    const progressPercentage = timeLeft / totalTime;
    const strokeDashoffset = circleCircumference - (progressPercentage * circleCircumference);

    return (
        <div className="pomo-container">
            <div className="pomo-header" style={{ flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <h2 style={{ margin: 0 }}>{mode === 'FOCUS' ? 'Pomodoro (Strict Mode)' : 'Break Time'}</h2>
                    {focusStreak > 0 && (
                        <div style={{ background: '#ffedd5', color: '#ea580c', padding: '4px 12px', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            🔥 Streak: {focusStreak}
                        </div>
                    )}
                </div>

                {/* Dynamic Reward Banner */}
                <div style={{ background: mode === 'FOCUS' ? '#e0e7ff' : '#dcfce7', color: mode === 'FOCUS' ? '#4338ca' : '#16a34a', padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold', width: '100%', textAlign: 'center' }}>
                    {mode === 'FOCUS' ? `Current Reward: +${calculateXpReward()} XP` : (totalTime > 300 ? '🎉 Long Break Earned! Relax.' : 'Quick 5 min breather...')}
                </div>
            </div>

            <div className="timer-wrapper" style={{ marginTop: '20px' }}>
                <div className="timer-circle" style={{ border: 'none', position: 'relative' }}>
                    <svg width="300" height="300" style={{ position: 'absolute', transform: 'rotate(-90deg)', top: 0, left: 0 }}>
                        <circle cx="150" cy="150" r={circleRadius} stroke="#e2e8f0" strokeWidth="10" fill="none" />
                        <circle
                            cx="150" cy="150" r={circleRadius}
                            stroke={mode === 'FOCUS' ? 'var(--primary)' : 'var(--success)'}
                            strokeWidth="10" fill="none" strokeLinecap="round"
                            strokeDasharray={circleCircumference} strokeDashoffset={strokeDashoffset}
                            style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s ease' }}
                        />
                    </svg>

                    <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                        {!isRunning && <button className="time-adjust minus" style={{ position: 'absolute', left: '30px' }} onClick={() => adjustTime(-5)}>-</button>}
                        <div className="time-display" style={{ color: mode === 'BREAK' ? 'var(--success)' : 'var(--primary-dark)' }}>
                            {formatTime(timeLeft)}
                        </div>
                        <button className="time-adjust plus" style={{ position: 'absolute', right: '30px' }} onClick={() => adjustTime(5)}>+</button>
                    </div>
                </div>

                <button className={`control-btn ${isRunning ? 'paused' : 'started'}`} onClick={toggleTimer} style={mode === 'BREAK' && !isRunning ? { backgroundColor: 'var(--success)' } : {}}>
                    {isRunning ? 'Pause' : 'Start Focus'}
                </button>
                <p style={{ marginTop: '15px', color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center' }}>
                    ⚠️ Switching tabs will reset your 🔥 streak to 0!
                </p>
            </div>
        </div>
    );
};

export default PomodoroDashboard;