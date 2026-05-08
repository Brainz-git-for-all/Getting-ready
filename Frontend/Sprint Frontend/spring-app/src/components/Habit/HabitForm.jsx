import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { habitService, categoryService } from '../../api';

const HabitForm = ({ userId, existingHabit, onClose }) => {
    const [name, setName] = useState('');
    const [isBad, setIsBad] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [remindEnabled, setRemindEnabled] = useState(false);
    const [remindTime, setRemindTime] = useState('09:00');

    const [categoryOptions, setCategoryOptions] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (userId) {
            categoryService.getAllByUser(userId).then(res => {
                const options = res.data.map(cat => ({ value: cat.id, label: cat.name }));
                setCategoryOptions(options);

                if (existingHabit?.category) {
                    setSelectedCategory({ value: existingHabit.category.id, label: existingHabit.category.name });
                }
            });
        }
    }, [userId, existingHabit]);

    useEffect(() => {
        if (existingHabit) {
            setName(existingHabit.name);
            setIsBad(existingHabit.badHabit);
            setRemindEnabled(existingHabit.remindEnabled || false);
            setRemindTime(existingHabit.remindTime ? existingHabit.remindTime.substring(0, 5) : '09:00');
        }
    }, [existingHabit]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const habitData = {
                name, userId: userId, badHabit: isBad,
                remindEnabled, remindTime: remindEnabled ? `${remindTime}:00` : null,
                category: selectedCategory ? { id: parseInt(selectedCategory.value) } : null
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
                <div className="form-group">
                    <label>Habit Name</label>
                    <input type="text" placeholder="e.g., Drink 2L of water..." value={name} onChange={(e) => setName(e.target.value)} required />
                </div>

                <div className="form-group">
                    <label>Activity Category</label>
                    <Select
                        value={selectedCategory}
                        onChange={setSelectedCategory}
                        options={categoryOptions}
                        placeholder="Search or select a category..."
                        classNamePrefix="react-select"
                        isClearable
                        menuPortalTarget={document.body}
                        styles={{ menuPortal: base => ({ ...base, zIndex: 99999 }) }}
                    />
                </div>

                <div className="reminder-box">
                    <label className="checkbox-label">
                        <input type="checkbox" checked={remindEnabled} onChange={() => setRemindEnabled(!remindEnabled)} />
                        Enable Daily Reminder
                    </label>
                    {remindEnabled && (
                        <div className="form-group mt-10">
                            <label>Remind me at:</label>
                            <input type="time" value={remindTime} onChange={e => setRemindTime(e.target.value)} required={remindEnabled} />
                        </div>
                    )}
                </div>

                <div className="form-group">
                    <label className="bad-habit-label">
                        <input type="checkbox" checked={isBad} onChange={() => setIsBad(!isBad)} className="bad-habit-checkbox" />
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