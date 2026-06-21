import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { sprintService, categoryService } from '../../api';

// Helper to format dates for the backend (YYYY-MM-DD)
const formatDate = (date) => date ? date.toISOString().split('T')[0] : '';

// Handles both array dates [y,m,d] from backend and string dates
const toDate = (val) => {
    if (!val) return null;
    if (Array.isArray(val)) return new Date(val[0], val[1] - 1, val[2]);
    return new Date(val + 'T00:00:00');
};

const SprintForm = ({ onSprintCreated, initialData, userId }) => {
    const [sprintName, setSprintName] = useState('');
    const [sprintDateRange, setSprintDateRange] = useState([null, null]);
    const [sprintStartDate, sprintEndDate] = sprintDateRange;
    const [tasks, setTasks] = useState([]);

    const [categoryOptions, setCategoryOptions] = useState([]);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [editingTaskIndex, setEditingTaskIndex] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');

    // Task form states
    const [newTaskName, setNewTaskName] = useState('');
    const [newTaskPriority, setNewTaskPriority] = useState({ value: 'Medium', label: 'Medium' });
    const [newTaskCategory, setNewTaskCategory] = useState(null);
    const [newTaskDateRange, setNewTaskDateRange] = useState([null, null]);
    const [newTaskRemindAt, setNewTaskRemindAt] = useState('');

    const priorityOptions = [
        { value: 'High', label: 'High' },
        { value: 'Medium', label: 'Medium' },
        { value: 'Low', label: 'Low' }
    ];

    useEffect(() => {
        if (userId) {
            categoryService.getAllByUser(userId).then(res => {
                setCategoryOptions((res.data || []).map(c => ({ value: c.id, label: c.name })));
            });
        }
        if (initialData) {
            setSprintName(initialData.name);
            setSprintDateRange([toDate(initialData.startDate), toDate(initialData.endDate)]);
            setTasks((initialData.tasks || []).map(t => ({
                ...t,
                startDate: Array.isArray(t.startDate) ? formatDate(toDate(t.startDate)) : t.startDate,
                endDate: Array.isArray(t.endDate) ? formatDate(toDate(t.endDate)) : t.endDate,
            })));
        }
    }, [userId, initialData]);

    const checkTaskBounds = (tStartDate, tEndDate) => {
        if (!sprintStartDate || !sprintEndDate) return true;
        const tStart = new Date(tStartDate).setHours(0, 0, 0, 0);
        const tEnd = new Date(tEndDate).setHours(0, 0, 0, 0);
        const sStart = sprintStartDate.setHours(0, 0, 0, 0);
        const sEnd = sprintEndDate.setHours(0, 0, 0, 0);
        return (tStart >= sStart && tEnd <= sEnd);
    };

    const openAddTask = () => {
        setEditingTaskIndex(null);
        setNewTaskName('');
        setNewTaskPriority({ value: 'Medium', label: 'Medium' });
        setNewTaskCategory(null);
        setNewTaskDateRange([sprintStartDate, sprintEndDate]);
        setNewTaskRemindAt('');
        setShowTaskModal(true);
    };

    const openEditTask = (idx) => {
        const t = tasks[idx];
        setEditingTaskIndex(idx);
        setNewTaskName(t.name || '');
        setNewTaskPriority({ value: t.priority || 'Medium', label: t.priority || 'Medium' });
        const catOpt = t.category ? categoryOptions.find(o => o.value === t.category.id) || { value: t.category.id, label: t.categoryName || 'Unknown' } : null;
        setNewTaskCategory(catOpt);
        setNewTaskDateRange([toDate(t.startDate), toDate(t.endDate)]);
        setNewTaskRemindAt(t.remindAt ? t.remindAt.substring(0, 16) : '');
        setShowTaskModal(true);
    };

    const handleSaveTask = (e) => {
        e.preventDefault();
        if (!newTaskName.trim() || !newTaskDateRange[0] || !newTaskDateRange[1]) return;

        if (!checkTaskBounds(newTaskDateRange[0], newTaskDateRange[1])) {
            alert("Error: Task dates must be within the Sprint start and end dates.");
            return;
        }

        const taskData = {
            ...(editingTaskIndex !== null ? tasks[editingTaskIndex] : {}),
            name: newTaskName,
            priority: newTaskPriority.value,
            startDate: formatDate(newTaskDateRange[0]),
            endDate: formatDate(newTaskDateRange[1]),
            remindAt: newTaskRemindAt ? `${newTaskRemindAt}:00` : null,
            category: newTaskCategory ? { id: parseInt(newTaskCategory.value) } : null,
            categoryName: newTaskCategory ? newTaskCategory.label : 'Uncategorized'
        };

        if (editingTaskIndex !== null) {
            const updated = [...tasks];
            updated[editingTaskIndex] = taskData;
            setTasks(updated);
        } else {
            setTasks([...tasks, taskData]);
        }

        setShowTaskModal(false);
        setEditingTaskIndex(null);
    };

    const handleRemoveTask = (indexToRemove) => {
        setTasks(tasks.filter((_, idx) => idx !== indexToRemove));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        if (!sprintStartDate || !sprintEndDate) {
            setErrorMsg("Please select a valid date range for the Sprint.");
            return;
        }

        const invalidTasks = tasks.filter(t => !checkTaskBounds(t.startDate, t.endDate));
        if (invalidTasks.length > 0) {
            setErrorMsg(`Cannot save: ${invalidTasks.length} task(s) have dates outside the current Sprint boundaries. Please fix them before saving.`);
            return;
        }

        try {
            const payload = {
                name: sprintName,
                startDate: formatDate(sprintStartDate),
                endDate: formatDate(sprintEndDate),
                tasks,
                userId
            };
            if (initialData?.id) await sprintService.update(initialData.id, payload);
            else await sprintService.create(payload);
            onSprintCreated();
        } catch (error) { setErrorMsg("Failed to save Sprint. Please try again."); }
    };

    return (
        <div className="form-card">
            <h2>{initialData ? 'Edit Sprint' : 'Create New Sprint'}</h2>
            {errorMsg && <div className="error-banner">{errorMsg}</div>}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Sprint Name</label>
                    <input type="text" placeholder="e.g., Q1 Refactoring Sprint" value={sprintName} onChange={e => setSprintName(e.target.value)} required />
                </div>

                <div className="form-group">
                    <label>Sprint Duration (Drag to select range)</label>
                    <DatePicker
                        selectsRange={true}
                        startDate={sprintStartDate}
                        endDate={sprintEndDate}
                        onChange={(update) => setSprintDateRange(update)}
                        isClearable={true}
                        placeholderText="Select Start Date → End Date"
                        className="date-picker-input"
                        required
                    />
                </div>

                <div style={{ margin: '20px 0', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <label style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Sprint Tasks</label>
                        <button type="button" className="btn-secondary" onClick={openAddTask}>+ Add Task</button>
                    </div>

                    <ul className="task-list">
                        {tasks.map((t, idx) => (
                            <li key={idx} className="task-item">
                                <div>
                                    <span className="task-name">{t.name}</span>
                                    <span className="task-meta">
                                        {t.startDate} to {t.endDate} • {t.categoryName || 'Uncategorized'}
                                        {t.remindAt && <span style={{ color: '#f59e0b', marginLeft: '8px' }}>⏰ {t.remindAt.replace('T', ' ').substring(0, 16)}</span>}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button type="button" className="btn-edit" onClick={() => openEditTask(idx)}>Edit</button>
                                    <button type="button" className="btn-delete" onClick={() => handleRemoveTask(idx)}>Remove</button>
                                </div>
                            </li>
                        ))}
                        {tasks.length === 0 && <p className="empty-tasks">No tasks added yet.</p>}
                    </ul>
                </div>
                <button type="submit" className="btn-submit" style={{ width: '100%', marginTop: '10px' }}>Save Sprint</button>
            </form>

            {showTaskModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header"><h3>{editingTaskIndex !== null ? 'Edit Task' : 'Add Task to Sprint'}</h3></div>
                        <div className="form-group">
                            <label>Task Name</label>
                            <input type="text" placeholder="e.g., Build Login API" value={newTaskName} onChange={e => setNewTaskName(e.target.value)} />
                        </div>

                        <div className="form-group">
                            <label>Task Dates (Must be within Sprint)</label>
                            <DatePicker
                                selectsRange={true}
                                startDate={newTaskDateRange[0]}
                                endDate={newTaskDateRange[1]}
                                onChange={(update) => setNewTaskDateRange(update)}
                                isClearable={true}
                                placeholderText="Select Task Duration..."
                                className="date-picker-input"
                            />
                        </div>

                        {/* NEW: Input for Custom Reminder Time */}
                        <div className="form-group">
                            <label>Reminder (Exact Date & Time)</label>
                            <input
                                type="datetime-local"
                                value={newTaskRemindAt}
                                onChange={(e) => setNewTaskRemindAt(e.target.value)}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '15px' }}>
                            <div className="form-group" style={{ flex: 1 }}>
                                <label>Category</label>
                                <Select
                                    value={newTaskCategory}
                                    onChange={setNewTaskCategory}
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
                                    value={newTaskPriority}
                                    onChange={setNewTaskPriority}
                                    options={priorityOptions}
                                    classNamePrefix="react-select"
                                    menuPortalTarget={document.body}
                                    styles={{ menuPortal: base => ({ ...base, zIndex: 99999 }) }}
                                />
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={() => { setShowTaskModal(false); setEditingTaskIndex(null); }}>Cancel</button>
                            <button className="btn-save" onClick={handleSaveTask}>
                                {editingTaskIndex !== null ? 'Update Task' : 'Add Task'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SprintForm;