import React, { useState, useEffect } from 'react';
import { habitService } from '../../api';
import HabitForm from './HabitForm';
import DailyLogForm from './DailyLogForm';
import './Habits.css';

const HabitDashboard = ({ userId }) => {
    const [habits, setHabits] = useState([]);
    const [completedToday, setCompletedToday] = useState([]);
    const [view, setView] = useState('dashboard');
    const [editingHabit, setEditingHabit] = useState(null); // Track the habit being edited
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
        if (userId && userId !== 'null') {
            loadData();
        }
    }, [userId]);

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this habit?")) {
            await habitService.delete(id);
            loadData();
        }
    };

    const handleEdit = (habit) => {
        setEditingHabit(habit);
        setView('add');
    };

    const closeForm = () => {
        setView('dashboard');
        setEditingHabit(null);
        loadData();
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
                        <button className="btn-primary" onClick={() => setView('log')}>Log Progress</button>
                        <button className="btn-secondary" onClick={() => { setEditingHabit(null); setView('add'); }}>+ New Habit</button>
                    </div>

                    <div className="table-wrapper">
                        <table className="sprint-table">
                            <thead>
                                <tr>
                                    <th>Habit Name</th>
                                    <th>Type</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {habits.map(habit => (
                                    <tr key={habit.id}>
                                        <td className="sprint-name">{habit.name}</td>
                                        <td>
                                            <span style={{
                                                padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600',
                                                backgroundColor: habit.badHabit ? '#fff1f0' : '#f6ffed',
                                                color: habit.badHabit ? '#cf1322' : '#389e0d',
                                                border: habit.badHabit ? '1px solid #ffa39e' : '1px solid #b7eb8f'
                                            }}>
                                                {habit.badHabit ? 'Bad Habit' : 'Good Habit'}
                                            </span>
                                        </td>
                                        <td style={{ display: 'flex', gap: '8px' }}>
                                            <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.85rem' }} onClick={() => handleEdit(habit)}>Edit</button>
                                            <button className="btn-delete" style={{ padding: '6px 12px', fontSize: '0.85rem', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer' }} onClick={() => handleDelete(habit.id)}>Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {view === 'add' && <HabitForm userId={userId} existingHabit={editingHabit} onClose={closeForm} />}
            {view === 'log' && <DailyLogForm userId={userId} habits={habits} onClose={closeForm} />}
        </div>
    );
};

export default HabitDashboard;