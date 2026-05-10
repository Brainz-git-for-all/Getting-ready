import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { scheduleBlockService, categoryService } from '../../api';
import { customAlert } from '../AlertSystem';

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

const ScheduleBlockForm = ({ userId, initialData, onClose }) => {
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);

    // State is now an Array of selected days
    const [selectedDays, setSelectedDays] = useState(initialData ? [initialData.day] : ['MONDAY']);

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

    const toggleDay = (day) => {
        if (initialData) return; // Prevent multi-select when editing an existing block

        if (selectedDays.includes(day)) {
            if (selectedDays.length > 1) setSelectedDays(selectedDays.filter(d => d !== day));
        } else {
            setSelectedDays([...selectedDays, day]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedCategory) return customAlert("Missing Input", "Please select a category.");
        if (formData.startTime === formData.endTime) return customAlert("Invalid Time", "Start and End times cannot be exactly the same.");

        try {
            if (initialData?.id) {
                // Editing exactly 1 block
                const payload = {
                    day: selectedDays[0],
                    startTime: `${formData.startTime}:00`,
                    endTime: `${formData.endTime}:00`,
                    remindEnabled: formData.remindEnabled,
                    remindOffsetMinutes: formData.remindOffsetMinutes,
                    user: { id: userId },
                    category: { id: parseInt(selectedCategory.value) }
                };
                await scheduleBlockService.update(initialData.id, payload);
            } else {
                // Creating multiple days at once
                const payloads = selectedDays.map(d => ({
                    day: d,
                    startTime: `${formData.startTime}:00`,
                    endTime: `${formData.endTime}:00`,
                    remindEnabled: formData.remindEnabled,
                    remindOffsetMinutes: formData.remindOffsetMinutes,
                    user: { id: userId },
                    category: { id: parseInt(selectedCategory.value) }
                }));
                await scheduleBlockService.createBulk(payloads);
            }
            onClose();
        } catch (err) {
            const errorMsg = err.response?.data || "Failed to save schedule. Unknown overlap error.";
            customAlert("Schedule Conflict", errorMsg);
        }
    };

    return (
        <div className="form-card" style={{ width: '450px' }}>
            <div className="modal-header"><h3>{initialData ? 'Edit Block' : 'New Schedule Block'}</h3></div>
            <form onSubmit={handleSubmit}>

                {/* MULTI-DAY ROW UI */}
                <div className="form-group">
                    <label>Select Days {initialData && <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '5px' }}>(Edit locked to single day)</span>}</label>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', marginTop: '5px' }}>
                        {DAYS.map(d => (
                            <div
                                key={d}
                                onClick={() => toggleDay(d)}
                                style={{
                                    width: '35px', height: '35px', borderRadius: '50%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 'bold', fontSize: '12px', cursor: initialData ? 'not-allowed' : 'pointer',
                                    transition: '0.2s',
                                    background: selectedDays.includes(d) ? 'var(--primary)' : 'var(--bg-secondary)',
                                    color: selectedDays.includes(d) ? 'white' : 'var(--text-muted)',
                                    border: `1px solid ${selectedDays.includes(d) ? 'var(--primary)' : 'var(--border)'}`
                                }}
                            >
                                {d.substring(0, 1)}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="form-group">
                    <label>Activity Category *</label>
                    <Select
                        value={selectedCategory}
                        onChange={setSelectedCategory}
                        options={categoryOptions}
                        placeholder="Search categories..."
                        classNamePrefix="react-select"
                        isClearable required menuPortalTarget={document.body}
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

                <div className="modal-actions" style={{ marginTop: '20px' }}>
                    <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
                    <button type="submit" className="btn-submit">Save Block</button>
                </div>
            </form>
        </div>
    );
};

export default ScheduleBlockForm;