import React, { useState, useEffect } from 'react';
import { sprintService } from '../../api';
import './SprintDashboard.css';
import SprintForm from './SprintForm';

const SprintDashboard = ({ userId }) => {
  const [sprints, setSprints] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingSprint, setEditingSprint] = useState(null);

  // State to track which sprint's tasks we are viewing in the modal
  const [selectedSprintTasks, setSelectedSprintTasks] = useState(null);

  const fetchSprints = async () => {
    if (!userId) return;
    try {
      const response = await sprintService.getAllByUser(userId);
      setSprints(response.data);
    } catch (error) {
      console.error("Error loading sprints:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this sprint?")) {
      try {
        await sprintService.delete(id);
        fetchSprints();
      } catch (error) {
        console.error("Delete failed:", error);
      }
    }
  };

  const handleEdit = (sprint) => {
    setEditingSprint(sprint);
    setShowForm(true);
  };

  // Toggle task completion from the modal
  const handleToggleTask = async (task) => {
    try {
      const newStatus = !task.completed;

      // Update Database
      await sprintService.toggleTaskCompletion(selectedSprintTasks.id, task.id, newStatus);

      // Update local modal state instantly for smooth UI
      setSelectedSprintTasks(prev => ({
        ...prev,
        tasks: prev.tasks.map(t => t.id === task.id ? { ...t, completed: newStatus } : t)
      }));

      // Refresh background table data quietly
      fetchSprints();
    } catch (err) {
      console.error("Failed to toggle task status", err);
    }
  };

  useEffect(() => {
    fetchSprints();
  }, [userId]);

  return (
    <div className="dashboard-container">
      <header className="main-header">
        <div className="header-content">
          <h1>Project Roadmap</h1>
          <p className="subtitle">Manage your sprints and team velocity</p>
        </div>
      </header>

      <div className="action-bar">
        <button className="btn-add-sprint" onClick={() => {
          setEditingSprint(null);
          setShowForm(!showForm);
        }}>
          {showForm ? '← Back to Roadmap' : '+ Create New Sprint'}
        </button>
      </div>

      <main className="dashboard-content">
        {showForm ? (
          <SprintForm
            userId={userId}
            initialData={editingSprint}
            onSprintCreated={() => {
              setShowForm(false);
              setEditingSprint(null);
              fetchSprints();
            }}
          />
        ) : (
          <div className="table-wrapper">
            <table className="sprint-table">
              <thead>
                <tr>
                  <th>Sprint Name</th>
                  <th>Duration</th>
                  <th>Tasks</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sprints.length > 0 ? (
                  sprints.map(s => (
                    <tr key={s.id}>
                      <td><strong>{s.name}</strong></td>
                      <td>{s.startDate} — {s.endDate}</td>
                      <td>
                        {/* Clickable Task Badge */}
                        <button
                          className="btn-task-badge"
                          onClick={() => setSelectedSprintTasks(s)}
                          title="Click to view tasks"
                        >
                          <span className="task-badge">{s.tasks?.length || 0} Tasks</span>
                        </button>
                      </td>
                      <td>
                        <button className="btn-edit" onClick={() => handleEdit(s)}>Edit</button>
                        <button className="btn-delete" onClick={() => handleDelete(s.id)}>Delete</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="empty-row">No sprints found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* TASK LIST MODAL */}
      {selectedSprintTasks && (
        <div className="modal-overlay">
          <div className="modal-content task-list-modal">
            <div className="modal-header-row">
              <h3>Tasks for "{selectedSprintTasks.name}"</h3>
            </div>

            <div className="task-list-body">
              {selectedSprintTasks.tasks?.length > 0 ? (
                <ul className="read-only-task-list">
                  {selectedSprintTasks.tasks.map((task, index) => (

                    <li key={index} className={`read-only-task-item ${task.completed ? 'task-completed' : ''}`}>

                      <div className="task-details-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>

                        {/* Checkbox to toggle status */}
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => handleToggleTask(task)}
                          style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        />

                        <div className="task-details">
                          <span className="task-title" style={{
                            textDecoration: task.completed ? 'line-through' : 'none',
                            color: task.completed ? '#9ca3af' : '#111'
                          }}>
                            <strong>{task.name}</strong>
                          </span>
                          <span className="task-dates">🗓️ {task.startDate} to {task.endDate}</span>
                        </div>
                      </div>

                      <span className={`task-priority priority-${task.priority?.toLowerCase() || 'medium'}`}>
                        {task.priority || 'Medium'}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="no-tasks-msg">No tasks have been added to this sprint yet.</p>
              )}
            </div>

            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={() => setSelectedSprintTasks(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SprintDashboard;