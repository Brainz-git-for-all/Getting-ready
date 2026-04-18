import React, { useState, useEffect } from 'react';
import { habitService, categoryService } from '../../api';

const HabitForm = ({ userId, existingHabit, onClose }) => {
    const [name, setName] = useState('');
    const [isBad, setIsBad] = useState(false);
    const [categoryId, setCategoryId] = useState('');

    // NEW REMINDER STATES
    const [remindEnabled, setRemindEnabled] = useState(false);
    const [remindTime, setRemindTime] = useState('09:00');

    const [categories, setCategories] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (userId) categoryService.getAllByUser(userId).then(res => setCategories(res.data));
    }, [userId]);

    useEffect(() => {
        if (existingHabit) {
            setName(existingHabit.name);
            setIsBad(existingHabit.badHabit);
            setCategoryId(existingHabit.category ? existingHabit.category.id : '');
            setRemindEnabled(existingHabit.remindEnabled || false);
            setRemindTime(existingHabit.remindTime ? existingHabit.remindTime.substring(0, 5) : '09:00');
        }
    }, [existingHabit]);

    const handleSubmit = async (e) => {
        e.preventDefault(); setIsSubmitting(true);
        try {
            // Include remindEnabled and remindTime + ":00" for Java LocalTime format
            const habitData = {
                name, userId: userId, badHabit: isBad,
                remindEnabled, remindTime: remindEnabled ? `${remindTime}:00` : null,
                category: categoryId ? { id: parseInt(categoryId) } : null
            };
            if (existingHabit) await habitService.update(existingHabit.id, habitData);
            else await habitService.create(habitData);
            onClose();
        } catch (err) { alert(`Failed to save habit.`); }
        finally { setIsSubmitting(false); }
    };

    return (
        <div className="form-card">
            <div className="form-header"><h2>{existingHabit ? 'Edit Habit' : 'New Habit'}</h2></div>
            <form onSubmit={handleSubmit}>
                <div className="form-group"><label>Habit Name</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} required /></div>

                <div className="form-group"><label>Activity Category</label>
                    <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                        <option value="">-- Uncategorized --</option>
                        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </select>
                </div>

                {/* REMINDER SECTION */}
                <div style={{ background: 'var(--bg-main)', padding: '15px', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '15px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>
                        <input type="checkbox" checked={remindEnabled} onChange={() => setRemindEnabled(!remindEnabled)} style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }} />
                        Enable Daily Reminder
                    </label>
                    {remindEnabled && (
                        <div className="form-group" style={{ marginTop: '10px', marginBottom: 0 }}>
                            <label>Remind me at:</label>
                            <input type="time" value={remindTime} onChange={e => setRemindTime(e.target.value)} required={remindEnabled} />
                        </div>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="badHabitCheck" className="bad-habit-label">
                        <input type="checkbox" checked={isBad} onChange={() => setIsBad(!isBad)} id="badHabitCheck" className="bad-habit-checkbox" />
                        Mark as "Bad Habit" (To Break)
                    </label>
                </div>

                <div className="modal-actions">
                    <button type="button" onClick={onClose} className="btn-cancel">Cancel</button>
                    <button type="submit" disabled={isSubmitting} className="btn-submit">{isSubmitting ? 'Saving...' : 'Save Habit'}</button>
                </div>
            </form>
        </div>
    );
};

export default HabitForm;