import React, { useState, useEffect } from 'react';
import { habitService, categoryService } from '../../api';

const HabitForm = ({ userId, existingHabit, onClose }) => {
    const [name, setName] = useState('');
    const [isBad, setIsBad] = useState(false);
    const [categoryId, setCategoryId] = useState('');
    const [categories, setCategories] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (userId) {
            categoryService.getAllByUser(userId)
                .then(res => setCategories(res.data))
                .catch(err => console.error("Failed to fetch categories", err));
        }
    }, [userId]);

    useEffect(() => {
        if (existingHabit) {
            setName(existingHabit.name);
            setIsBad(existingHabit.badHabit);
            setCategoryId(existingHabit.category ? existingHabit.category.id : '');
        }
    }, [existingHabit]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const habitData = {
                name,
                userId: userId, // FIXED: Sent as flat Long to match Long userId in Java
                badHabit: isBad,
                category: categoryId ? { id: parseInt(categoryId) } : null
            };

            if (existingHabit) {
                await habitService.update(existingHabit.id, habitData);
            } else {
                await habitService.create(habitData);
            }
            onClose();
        } catch (err) {
            alert(`Failed to save habit.`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="form-card">
            <header className="modal-header">
                <h3>{existingHabit ? 'Edit Habit' : 'New Habit'}</h3>
            </header>
            <form onSubmit={handleSubmit}>
                <div className="input-group">
                    <label>Habit Name</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Read 10 pages" />
                </div>
                <div className="input-group">
                    <label>Activity Category</label>
                    <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                        <option value="">-- Uncategorized --</option>
                        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </select>
                </div>
                <div className="input-group" style={{ flexDirection: 'row', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input type="checkbox" checked={isBad} onChange={() => setIsBad(!isBad)} id="badHabitCheck" />
                    <label htmlFor="badHabitCheck" style={{ marginBottom: 0 }}>Mark as "Bad Habit"</label>
                </div>
                <div className="modal-footer">
                    <button type="button" onClick={onClose} className="btn-cancel">Cancel</button>
                    <button type="submit" disabled={isSubmitting} className="btn-save">{isSubmitting ? 'Saving...' : 'Save Habit'}</button>
                </div>
            </form>
        </div>
    );
};

export default HabitForm;