import React, { useState, useEffect } from 'react';
import { habitService } from '../../api';
import HabitForm from './HabitForm';
import DailyLogForm from './DailyLogForm';
import './Habits.css';

const HabitDashboard = ({ userId }) => {
    const [habits, setHabits] = useState([]);
    const [completedToday, setCompletedToday] = useState([]);
    const [view, setView] = useState('dashboard');
    const today = new Date().toISOString().split('T')[0];

    const loadData = async () => {
        try {
            const habitsRes = await habitService.getAll(userId);
            setHabits(habitsRes.data);

            const logRes = await habitService.getTodaysLog(userId, today);
            if (logRes.data && logRes.data.completedHabitIds) {
                setCompletedToday(logRes.data.completedHabitIds);
            }
        } catch (err) {
            console.error("Error fetching data", err);
        }
    };

    useEffect(() => {
        // FIXED: Stop React from fetching if userId is literally the string 'null'
        if (userId && userId !== 'null' && userId !== 'undefined') {
            loadData();
        }
    }, [userId]);

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this habit?")) {
            await habitService.delete(id);
            loadData();
        }
    };

    return (
        <div className="habit-container">
            <header className="main-header">
                <h1>Habit Dashboard</h1>
                <p className="subtitle">Systematic progress tracking</p>
            </header>

            {view === 'dashboard' && (
                <>
                    <div className="action-bar">
                        <button className="btn-edit" onClick={() => setView('log')}>
                            Log Progress
                        </button>
                        <button className="btn-add-sprint" onClick={() => setView('add')}>
                            + New Habit
                        </button>
                    </div>

                    <div className="main-header">
                        <h3>Habit Master List</h3>
                    </div>
                    <div className="table-wrapper" style={{ marginBottom: '40px' }}>
                        <table className="sprint-table">
                            <thead>
                                <tr>
                                    <th>Habit Name</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {habits.map(habit => (
                                    <tr key={habit.id}>
                                        <td className="sprint-name">{habit.name}</td>
                                        <td><span className="task-badge">Active</span></td>
                                        <td>
                                            <button className="btn-delete" onClick={() => handleDelete(habit.id)}>Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="main-header">
                        <h3>Daily Completion Log ({today})</h3>
                    </div>
                    <div className="table-wrapper">
                        <table className="sprint-table">
                            <thead>
                                <tr>
                                    <th>Habit</th>
                                    <th>Completion Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {habits.map(habit => {
                                    const isDone = completedToday.includes(habit.id);
                                    return (
                                        <tr key={`log-${habit.id}`}>
                                            <td>{habit.name}</td>
                                            <td>
                                                <span className={isDone ? "status-done" : "status-pending"}>
                                                    {isDone ? "✓ Completed" : "○ Pending"}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {view === 'add' && (
                <HabitForm
                    userId={userId}
                    onClose={() => { setView('dashboard'); loadData(); }}
                />
            )}

            {view === 'log' && (
                <DailyLogForm
                    userId={userId}
                    habits={habits}
                    onClose={() => { setView('dashboard'); loadData(); }}
                />
            )}
        </div>
    );
};

export default HabitDashboard;