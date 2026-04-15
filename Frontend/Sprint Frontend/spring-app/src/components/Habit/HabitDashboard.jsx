import React, { useState, useEffect } from 'react';
import { habitService } from '../../api';
import HabitForm from './HabitForm';
import DailyLogForm from './DailyLogForm';
import { customConfirm } from '../AlertSystem'; // <-- NEW

const HabitDashboard = ({ userId }) => {
    const [habits, setHabits] = useState([]);
    const [view, setView] = useState('dashboard');
    const [editingHabit, setEditingHabit] = useState(null);

    const loadData = async () => {
        try {
            const habitsRes = await habitService.getAll(userId);
            setHabits(habitsRes.data || []);
        } catch (err) { console.error("Error fetching data", err); }
    };

    useEffect(() => { if (userId && userId !== 'null') loadData(); }, [userId]);

    const handleDelete = async (id) => {
        const isConfirmed = await customConfirm("Delete Habit", "Are you sure you want to delete this habit and its progress?", "Delete");
        if (isConfirmed) {
            await habitService.delete(id);
            loadData();
        }
    };

    const handleEdit = (habit) => { setEditingHabit(habit); setView('add'); };
    const closeForm = () => { setView('dashboard'); setEditingHabit(null); loadData(); };

    return (
        <div>
            {view === 'dashboard' && (
                <>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginBottom: '20px' }}>
                        <button className="btn-secondary" onClick={() => setView('log')}>Log Progress</button>
                        <button className="btn-primary" onClick={() => { setEditingHabit(null); setView('add'); }}>+ New Habit</button>
                    </div>
                    <div className="table-wrapper">
                        <table className="sprint-table">
                            <thead><tr><th>Habit Name</th><th>Type</th><th>Actions</th></tr></thead>
                            <tbody>
                                {habits.length === 0 ? (
                                    <tr><td colSpan="3" style={{ textAlign: 'center', color: '#6b7280' }}>No habits found.</td></tr>
                                ) : (
                                    habits.map(habit => (
                                        <tr key={habit.id}>
                                            <td style={{ fontWeight: 600 }}>{habit.name}</td>
                                            <td><span className={habit.badHabit ? "badge badge-red" : "badge badge-green"}>{habit.badHabit ? 'Bad Habit' : 'Good Habit'}</span></td>
                                            <td>
                                                <button className="btn-edit" onClick={() => handleEdit(habit)}>Edit</button>
                                                <button className="btn-delete" onClick={() => handleDelete(habit.id)}>Delete</button>
                                            </td>
                                        </tr>
                                    ))
                                )}
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