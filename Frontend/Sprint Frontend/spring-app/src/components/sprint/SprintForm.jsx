import React, { useState, useEffect } from 'react';
import { sprintService, categoryService } from '../../api';

const SprintForm = ({ onSprintCreated, initialData, userId }) => {
    const [sprint, setSprint] = useState({ name: '', startDate: '', endDate: '', tasks: [] });
    const [categories, setCategories] = useState([]);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [newCatName, setNewCatName] = useState('');
    const [newCatColor, setNewCatColor] = useState('#4f46e5');
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
            const payload = { ...sprint, userId: userId };
            if (initialData?.id) { await sprintService.update(initialData.id, payload); }
            else { await sprintService.create(payload); }
            onSprintCreated();
        } catch (error) { alert("Save failed."); }
    };

    return (
        <div className="form-card">
            <h2>{initialData ? 'Edit Sprint' : 'Create New Sprint'}</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group"><label>Sprint Name</label><input type="text" value={sprint.name} onChange={e => setSprint({ ...sprint, name: e.target.value })} required /></div>
                <div style={{ display: 'flex', gap: '15px' }}>
                    <div className="form-group" style={{ flex: 1 }}><label>Start Date</label><input type="date" value={sprint.startDate} onChange={e => setSprint({ ...sprint, startDate: e.target.value })} required /></div>
                    <div className="form-group" style={{ flex: 1 }}><label>End Date</label><input type="date" value={sprint.endDate} onChange={e => setSprint({ ...sprint, endDate: e.target.value })} required /></div>
                </div>

                <div style={{ margin: '20px 0', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <label style={{ fontWeight: 600, color: 'var(--text-muted)', fontSize: '13px' }}>Sprint Tasks</label>
                        <button type="button" className="btn-secondary" onClick={() => setShowTaskModal(true)}>+ Add Task</button>
                    </div>

                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {sprint.tasks.map((t, idx) => (
                            <li key={idx} style={{ padding: '10px', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '6px', marginBottom: '8px', fontSize: '14px', display: 'flex', justifyContent: 'space-between' }}>
                                <span>{t.name}</span>
                                {t.category && <span className="badge badge-gray" style={{ color: t.category.color }}>{t.category.name}</span>}
                            </li>
                        ))}
                    </ul>
                </div>

                <button type="submit" className="btn-submit" style={{ width: '100%', marginTop: '10px' }}>Save Sprint</button>
            </form>

            {showTaskModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header"><h3>Add Task to Sprint</h3></div>

                        <div style={{ background: 'var(--bg-main)', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid var(--border)' }}>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>Quick Add Category</label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input type="text" value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="New Category" style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid var(--border)' }} />
                                <button type="button" onClick={handleCreateCategory} className="btn-primary" style={{ padding: '8px 12px' }}>Add</button>
                            </div>
                        </div>

                        <div className="form-group"><label>Task Name</label><input type="text" value={newTask.name} onChange={e => setNewTask({ ...newTask, name: e.target.value })} /></div>
                        <div className="form-group"><label>Category</label>
                            <select value={newTask.categoryId} onChange={e => setNewTask({ ...newTask, categoryId: e.target.value })}>
                                <option value="">-- No Category --</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={() => setShowTaskModal(false)}>Cancel</button>
                            <button className="btn-save" onClick={handleAddTask}>Add Task</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SprintForm;