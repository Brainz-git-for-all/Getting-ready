import React, { useState, useEffect } from 'react';
import { sprintService } from '../../api';
import SprintForm from './SprintForm';
import { customConfirm } from '../AlertSystem';

const SprintDashboard = ({ userId }) => {
  const [sprints, setSprints] = useState([]);

  const [showSprintForm, setShowSprintForm] = useState(false);
  const [editingSprint, setEditingSprint] = useState(null);
  const [selectedSprintTasks, setSelectedSprintTasks] = useState(null);

  const fetchData = async () => {
    if (!userId) return;
    try {
      const sprintRes = await sprintService.getAllByUser(userId);
      const fetchedSprints = sprintRes.data || [];

      setSprints(fetchedSprints);

      if (selectedSprintTasks) {
        const updatedSprint = fetchedSprints.find(s => s.id === selectedSprintTasks.id);
        setSelectedSprintTasks(updatedSprint || null);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  useEffect(() => { fetchData(); }, [userId]);

  const handleDeleteSprint = async (id) => {
    const isConfirmed = await customConfirm("Delete Sprint", "Are you sure you want to delete this sprint?", "Delete Sprint");
    if (isConfirmed) { await sprintService.delete(id); fetchData(); }
  };

  const handleEditSprint = (sprint) => {
    setEditingSprint(sprint); setShowSprintForm(true);
  };

  const handleToggleTask = async (task) => {
    await sprintService.toggleTaskCompletion(selectedSprintTasks.id, task.id, !task.completed);
    fetchData();
  };

  const handleDeleteSpecificTask = async (taskId) => {
    const isConfirmed = await customConfirm("Remove Task", "Are you sure you want to delete this task from the sprint?", "Delete");
    if (isConfirmed) {
      await sprintService.deleteTask(selectedSprintTasks.id, taskId);
      fetchData();
    }
  };

  return (
    <div className="dashboard-container">
      <div className="action-bar" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '24px' }}>
        {!showSprintForm && (
          <button className="btn-add-sprint" onClick={() => { setEditingSprint(null); setShowSprintForm(true); }}>
            + Create Sprint
          </button>
        )}
      </div>

      <main className="dashboard-content">
        {showSprintForm && <SprintForm userId={userId} initialData={editingSprint} onSprintCreated={() => { setShowSprintForm(false); fetchData(); }} />}

        {!showSprintForm && (
          <div className="table-wrapper">
            <table className="sprint-table">
              <thead><tr><th>Name</th><th>Timeframe</th><th>Tasks</th><th>Actions</th></tr></thead>
              <tbody>
                {sprints.length === 0 ? (
                  <tr><td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: '#6b7280' }}>No Sprints found.</td></tr>
                ) : (
                  sprints.map(s => (
                    <tr key={`sprint-${s.id}`}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2">
                            <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                            <polyline points="2 17 12 22 22 17"></polyline>
                            <polyline points="2 12 12 17 22 12"></polyline>
                          </svg>
                          <strong>{s.name}</strong>
                        </div>
                      </td>
                      <td>{s.startDate} — {s.endDate}</td>
                      <td>
                        <span className="task-badge" style={{ cursor: 'pointer' }} onClick={() => setSelectedSprintTasks(s)}>
                          {s.tasks?.length || 0} Tasks (View)
                        </span>
                      </td>
                      <td>
                        <button className="btn-edit" onClick={() => handleEditSprint(s)}>Edit</button>
                        <button className="btn-delete" onClick={() => handleDeleteSprint(s.id)}>Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* VIEW SPRINT TASKS MODAL */}
      {selectedSprintTasks && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header"><h3>Tasks for "{selectedSprintTasks.name}"</h3></div>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {selectedSprintTasks.tasks?.length > 0 ? (
                selectedSprintTasks.tasks.map((task, index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input type="checkbox" checked={task.completed} onChange={() => handleToggleTask(task)} style={{ cursor: 'pointer' }} />
                      <div>
                        <span style={{ textDecoration: task.completed ? 'line-through' : 'none', color: task.completed ? 'var(--text-muted)' : 'var(--text-main)', display: 'block', fontWeight: 600 }}>{task.name}</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{task.startDate} to {task.endDate}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <button className="pop-del" onClick={() => handleDeleteSpecificTask(task.id)}>×</button>
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No tasks added yet.</p>
              )}
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setSelectedSprintTasks(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SprintDashboard;
