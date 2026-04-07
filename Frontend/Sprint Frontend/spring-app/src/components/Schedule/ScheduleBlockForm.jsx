import React, { useState, useEffect } from 'react';
import { scheduleBlockService, categoryService } from '../../api';

const ScheduleBlockForm = ({ userId, initialData, onClose }) => {
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        day: initialData?.day || 'MONDAY',
        startTime: initialData?.startTime || '09:00',
        endTime: initialData?.endTime || '10:00',
        categoryId: ''
    });

    useEffect(() => {
        categoryService.getAllByUser(userId).then(res => setCategories(res.data));
    }, [userId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                day: formData.day,
                startTime: formData.startTime,
                endTime: formData.endTime,
                user: { id: userId }, // Matching User user entity
                category: formData.categoryId ? { id: parseInt(formData.categoryId) } : null
            };
            await scheduleBlockService.create(payload);
            onClose();
        } catch (err) {
            // Display error if backend returns 400 (Overlap)
            alert(err.response?.data || "Failed to save block. Check for time overlaps.");
        }
    };

    return (
        <div className="form-card" style={{ width: '400px' }}>
            <header className="modal-header">
                <h3>{initialData ? 'Fill TBA Slot' : 'New Schedule Block'}</h3>
            </header>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Day of Week</label>
                    <select
                        className="habit-input"
                        value={formData.day}
                        onChange={e => setFormData({ ...formData, day: e.target.value })}
                    >
                        {["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"].map(d => (
                            <option key={d} value={d}>{d}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Activity Category</label>
                    <select
                        required
                        className="habit-input"
                        value={formData.categoryId}
                        onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                    >
                        <option value="">-- Choose Category --</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>

                <div style={{ display: 'flex', gap: '15px' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                        <label>Start Time</label>
                        <input
                            type="time"
                            className="habit-input"
                            value={formData.startTime}
                            onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                        />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                        <label>End Time</label>
                        <input
                            type="time"
                            className="habit-input"
                            value={formData.endTime}
                            onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                        />
                    </div>
                </div>

                <div className="modal-footer" style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
                    <button type="submit" className="btn-primary">Save Block</button>
                </div>
            </form>
        </div>
    );
};

export default ScheduleBlockForm;