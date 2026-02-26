import React, { useState, useEffect } from 'react';
import { habitService } from '../../api';

const DailyLogForm = ({ userId, habits, onClose }) => {
    // This state holds the IDs of habits that are 'ticked'
    const [selectedIds, setSelectedIds] = useState([]);
    const [isSaving, setIsSaving] = useState(false);

    // Get current date in ISO format (YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0];

    // 1. Load existing progress when the component opens
    useEffect(() => {
        const fetchToday = async () => {
            try {
                const res = await habitService.getTodaysLog(userId, today);
                // If the backend returns a session with completed IDs, check them
                if (res.data && res.data.completedHabitIds) {
                    setSelectedIds(res.data.completedHabitIds);
                }
            } catch (err) {
                console.error("Could not fetch today's log", err);
            }
        };
        fetchToday();
    }, [userId, today]);

    // 2. The Logic for "Ticking"
    const toggleHabit = (id) => {
        setSelectedIds(prev =>
            prev.includes(id)
                ? prev.filter(habitId => habitId !== id) // Un-tick: remove from list
                : [...prev, id]                         // Tick: add to list
        );
    };

    // 3. Save to Spring Boot
    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Matches @PostMapping("/log/user/{id}")
            // Sends the List<Long> to the server
            await habitService.saveTodaysLog(userId, selectedIds);
            onClose(); // Return to dashboard
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