import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { habitService } from '../../api';
import './HabitDashboard.css';

const HabitDashboard = ({ userId }) => {
    const [habits, setHabits] = useState([]);
    const [completedIds, setCompletedIds] = useState([]);
    const today = new Date().toISOString().split('T')[0];
    const navigate = useNavigate();

    useEffect(() => {
        const loadData = async () => {
            try {
                const hRes = await habitService.getAll();
                const sRes = await habitService.getTodaysLog(userId, today);
                setHabits(hRes.data);
                if (sRes.data?.completedHabitIds) {
                    setCompletedIds(sRes.data.completedHabitIds);
                }
            } catch (err) {
                console.error("Dashboard load failed:", err);
            }
        };
        loadData();
    }, [userId, today]);

    const progress = habits.length > 0
        ? Math.round((completedIds.length / habits.length) * 100)
        : 0;

    const handleToggle = (id) => {
        setCompletedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const saveProgress = async () => {
        try {
            await habitService.saveTodaysLog(userId, completedIds);
            alert("Progress saved!");
        } catch (err) {
            alert("Failed to save log");
        }
    };

    return (
        <div className="dashboard-container">
            {/* Navigation Header */}
            <div className="dashboard-header">
                <h2>Daily Habits</h2>
                <button className="btn-open-modal" onClick={() => navigate('/settings')}>
                    ⚙️ Edit Habits
                </button>
            </div>

            {/* Progress Visualization */}
            <div className="viz-card">
                <h3>{progress === 100 ? "All Done! 🎉" : "Today's Progress"}</h3>
                <div className="progress-container">
                    <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                </div>
                <p>{progress}% of habits completed</p>
            </div>

            {/* Interactive Grid */}
            <div className="habit-grid">
                {habits.map(h => (
                    <div
                        key={h.id}
                        className={`habit-box ${completedIds.includes(h.id) ? 'active' : ''}`}
                        onClick={() => handleToggle(h.id)}
                    >
                        <span className="check-icon">
                            {completedIds.includes(h.id) ? '✓' : ''}
                        </span>
                        <p>{h.name}</p>
                    </div>
                ))}
            </div>

            <button className="btn-submit" onClick={saveProgress} style={{ marginTop: '2rem' }}>
                Finish Day
            </button>
        </div>
    );
};

export default HabitDashboard;