import React, { useState, useEffect } from 'react';
import { habitService } from '../../api';
import './HabitDashboard.css';

const HabitDashboard = () => {
    const [habits, setHabits] = useState([]);
    const [completedIds, setCompletedIds] = useState([]);
    const [newHabitName, setNewHabitName] = useState('');
    const userId = localStorage.getItem('userId'); // Ensure your login stores this!

    useEffect(() => {
        loadHabits();
    }, []);

    const loadHabits = async () => {
        try {
            const res = await habitService.getAll();
            setHabits(res.data);
            // In a real app, you'd also fetch today's DailySession
            // to populate completedIds initially.
        } catch (err) {
            console.error("Failed to load habits");
        }
    };

    const handleAddHabit = async (e) => {
        e.preventDefault();
        if (!newHabitName) return;
        try {
            await habitService.create({ name: newHabitName, user: { id: userId } });
            setNewHabitName('');
            loadHabits();
        } catch (err) {
            console.error("Error creating habit");
        }
    };

    const handleToggle = async (habitId) => {
        let updatedList;
        if (completedIds.includes(habitId)) {
            updatedList = completedIds.filter(id => id !== habitId);
        } else {
            updatedList = [...completedIds, habitId];
        }

        setCompletedIds(updatedList);

        // Sync with backend immediately
        try {
            await habitService.logProgress(userId, updatedList);
        } catch (err) {
            console.error("Failed to save progress");
        }
    };

    const deleteHabit = async (id) => {
        await habitService.delete(id);
        loadHabits();
    };

    return (
        <div className="habit-container">
            <div className="habit-card">
                <h3>Daily Habits</h3>
                <form onSubmit={handleAddHabit} className="habit-form">
                    <input
                        value={newHabitName}
                        onChange={(e) => setNewHabitName(e.target.value)}
                        placeholder="New Habit (e.g. Gym)"
                    />
                    <button type="submit" className="btn-login" style={{ width: 'auto' }}>Add</button>
                </form>

                <div className="habit-list">
                    {habits.map(habit => (
                        <div key={habit.id} className="habit-item">
                            <div className="habit-info">
                                <input
                                    type="checkbox"
                                    checked={completedIds.includes(habit.id)}
                                    onChange={() => handleToggle(habit.id)}
                                />
                                <span>{habit.name}</span>
                            </div>
                            <button onClick={() => deleteHabit(habit.id)} className="btn-delete">×</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HabitDashboard;