import React, { useState, useEffect } from 'react';
import { sprintService } from '../../api';
import './SprintForm.css';

const SprintForm = ({ onSprintCreated, initialData, userId }) => {
    const [sprint, setSprint] = useState({
        name: '',
        startDate: '',
        endDate: '',
        tasks: []
    });

    const [showTaskModal, setShowTaskModal] = useState(false);

    // Task state mimicking the updated backend Entity (defaulting completed to false)
    const [newTask, setNewTask] = useState({
        name: '',
        priority: 'Medium',
        startDate: '',
        endDate: '',
        completed: false
    });

    useEffect(() => {
        if (initialData) {
            setSprint(initialData);
        }
    }, [initialData]);

    const handleAddTask = (e) => {
        e.preventDefault();
        if (!newTask.name.trim() || !newTask.startDate || !newTask.endDate) return;

        setSprint({
            ...sprint,
            tasks: [...sprint.tasks, newTask]
        });

        // Reset task modal
        setNewTask({ name: '', priority: 'Medium', startDate: '', endDate: '', completed: false });
        setShowTaskModal(false);
    };

    const handleRemoveTask = async (indexToRemove) => {
        const taskToRemove = sprint.tasks[indexToRemove];

        // If editing an existing sprint and deleting a task that's already in the DB
        if (initialData?.id && taskToRemove.id) {
            if (window.confirm("Permanently delete this task from the sprint?")) {
                try {
                    await sprintService.deleteTask(initialData.id, taskToRemove.id);
                } catch (err) {
                    console.error("Failed to delete task directly", err);
                    return;
                }
            } else {
                return;
            }
        }

        setSprint({
            ...sprint,
            tasks: sprint.tasks.filter((_, index) => index !== indexToRemove)
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Include userId so backend tracks who owns this
            const payload = { ...sprint, userId };

            if (initialData?.id) {
                // UPDATE (PUT)
                await sprintService.update(initialData.id, payload);

                // If tasks were newly added during Edit mode (they lack an ID), hit the Add Task endpoint
                const freshlyAddedTasks = sprint.tasks.filter(t => !t.id);
                for (const task of freshlyAddedTasks) {
                    await sprintService.addTask(initialData.id, task);
                }
            } else {
                // CREATE (POST) - Backend cascading saves tasks automatically on creation
                await sprintService.create(payload);
            }
            onSprintCreated();
        } catch (error) {
            console.error("Save failed:", error);
            alert("Error saving sprint. Ensure task dates are strictly within sprint start/end dates.");
        }
    };

    const openTaskModal = () => {
        if (!sprint.startDate || !sprint.endDate) {
            alert("Please set Sprint Start and End dates before adding tasks!");
            return;
        }
        setShowTaskModal(true);
    };

    return (
        <div className="form-card">
            <h2>{initialData ? 'Edit Sprint' : 'Create New Sprint'}</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Sprint Name</label>
                    <input
                        type="text"
                        value={sprint.name}
                        onChange={e => setSprint({ ...sprint, name: e.target.value })}
                        required
                    />
                </div>

                <div className="form-group-row">
                    <div className="form-group">
                        <label>Start Date</label>
                        <input
                            type="date"
                            value={sprint.startDate}
                            onChange={e => setSprint({ ...sprint, startDate: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>End Date</label>
                        <input
                            type="date"
                            value={sprint.endDate}
                            onChange={e => setSprint({ ...sprint, endDate: e.target.value })}
                            required
                        />
                    </div>
                </div>

                <div className="task-header-row">
                    <h3>Tasks ({sprint.tasks.length})</h3>
                    <button type="button" className="btn-open-modal" onClick={openTaskModal}>
                        + Add Task
                    </button>
                </div>

                <ul className="task-preview-list">
                    {sprint.tasks.map((t, index) => (
                        <li key={index} className="task-item">
                            <div className="task-info">
                                <strong style={{ textDecoration: t.completed ? 'line-through' : 'none' }}>
                                    {t.name}
                                </strong>
                                <span style={{ fontSize: '0.8rem', color: '#666', marginLeft: '10px' }}>
                                    ({t.startDate} - {t.endDate})
                                </span>
                            </div>
                            <button type="button" onClick={() => handleRemoveTask(index)} className="btn-remove">✕</button>
                        </li>
                    ))}
                </ul>

                <button type="submit" className="btn-submit">
                    {initialData ? 'Update Sprint' : 'Save Full Sprint'}
                </button>
            </form>

            {/* TASK CREATION MODAL */}
            {showTaskModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>New Task</h3>
                        <div className="form-group">
                            <label>Task Title</label>
                            <input
                                autoFocus
                                type="text"
                                value={newTask.name}
                                onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                                placeholder="What needs to be done?"
                            />
                        </div>

                        <div className="form-group-row">
                            <div className="form-group">
                                <label>Start Date</label>
                                <input
                                    type="date"
                                    min={sprint.startDate}
                                    max={sprint.endDate}
                                    value={newTask.startDate}
                                    onChange={e => setNewTask({ ...newTask, startDate: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>End Date</label>
                                <input
                                    type="date"
                                    min={newTask.startDate || sprint.startDate}
                                    max={sprint.endDate}
                                    value={newTask.endDate}
                                    onChange={e => setNewTask({ ...newTask, endDate: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Priority</label>
                            <select
                                value={newTask.priority}
                                onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>
                        </div>

                        <div className="modal-actions">
                            <button type="button" className="btn-cancel" onClick={() => setShowTaskModal(false)}>Cancel</button>
                            <button type="button" className="btn-confirm" onClick={handleAddTask}>Add to Sprint</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SprintForm;