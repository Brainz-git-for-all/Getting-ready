import React, { useState, useEffect } from 'react';
import { scheduleBlockService, categoryService } from '../../api';

const ScheduleBlockForm = ({ userId, initialData, onClose }) => {
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        day: initialData?.day || 'MONDAY',
        startTime: initialData?.startTime?.substring(0, 5) || '09:00',
        endTime: initialData?.endTime?.substring(0, 5) || '10:00',
        categoryId: '',
        remindEnabled: initialData?.remindEnabled || false,
        remindOffsetMinutes: initialData?.remindOffsetMinutes || 15
    });

    useEffect(() => {
        categoryService.getAllByUser(userId).then(res => setCategories(res.data));
    }, [userId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                day: formData.day,
                startTime: `${formData.startTime}:00`,
                endTime: `${formData.endTime}:00`,
                remindEnabled: formData.remindEnabled,
                remindOffsetMinutes: formData.remindOffsetMinutes,
                user: { id: userId },
                category: formData.categoryId ? { id: parseInt(formData.categoryId) } : null
            };
            if (initialData?.id) await scheduleBlockService.update(initialData.id, payload);
            else await scheduleBlockService.create(payload);
            onClose();
        } catch (err) { alert(err.response?.data || "Failed to save block."); }
    };

    return (
        <div className="form-card" style={{ width: '400px' }}>
            <div className="modal-header"><h3>{initialData ? 'Edit Block' : 'New Schedule Block'}</h3></div>
            <form onSubmit={handleSubmit}>
                <div className="form-group"><label>Day of Week</label>
                    <select value={formData.day} onChange={e => setFormData({ ...formData, day: e.target.value })}>
                        {["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"].map(d => (
                            <option key={d} value={d}>{d}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group"><label>Activity Category</label>
                    <select required value={formData.categoryId} onChange={e => setFormData({ ...formData, categoryId: e.target.value })}>
                        <option value="">-- Choose Category --</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>

                <div style={{ display: 'flex', gap: '15px' }}>
                    <div className="form-group" style={{ flex: 1 }}><label>Start Time</label><input type="time" value={formData.startTime} onChange={e => setFormData({ ...formData, startTime: e.target.value })} required /></div>
                    <div className="form-group" style={{ flex: 1 }}><label>End Time</label><input type="time" value={formData.endTime} onChange={e => setFormData({ ...formData, endTime: e.target.value })} required /></div>
                </div>

                {/* REMINDER SECTION */}
                <div style={{ background: 'var(--bg-main)', padding: '15px', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '15px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>
                        <input type="checkbox" checked={formData.remindEnabled} onChange={e => setFormData({ ...formData, remindEnabled: e.target.checked })} style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }} />
                        Enable Pre-Block Reminder
                    </label>
                    {formData.remindEnabled && (
                        <div className="form-group" style={{ marginTop: '10px', marginBottom: 0 }}>
                            <label>Remind me how many minutes before?</label>
                            <input type="number" min="1" max="120" value={formData.remindOffsetMinutes} onChange={e => setFormData({ ...formData, remindOffsetMinutes: e.target.value })} required={formData.remindEnabled} />
                        </div>
                    )}
                </div>

                <div className="modal-actions">
                    <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
                    <button type="submit" className="btn-submit">Save Block</button>
                </div>
            </form>
        </div>
    );
};

export default ScheduleBlockForm;