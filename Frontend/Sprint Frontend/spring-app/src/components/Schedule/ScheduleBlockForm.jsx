import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { scheduleBlockService, categoryService } from '../../api';

const ScheduleBlockForm = ({ userId, initialData, onClose }) => {
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const dayOptions = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"].map(d => ({ value: d, label: d }));
    const [selectedDay, setSelectedDay] = useState(dayOptions.find(d => d.value === (initialData?.day || 'MONDAY')));

    const [formData, setFormData] = useState({
        startTime: initialData?.startTime?.substring(0, 5) || '09:00',
        endTime: initialData?.endTime?.substring(0, 5) || '10:00',
        remindEnabled: initialData?.remindEnabled || false,
        remindOffsetMinutes: initialData?.remindOffsetMinutes || 15
    });

    useEffect(() => {
        categoryService.getAllByUser(userId).then(res => {
            const options = res.data.map(c => ({ value: c.id, label: c.name }));
            setCategoryOptions(options);
            if (initialData?.category) {
                setSelectedCategory({ value: initialData.category.id, label: initialData.category.name });
            }
        });
    }, [userId, initialData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedCategory) return alert("Please select a category.");
        try {
            const payload = {
                day: selectedDay.value,
                startTime: `${formData.startTime}:00`,
                endTime: `${formData.endTime}:00`,
                remindEnabled: formData.remindEnabled,
                remindOffsetMinutes: formData.remindOffsetMinutes,
                user: { id: userId },
                category: { id: parseInt(selectedCategory.value) }
            };
            if (initialData?.id) await scheduleBlockService.update(initialData.id, payload);
            else await scheduleBlockService.create(payload);
            onClose();
        } catch (err) { alert("Failed to save block."); }
    };

    return (
        <div className="form-card" style={{ width: '450px' }}>
            <div className="modal-header"><h3>{initialData ? 'Edit Block' : 'New Schedule Block'}</h3></div>
            <form onSubmit={handleSubmit}>

                {/* DAY OF WEEK - MOVED TO TOP */}
                <div className="form-group">
                    <label>Day of Week</label>
                    <Select
                        value={selectedDay}
                        onChange={setSelectedDay}
                        options={dayOptions}
                        classNamePrefix="react-select"
                        menuPortalTarget={document.body}
                        styles={{ menuPortal: base => ({ ...base, zIndex: 99999 }) }}
                    />
                </div>

                <div className="form-group">
                    <label>Activity Category *</label>
                    <Select
                        value={selectedCategory}
                        onChange={setSelectedCategory}
                        options={categoryOptions}
                        placeholder="Search categories..."
                        classNamePrefix="react-select"
                        isClearable
                        required
                        menuPortalTarget={document.body}
                        styles={{ menuPortal: base => ({ ...base, zIndex: 99999 }) }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '15px' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                        <label>Start Time</label>
                        <input type="time" value={formData.startTime} onChange={e => setFormData({ ...formData, startTime: e.target.value })} required />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                        <label>End Time</label>
                        <input type="time" value={formData.endTime} onChange={e => setFormData({ ...formData, endTime: e.target.value })} required />
                    </div>
                </div>

                <div className="reminder-box">
                    <label className="checkbox-label">
                        <input type="checkbox" checked={formData.remindEnabled} onChange={e => setFormData({ ...formData, remindEnabled: e.target.checked })} />
                        Enable Pre-Block Reminder
                    </label>
                    {formData.remindEnabled && (
                        <div className="form-group mt-10">
                            <label>Remind me how many minutes before?</label>
                            <input type="number" min="1" max="120" placeholder="e.g. 15" value={formData.remindOffsetMinutes} onChange={e => setFormData({ ...formData, remindOffsetMinutes: e.target.value })} required={formData.remindEnabled} />
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