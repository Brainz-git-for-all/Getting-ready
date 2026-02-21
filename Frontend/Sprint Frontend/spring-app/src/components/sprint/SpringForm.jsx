import React, { useState, useEffect } from 'react';
import { sprintService } from '../../api';
import './SprintForm.css';

const SprintForm = ({ onSprintCreated, initialData }) => {
    const [sprint, setSprint] = useState({
        name: '',
        startDate: '',
        endDate: '',
        tasks: []
    });

    const [showTaskModal, setShowTaskModal] = useState(false);
    const [taskName, setTaskName] = useState('');

    // Load data if we are in "Edit" mode
    useEffect(() => {
        if (initialData) {
            setSprint(initialData);
        }
    }, [initialData]);

    const handleAddTask = (e) => {
        e.preventDefault();
        if (!taskName.trim()) return;

        setSprint({
            ...sprint,
            tasks: [...sprint.tasks, { title: taskName, status: 'TODO' }]
        });

        setTaskName('');
        setShowTaskModal(false);
    };

    const handleRemoveTask = (indexToRemove) => {
        setSprint({
            ...sprint,
            tasks: sprint.tasks.filter((_, index) => index !== indexToRemove)
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (initialData?.id) {
                // UPDATE (PUT)
                await sprintService.update(initialData.id, sprint);
            } else {
                // CREATE (POST)
                await sprintService.create(sprint);
            }
            onSprintCreated(); // Callback to refresh dashboard
        } catch (error) {
            console.error("Save failed:", error);
        }
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
                    <button type="button" className="btn-open-modal" onClick={() => setShowTaskModal(true)}>
                        + Add Task
                    </button>
                </div>

                <ul className="task-preview-list">
                    {sprint.tasks.map((t, index) => (
                        <li key={index} className="task-item">
                            <span>{t.title}</span>
                            <button type="button" onClick={() => handleRemoveTask(index)} className="btn-remove">✕</button>
                        </li>
                    ))}
                </ul>

                <button type="submit" className="btn-submit">
                    {initialData ? 'Update Sprint' : 'Save Full Sprint'}
                </button>
            </form>

            {/* TASK MODAL */}
            {showTaskModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>New Task</h3>
                        <div className="form-group">
                            <label>Task Title</label>
                            <input
                                autoFocus
                                type="text"
                                value={taskName}
                                onChange={(e) => setTaskName(e.target.value)}
                                placeholder="What needs to be done?"
                                onKeyDown={(e) => e.key === 'Enter' && handleAddTask(e)}
                            />
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