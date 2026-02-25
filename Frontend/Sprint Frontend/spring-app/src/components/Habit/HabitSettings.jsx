import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { habitService } from '../../api';
import './HabitSettings.css';

const HabitSettings = ({ userId }) => {
    const [habits, setHabits] = useState([]);
    const [newHabitName, setNewHabitName] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        habitService.getAll().then(res => setHabits(res.data));
    }, []);

    const handleAdd = async () => {
        if (!newHabitName) return;
        const res = await habitService.create({ name: newHabitName, userId });
        setHabits([...habits, res.data]);
        setNewHabitName("");
    };

    return (
        <div className="form-card">
            <button className="btn-cancel" onClick={() => navigate('/')} style={{ marginBottom: '1rem' }}>
                ← Back to Dashboard
            </button>

            <h2>Habit Settings</h2>

            <div className="form-group">
                <label>Add a new daily goal</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                        type="text"
                        className="form-input"
                        value={newHabitName}
                        onChange={(e) => setNewHabitName(e.target.value)}
                        placeholder="e.g. Read 10 pages"
                    />
                    <button className="btn-confirm" onClick={handleAdd}>Add</button>
                </div>
            </div>

            <div className="task-header-row">
                <h3>Your Active Habits</h3>
            </div>

            <ul className="task-preview-list">
                {habits.map(h => (
                    <li key={h.id} className="task-item">
                        <span>{h.name}</span>
                        <button className="btn-remove" onClick={async () => {
                            await habitService.delete(h.id);
                            setHabits(habits.filter(item => item.id !== h.id));
                        }}>×</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default HabitSettings;