import React, { useState } from 'react';
import { habitService } from '../../api'; // Using your provided axios api instance

const HabitForm = ({ userId, onClose }) => {
    const [name, setName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Prevent double-submissions
        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            /** * This matches your Habit.java entity:
             * private String name;
             * private Long userId;
             */
            const habitData = {
                name: name,
                userId: userId
            };

            // Calls @PostMapping in HabitLogController
            await habitService.create(habitData);

            // Logic: Success, clear form and close
            setName('');
            onClose();
        } catch (err) {
            console.error("Submission error:", err);
            alert("Failed to create habit. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="form-card">
            <header className="main-header">
                <h3>Create New Habit</h3>
                <p className="subtitle">Add a recurring task for your daily log</p>
            </header>

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="habit-name">Habit Name</label>
                    <input
                        id="habit-name"
                        className="habit-input"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., Read for 30 mins"
                        required
                        disabled={isSubmitting}
                    />
                </div>

                <div className="action-bar" style={{ marginTop: '20px' }}>
                    <button
                        type="button"
                        className="btn-secondary"
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Saving...' : 'Save Habit'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default HabitForm;