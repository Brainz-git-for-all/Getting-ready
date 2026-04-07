import React, { useState, useEffect } from 'react';
import { sprintService, categoryService } from '../../api';

const SprintForm = ({ onSprintCreated, initialData, userId }) => {
    const [sprint, setSprint] = useState({ name: '', startDate: '', endDate: '', tasks: [] });
    const [categories, setCategories] = useState([]);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [newCatName, setNewCatName] = useState('');
    const [newCatColor, setNewCatColor] = useState('#3498db');
    const [newTask, setNewTask] = useState({ name: '', priority: 'Medium', startDate: '', endDate: '', completed: false, categoryId: '' });

    const fetchCategories = async () => {
        if (!userId) return;
        try {
            const res = await categoryService.getAllByUser(userId);
            setCategories(res.data);
        } catch (err) { console.error("Category fetch failed", err); }
    };

    useEffect(() => { fetchCategories(); }, [userId]);
    useEffect(() => { if (initialData) setSprint(initialData); }, [initialData]);

    const handleCreateCategory = async () => {
        if (!newCatName.trim()) return;
        try {
            // FIXED: Send userId as Long to match ActivityCategory.java
            await categoryService.create({ name: newCatName, color: newCatColor, userId: userId });
            setNewCatName('');
            await fetchCategories();
        } catch (err) { alert("Error creating category"); }
    };

    const handleAddTask = (e) => {
        e.preventDefault();
        if (!newTask.name.trim()) return;
        const taskToAdd = { ...newTask, category: newTask.categoryId ? { id: parseInt(newTask.categoryId) } : null };
        setSprint({ ...sprint, tasks: [...sprint.tasks, taskToAdd] });
        setNewTask({ name: '', priority: 'Medium', startDate: '', endDate: '', completed: false, categoryId: '' });
        setShowTaskModal(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // FIXED: Change user object to flat Long userId to match Sprint.java
            const payload = { ...sprint, userId: userId };
            if (initialData?.id) {
                await sprintService.update(initialData.id, payload);
            } else {
                await sprintService.create(payload);
            }
            onSprintCreated();
        } catch (error) { alert("Save failed."); }
    };

    return (
        <div className="form-card">
            <h2>{initialData ? 'Edit Sprint' : 'Create New Sprint'}</h2>
            <form onSubmit={handleSubmit}>
                <div className="input-group"><label>Sprint Name</label><input type="text" value={sprint.name} onChange={e => setSprint({ ...sprint, name: e.target.value })} required /></div>
                <div className="time-row">
                    <div className="input-group"><label>Start Date</label><input type="date" value={sprint.startDate} onChange={e => setSprint({ ...sprint, startDate: e.target.value })} required /></div>
                    <div className="input-group"><label>End Date</label><input type="date" value={sprint.endDate} onChange={e => setSprint({ ...sprint, endDate: e.target.value })} required /></div>
                </div>
                <div style={{ margin: '20px 0' }}><button type="button" className="btn-add-cat" onClick={() => setShowTaskModal(true)}>+ Add Task</button></div>
                <ul className="task-preview-list">
                    {sprint.tasks.map((t, idx) => (
                        <li key={idx} style={{ fontSize: '0.8rem', padding: '5px', borderBottom: '1px solid #eee' }}>
                            {t.name} {t.category && <span style={{ color: t.category.color }}>({t.category.name})</span>}
                        </li>
                    ))}
                </ul>
                <button type="submit" className="btn-save" style={{ width: '100%', marginTop: '20px' }}>Save Sprint</button>
            </form>

            {showTaskModal && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <h3>Add Task</h3>
                        <div className="category-manager-section">
                            <label className="section-label">Quick Add Category</label>
                            <div className="category-creator-row">
                                <input type="text" value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="New Category" />
                                <button type="button" onClick={handleCreateCategory}>Add</button>
                            </div>
                        </div>
                        <div className="input-group"><label>Task Name</label><input type="text" value={newTask.name} onChange={e => setNewTask({ ...newTask, name: e.target.value })} /></div>
                        <div className="input-group"><label>Category</label>
                            <select value={newTask.categoryId} onChange={e => setNewTask({ ...newTask, categoryId: e.target.value })}>
                                <option value="">-- No Category --</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="modal-footer">
                            <button onClick={() => setShowTaskModal(false)}>Cancel</button>
                            <button className="btn-save" onClick={handleAddTask}>Add Task</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SprintForm;