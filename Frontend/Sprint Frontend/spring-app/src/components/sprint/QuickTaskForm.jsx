import React, { useState, useEffect } from 'react';
import { quickTaskService, categoryService } from '../../api';

const QuickTaskForm = ({ userId, onTaskCreated, onCancel }) => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState("Medium");
    const [categoryId, setCategoryId] = useState("");
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

    // NEW REMINDER STATE
    const [remindAt, setRemindAt] = useState("");

    const [categories, setCategories] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => { categoryService.getAllByUser(userId).then(res => setCategories(res.data || [])); }, [userId]);

    const handleSubmit = async (e) => {
        e.preventDefault(); if (!name.trim()) return;
        setIsSubmitting(true);
        try {
            await quickTaskService.create({
                name, description, priority, startDate, endDate,
                remindAt: remindAt ? `${remindAt}:00` : null, // Format for Java LocalDateTime
                userId: userId, completed: false,
                category: categoryId ? { id: parseInt(categoryId) } : null
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
                <div className="form-group"><label>Task Name *</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} required /></div>

                <div style={{ display: 'flex', gap: '15px' }}>
                    <div className="form-group" style={{ flex: 1 }}><label>Start Date</label><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required /></div>
                    <div className="form-group" style={{ flex: 1 }}><label>End Date</label><input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required /></div>
                </div>

                <div style={{ display: 'flex', gap: '15px' }}>
                    <div className="form-group" style={{ flex: 1 }}><label>Category</label>
                        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                            <option value="">-- No Category --</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="form-group" style={{ flex: 1 }}><label>Priority</label>
                        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                            <option value="High">High</option><option value="Medium">Medium</option><option value="Low">Low</option>
                        </select>
                    </div>
                </div>

                {/* EXACT REMINDER SETTING */}
                <div className="form-group">
                    <label>Custom Reminder (Exact Date & Time)</label>
                    <input type="datetime-local" value={remindAt} onChange={(e) => setRemindAt(e.target.value)} />
                </div>

                <div className="form-group"><label>Description</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows="2" /></div>

                <div className="modal-actions">
                    <button type="button" className="btn-cancel" onClick={onCancel}>Cancel</button>
                    <button type="submit" className="btn-submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Task'}</button>
                </div>
            </form>
        </div>
    );
};

export default QuickTaskForm;