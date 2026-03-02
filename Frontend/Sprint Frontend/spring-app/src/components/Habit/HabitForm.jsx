import React, { useState, useEffect } from 'react';
import { habitService } from '../../api';

const HabitForm = ({ userId, existingHabit, onClose }) => {
    const [name, setName] = useState('');
    const [isBad, setIsBad] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Pre-fill the form if we are editing an existing habit
    useEffect(() => {
        if (existingHabit) {
            setName(existingHabit.name);
            setIsBad(existingHabit.badHabit);
        }
    }, [existingHabit]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const habitData = {
                name,
                userId,
                badHabit: isBad
            };

            if (existingHabit) {
                // Update existing
                await habitService.update(existingHabit.id, habitData);
            } else {
                // Create new
                await habitService.create(habitData);
            }
            onClose();
        } catch (err) {
            alert(`Failed to ${existingHabit ? 'update' : 'create'} habit.`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="form-card">
            <header className="main-header" style={{ marginBottom: '24px' }}>
                <h3>{existingHabit ? 'Edit Habit' : 'New Habit'}</h3>
            </header>

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>What is your habit name?</label>
                    <input
                        type="text"
                        className="habit-input"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder="e.g. Read 10 pages or Smoke"
                    />
                </div>

                <div className="form-group">
                    <div className="toggle-container" onClick={() => setIsBad(!isBad)}>
                        <div className={`toggle-switch ${isBad ? 'on' : ''}`}></div>
                        <span style={{ fontSize: '14px', color: '#4b5563', userSelect: 'none' }}>
                            Mark as a "Bad Habit"
                        </span>
                    </div>
                </div>

                <div className="action-bar" style={{ marginTop: '30px' }}>
                    <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
                    <button type="submit" disabled={isSubmitting} className="btn-primary">
                        {isSubmitting ? 'Saving...' : (existingHabit ? 'Update Habit' : 'Save Habit')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default HabitForm;