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
                if (res.data && res.data.completedHabitIds) { setSelectedIds(res.data.completedHabitIds); }
            } catch (err) { console.error("Could not fetch today's log", err); }
        };
        fetchToday();
    }, [userId, today]);

    const toggleHabit = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(habitId => habitId !== id) : [...prev, id]);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await habitService.saveTodaysLog(userId, today, selectedIds);
            onClose();
        } catch (err) { alert("Error saving your progress."); }
        finally { setIsSaving(false); }
    };

    return (
        <div className="form-card">
            <div className="form-header">
                <h2>Daily Log</h2>
                <p style={{ color: 'var(--text-muted)' }}>Tick the habits you completed today ({today})</p>
            </div>

            <div className="log-list">
                {habits.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No habits created yet.</p>
                ) : (
                    habits.map(habit => (
                        <label key={habit.id} className="log-item">
                            <input type="checkbox" checked={selectedIds.includes(habit.id)} onChange={() => toggleHabit(habit.id)} />
                            <span>{habit.name}</span>
                            {habit.badHabit && <span className="badge badge-red" style={{ marginLeft: 'auto' }}>Bad Habit</span>}
                        </label>
                    ))
                )}
            </div>

            <div className="modal-actions">
                <button className="btn-secondary" onClick={onClose} disabled={isSaving}>Cancel</button>
                <button className="btn-primary" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Daily Progress"}
                </button>
            </div>
        </div>
    );
};

export default DailyLogForm;