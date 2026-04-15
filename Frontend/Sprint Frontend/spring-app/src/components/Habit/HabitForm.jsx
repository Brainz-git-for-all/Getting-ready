import React, { useState, useEffect } from 'react';
import { habitService, categoryService } from '../../api';

const HabitForm = ({ userId, existingHabit, onClose }) => {
    const [name, setName] = useState('');
    const [isBad, setIsBad] = useState(false);
    const [categoryId, setCategoryId] = useState('');
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
        }
    }, [existingHabit]);

    const handleSubmit = async (e) => {
        e.preventDefault(); setIsSubmitting(true);
        try {
            const habitData = { name, userId: userId, badHabit: isBad, category: categoryId ? { id: parseInt(categoryId) } : null };
            if (existingHabit) { await habitService.update(existingHabit.id, habitData); }
            else { await habitService.create(habitData); }
            onClose();
        } catch (err) { alert(`Failed to save habit.`); }
        finally { setIsSubmitting(false); }
    };

    return (
        <div className="form-card">
            <div className="form-header"><h2>{existingHabit ? 'Edit Habit' : 'New Habit'}</h2></div>
            <form onSubmit={handleSubmit}>
                <div className="form-group"><label>Habit Name</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Read 10 pages" /></div>

                <div className="form-group"><label>Activity Category</label>
                    <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                        <option value="">-- Uncategorized --</option>
                        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </select>
                </div>

                <div className="form-group" style={{ marginTop: '20px' }}>
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