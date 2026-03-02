import React, { useState, useEffect } from 'react';
import { habitService } from '../../api';

const DailyLogForm = ({ userId, habits, onClose }) => {
    const [selectedIds, setSelectedIds] = useState([]);
    const [isSaving, setIsSaving] = useState(false);

    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        const fetchToday = async () => {
            try {
                const res = await habitService.getTodaysLog(userId, today);
                if (res.data && res.data.completedHabitIds) {
                    setSelectedIds(res.data.completedHabitIds);
                }
            } catch (err) {
                console.error("Could not fetch today's log", err);
            }
        };
        fetchToday();
    }, [userId, today]);

    const toggleHabit = (id) => {
        setSelectedIds(prev =>
            prev.includes(id)
                ? prev.filter(habitId => habitId !== id)
                : [...prev, id]
        );
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await habitService.saveTodaysLog(userId, today, selectedIds);
            onClose();
        } catch (err) {
            console.error("Save failed", err);
            alert("Error saving your progress.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="form-card">
            <header className="main-header">
                <h3>Daily Log</h3>
                <p className="subtitle">Tick the habits you completed today ({today})</p>
            </header>

            <div className="table-wrapper" style={{ marginBottom: '20px' }}>
                {habits.length === 0 ? (
                    <p style={{ padding: '20px', color: '#6b7280' }}>No habits created yet.</p>
                ) : (
                    habits.map(habit => (
                        <label key={habit.id} className="checkbox-row">
                            <input
                                type="checkbox"
                                checked={selectedIds.includes(habit.id)}
                                onChange={() => toggleHabit(habit.id)}
                            />
                            <span className="sprint-name">{habit.name}</span>
                        </label>
                    ))
                )}
            </div>

            <div className="action-bar">
                <button
                    className="btn-secondary"
                    onClick={onClose}
                    disabled={isSaving}
                >
                    Back
                </button>
                <button
                    className="btn-primary"
                    onClick={handleSave}
                    disabled={isSaving}
                >
                    {isSaving ? "Saving..." : "Save Daily Progress"}
                </button>
            </div>
        </div>
    );
};

export default DailyLogForm;