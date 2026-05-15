import React, { useState, useEffect } from 'react';
import CreatableSelect from 'react-select/creatable';
import { scheduleBlockService, categoryService } from '../../api';
import { customAlert } from '../AlertSystem';

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
// Pool of nice colors for auto-generated categories
const COLORS = ['#4f46e5', '#059669', '#e11d48', '#d97706', '#7c3aed', '#0891b2', '#c026d3', '#2563eb'];

const ScheduleBlockForm = ({ userId, initialData, onClose }) => {
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isCreatingCategory, setIsCreatingCategory] = useState(false);

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
        if (initialData) return;
        if (selectedDays.includes(day)) {
            if (selectedDays.length > 1) setSelectedDays(selectedDays.filter(d => d !== day));
        } else {
            setSelectedDays([...selectedDays, day]);
        }
    };

    const handleCreateCategory = async (inputValue) => {
        setIsCreatingCategory(true);
        try {
            // Give it a random nice color automatically
            const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
            const res = await categoryService.create({ name: inputValue, color: randomColor, userId });

            const newOption = { value: res.data.id, label: res.data.name };
            setCategoryOptions((prev) => [...prev, newOption]);
            setSelectedCategory(newOption);
        } catch (err) {
            customAlert("Error", "Failed to create category automatically.");
        } finally {
            setIsCreatingCategory(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedCategory) return customAlert("Missing Input", "Please select or type an Activity Name.");
        if (formData.startTime === formData.endTime) return customAlert("Invalid Time", "Start and End times cannot be exactly the same.");

        try {
            if (initialData?.id) {
                const payload = {
                    day: selectedDays[0], startTime: `${formData.startTime}:00`, endTime: `${formData.endTime}:00`,
                    remindEnabled: formData.remindEnabled, remindOffsetMinutes: formData.remindOffsetMinutes,
                    user: { id: userId }, category: { id: parseInt(selectedCategory.value) }
                };
                await scheduleBlockService.update(initialData.id, payload);
            } else {
                const payloads = selectedDays.map(d => ({
                    day: d, startTime: `${formData.startTime}:00`, endTime: `${formData.endTime}:00`,
                    remindEnabled: formData.remindEnabled, remindOffsetMinutes: formData.remindOffsetMinutes,
                    user: { id: userId }, category: { id: parseInt(selectedCategory.value) }
                }));
                await scheduleBlockService.createBulk(payloads);
            }
            onClose();
        } catch (err) {
            customAlert("Schedule Conflict", "Failed to save schedule. Check for overlapping times.");
        }
    };

    return (
        <div className="form-card" style={{ width: '450px' }}>
            <div className="modal-header"><h3>{initialData ? 'Edit Block' : 'New Schedule Block'}</h3></div>
            <form onSubmit={handleSubmit}>

                <div className="form-group">
                    <label>Select Days {initialData && <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '5px' }}>(Edit locked to single day)</span>}</label>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', marginTop: '5px' }}>
                        {DAYS.map(d => (
                            <div key={d} onClick={() => toggleDay(d)}
                                style={{
                                    width: '35px', height: '35px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 'bold', fontSize: '12px', cursor: initialData ? 'not-allowed' : 'pointer', transition: '0.2s',
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
                    <label>Activity Name (Type to create a new one) *</label>
                    <CreatableSelect
                        isDisabled={isCreatingCategory}
                        isLoading={isCreatingCategory}
                        onChange={setSelectedCategory}
                        onCreateOption={handleCreateCategory}
                        options={categoryOptions}
                        value={selectedCategory}
                        placeholder="e.g. Coding, Gym, Deep Work..."
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