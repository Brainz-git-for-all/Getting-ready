import React, { useState, useEffect } from 'react';
import { sprintService, quickTaskService } from '../../api';
import SprintForm from './SprintForm';
import QuickTaskForm from './QuickTaskForm';
import { customConfirm } from '../AlertSystem';

const SprintDashboard = ({ userId }) => {
  const [sprints, setSprints] = useState([]);
  const [quickTasks, setQuickTasks] = useState([]);

  // Controls which table is currently visible
  const [viewMode, setViewMode] = useState('sprints');

  const [showSprintForm, setShowSprintForm] = useState(false);
  const [editingSprint, setEditingSprint] = useState(null);
  const [selectedSprintTasks, setSelectedSprintTasks] = useState(null);
  const [showQuickTaskForm, setShowQuickTaskForm] = useState(false);

  const fetchData = async () => {
    if (!userId) return;
    try {
      const [sprintRes, qtRes] = await Promise.all([
        sprintService.getAllByUser(userId),
        quickTaskService.getAllByUser(userId)
      ]);

      const fetchedSprints = sprintRes.data || [];
      const fetchedQuickTasks = qtRes.data || [];

      setSprints(fetchedSprints);
      setQuickTasks(fetchedQuickTasks);

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
    setEditingSprint(sprint); setShowQuickTaskForm(false); setShowSprintForm(true);
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

  const handleToggleQuickTask = async (qt) => {
    await quickTaskService.update(qt.id, { ...qt, completed: !qt.completed });
    fetchData();
  };

  const handleDeleteQuickTask = async (id) => {
    const isConfirmed = await customConfirm("Delete Task", "Are you sure?", "Delete");
    if (isConfirmed) { await quickTaskService.delete(id); fetchData(); }
  };

  return (
    <div className="dashboard-container">
      <div className="action-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>

        {/* PILL TOGGLE BUTTONS */}
        {!showSprintForm && !showQuickTaskForm ? (
          <div className="view-toggle">
            <button
              type="button"
              className={`toggle-btn ${viewMode === 'sprints' ? 'active' : ''}`}
              onClick={() => setViewMode('sprints')}
            >
              {/* Layered "Stack" Icon for Sprints */}
              <svg className="toggle-icon" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                <polyline points="2 17 12 22 22 17"></polyline>
                <polyline points="2 12 12 17 22 12"></polyline>
              </svg>
            </button>
            <button
              type="button"
              className={`toggle-btn ${viewMode === 'tasks' ? 'active' : ''}`}
              onClick={() => setViewMode('tasks')}
            >
              {/* "Flash" Lightning Icon for Quick Tasks */}
              <svg className="toggle-icon" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
              </svg>
            </button>
          </div>
        ) : <div />}

        {/* DYNAMIC CREATE BUTTONS */}
        <div style={{ display: 'flex', gap: '10px' }}>
          {viewMode === 'sprints' && !showQuickTaskForm && (
            <button className="btn-add-sprint" onClick={() => { setEditingSprint(null); setShowSprintForm(!showSprintForm); }}>
              {showSprintForm ? '← Back' : '+ Create Sprint'}
            </button>
          )}
          {viewMode === 'tasks' && !showSprintForm && (
            <button className="btn-add-sprint" style={{ backgroundColor: 'var(--warning)' }} onClick={() => setShowQuickTaskForm(!showQuickTaskForm)}>
              {showQuickTaskForm ? '← Back' : '⚡ Add Quick Task'}
            </button>
          )}
        </div>
      </div>

      <main className="dashboard-content">
        {showSprintForm && <SprintForm userId={userId} initialData={editingSprint} onSprintCreated={() => { setShowSprintForm(false); fetchData(); }} />}
        {showQuickTaskForm && <QuickTaskForm userId={userId} onTaskCreated={() => { setShowQuickTaskForm(false); fetchData(); }} onCancel={() => setShowQuickTaskForm(false)} />}

        {!showSprintForm && !showQuickTaskForm && (
          <div className="table-wrapper">

            {/* SPRINTS TABLE VIEW */}
            {viewMode === 'sprints' && (
              <table className="sprint-table">
                <thead><tr><th>Name</th><th>Timeframe</th><th>Tasks</th><th>Actions</th></tr></thead>
                <tbody>
                  {sprints.length === 0 ? (
                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: '#6b7280' }}>No Sprints found.</td></tr>
                  ) : (
                    sprints.map(s => (
                      <tr key={`sprint-${s.id}`}>
                        <td>
                          {/* Icon inside Table */}
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
            )}

            {/* QUICK TASKS TABLE VIEW */}
            {viewMode === 'tasks' && (
              <table className="sprint-table">
                <thead><tr><th>Task Name</th><th>Timeframe</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {quickTasks.length === 0 ? (
                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: '#6b7280' }}>No Quick Tasks found.</td></tr>
                  ) : (
                    quickTasks.map(qt => (
                      <tr key={`qt-${qt.id}`}>
                        <td style={{ textDecoration: qt.completed ? 'line-through' : 'none', color: qt.completed ? '#9ca3af' : 'inherit' }}>
                          {/* Icon inside Table */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={qt.completed ? '#9ca3af' : '#f59e0b'} strokeWidth="2">
                              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                            </svg>
                            <strong>{qt.name}</strong>
                          </div>
                        </td>
                        <td><span style={{ backgroundColor: '#f3f4f6', padding: '4px 8px', borderRadius: '4px' }}>{qt.startDate} - {qt.endDate}</span></td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input type="checkbox" checked={qt.completed} onChange={() => handleToggleQuickTask(qt)} style={{ cursor: 'pointer' }} />
                            <span style={{
                              backgroundColor: qt.completed ? '#dcfce7' : '#fef3c7',
                              color: qt.completed ? '#166534' : '#92400e',
                              padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold'
                            }}>
                              {qt.completed ? 'Done' : 'Pending'}
                            </span>
                          </div>
                        </td>
                        <td><button className="btn-delete" onClick={() => handleDeleteQuickTask(qt.id)}>Delete</button></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
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