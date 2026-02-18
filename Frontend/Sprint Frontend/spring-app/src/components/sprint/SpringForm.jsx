import React, { useState } from 'react';
import './SprintForm.css';
import { sprintService } from './SprintService.jsx';


const SprintForm = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [sprint, setSprint] = useState({
        name: '',
        startDate: '',
        endDate: '',
        tasks: [] // Starts empty
    });

    // Temporary state for the task currently being typed in the modal
    const [currentTask, setCurrentTask] = useState({
        name: '',
        priority: 'LOW',
        dueDate: ''
    });

    const handleSprintChange = (e) => {
        const { name, value } = e.target;
        setSprint(prev => ({ ...prev, [name]: value }));
    };

    const handleTaskInput = (e) => {
        const { name, value } = e.target;
        setCurrentTask(prev => ({ ...prev, [name]: value }));
    };

    const confirmAddTask = () => {
        if (!currentTask.name) return alert("Task name is required");

        setSprint(prev => ({
            ...prev,
            tasks: [...prev.tasks, currentTask]
        }));

        // Reset and close
        setCurrentTask({ name: '', priority: 'LOW', dueDate: '' });
        setIsModalOpen(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Sending to Spring Boot:", sprint);
    };

    return (
        <div className="sprint-container">
            <form className="sprint-card" onSubmit={handleSubmit}>
                <h2>New Sprint</h2>

                <div className="form-group">
                    <label>Sprint Name</label>
                    <input name="name" value={sprint.name} onChange={handleSprintChange} placeholder="e.g., Winter Cleanup" required />
                </div>

                <div className="date-row">
                    <div className="form-group">
                        <label>Start Date</label>
                        <input type="date" name="startDate" value={sprint.startDate} onChange={handleSprintChange} required />
                    </div>
                    <div className="form-group">
                        <label>End Date</label>
                        <input type="date" name="endDate" value={sprint.endDate} onChange={handleSprintChange} required />
                    </div>
                </div>

                <div className="task-section">
                    <h3>Tasks ({sprint.tasks.length})</h3>
                    <ul className="task-list">
                        {sprint.tasks.map((t, i) => (
                            <li key={i}>
                                <span>{t.name}</span>
                                <span className={`badge ${t.priority.toLowerCase()}`}>{t.priority}</span>
                            </li>
                        ))}
                    </ul>
                    <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(true)}>
                        + Add Task
                    </button>
                </div>

                <button type="submit" className="btn-primary">Create Sprint</button>
            </form>

            {/* MODAL SECTION */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Add New Task</h3>
                        <div className="form-group">
                            <label>Task Name</label>
                            <input name="name" value={currentTask.name} onChange={handleTaskInput} autoFocus />
                        </div>
                        <div className="form-group">
                            <label>Priority</label>
                            <select name="priority" value={currentTask.priority} onChange={handleTaskInput}>
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Due Date</label>
                            <input type="date" name="dueDate" value={currentTask.dueDate} onChange={handleTaskInput} />
                        </div>
                        <div className="modal-actions">
                            <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
                            <button type="button" className="btn-confirm" onClick={confirmAddTask}>Add to Sprint</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SprintForm;