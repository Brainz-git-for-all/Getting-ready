import React, { useState, useEffect } from 'react';
import { quickTaskService, categoryService } from '../../api';

const QuickTaskForm = ({ userId, onTaskCreated, onCancel }) => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState("Medium"); // <-- New State
    const [categoryId, setCategoryId] = useState("");
    const [categories, setCategories] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        categoryService.getAllByUser(userId).then(res => setCategories(res.data || []));
    }, [userId]);

    const handleSubmit = async (e) => {
        e.preventDefault(); if (!name.trim()) return;
        setIsSubmitting(true);
        try {
            await quickTaskService.create({
                name, description, priority, userId: userId, completed: false, // <-- Included priority
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
                <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>Add a standalone task that isn't attached to a sprint.</p>
            </div>
            <form onSubmit={handleSubmit}>
                <div className="form-group"><label>Task Name *</label><input type="text" placeholder="e.g., Pay electricity bill" value={name} onChange={(e) => setName(e.target.value)} required /></div>

                <div style={{ display: 'flex', gap: '15px' }}>
                    <div className="form-group" style={{ flex: 1 }}><label>Category (For Schedule)</label>
                        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                            <option value="">-- No Category --</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>

                    <div className="form-group" style={{ flex: 1 }}><label>Priority</label>
                        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                        </select>
                    </div>
                </div>

                <div className="form-group"><label>Description (Optional)</label><textarea placeholder="Brief details about this task..." value={description} onChange={(e) => setDescription(e.target.value)} rows="2" /></div>

                <div className="modal-actions">
                    <button type="button" className="btn-cancel" onClick={onCancel}>Cancel</button>
                    <button type="submit" className="btn-submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Quick Task'}</button>
                </div>
            </form>
        </div>
    );
};

export default QuickTaskForm;