import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { quickTaskService, categoryService } from '../../api';

const formatDate = (date) => date ? date.toISOString().split('T')[0] : '';

const QuickTaskForm = ({ userId, onTaskCreated, onCancel }) => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

    const priorityOptions = [{ value: 'High', label: 'High' }, { value: 'Medium', label: 'Medium' }, { value: 'Low', label: 'Low' }];
    const [priority, setPriority] = useState(priorityOptions[1]);
    const [selectedCategory, setSelectedCategory] = useState(null);

    const [dateRange, setDateRange] = useState([new Date(), new Date()]);
    const [startDate, endDate] = dateRange;

    const [remindAt, setRemindAt] = useState("");
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        categoryService.getAllByUser(userId).then(res => {
            setCategoryOptions((res.data || []).map(c => ({ value: c.id, label: c.name })));
        });
    }, [userId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim() || !startDate || !endDate) return;
        setIsSubmitting(true);
        try {
            await quickTaskService.create({
                name, description, priority: priority.value,
                startDate: formatDate(startDate),
                endDate: formatDate(endDate),
                remindAt: remindAt ? `${remindAt}:00` : null,
                userId: userId, completed: false,
                category: selectedCategory ? { id: parseInt(selectedCategory.value) } : null
            });
            onTaskCreated();
        } catch (error) { console.error("Failed to create quick task:", error); }
        finally { setIsSubmitting(false); }
    };

    return (
        <div className="form-card">
            <div className="form-header">
                <h2>⚡ Create Quick Task</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>Add a standalone task with a specific timeframe.</p>
            </div>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Task Name *</label>
                    <input type="text" placeholder="e.g., Pay Electricity Bill" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>

                <div className="form-group">
                    <label>Duration (Drag to select range) *</label>
                    <DatePicker
                        selectsRange={true}
                        startDate={startDate}
                        endDate={endDate}
                        onChange={(update) => setDateRange(update)}
                        isClearable={true}
                        placeholderText="Select Start Date → End Date"
                        className="date-picker-input"
                        required
                    />
                </div>

                <div style={{ display: 'flex', gap: '15px' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                        <label>Category</label>
                        <Select
                            value={selectedCategory}
                            onChange={setSelectedCategory}
                            options={categoryOptions}
                            placeholder="Select category..."
                            classNamePrefix="react-select"
                            isClearable
                            menuPortalTarget={document.body}
                            styles={{ menuPortal: base => ({ ...base, zIndex: 99999 }) }}
                        />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                        <label>Priority</label>
                        <Select
                            value={priority}
                            onChange={setPriority}
                            options={priorityOptions}
                            classNamePrefix="react-select"
                            menuPortalTarget={document.body}
                            styles={{ menuPortal: base => ({ ...base, zIndex: 99999 }) }}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label>Custom Reminder (Exact Date & Time)</label>
                    <input type="datetime-local" value={remindAt} onChange={(e) => setRemindAt(e.target.value)} />
                </div>

                <div className="form-group">
                    <label>Description</label>
                    <textarea placeholder="Any additional notes..." value={description} onChange={(e) => setDescription(e.target.value)} rows="2" />
                </div>

                <div className="modal-actions">
                    <button type="button" className="btn-cancel" onClick={onCancel}>Cancel</button>
                    <button type="submit" className="btn-submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Task'}</button>
                </div>
            </form>
        </div>
    );
};

export default QuickTaskForm;