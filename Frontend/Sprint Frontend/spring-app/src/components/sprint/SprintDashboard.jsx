import React, { useState, useEffect } from 'react';
import { sprintService, quickTaskService } from '../../api';
import SprintForm from './SprintForm';
import QuickTaskForm from './QuickTaskForm';

const SprintDashboard = ({ userId }) => {
  const [sprints, setSprints] = useState([]);
  const [showSprintForm, setShowSprintForm] = useState(false);
  const [editingSprint, setEditingSprint] = useState(null);
  const [selectedSprintTasks, setSelectedSprintTasks] = useState(null);

  const [quickTasks, setQuickTasks] = useState([]);
  const [showQuickTaskForm, setShowQuickTaskForm] = useState(false);

  const fetchData = async () => {
    if (!userId) return;
    try {
      const [sprintRes, qtRes] = await Promise.all([
        sprintService.getAllByUser(userId),
        quickTaskService.getAllByUser(userId)
      ]);
      setSprints(sprintRes.data || []);
      setQuickTasks(qtRes.data || []);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
  };

  useEffect(() => { fetchData(); }, [userId]);

  const handleDeleteSprint = async (id) => {
    if (window.confirm("Are you sure you want to delete this sprint?")) {
      await sprintService.delete(id);
      fetchData();
    }
  };

  const handleEditSprint = (sprint) => {
    setEditingSprint(sprint);
    setShowQuickTaskForm(false);
    setShowSprintForm(true);
  };

  const handleToggleTask = async (task) => {
    const newStatus = !task.completed;
    await sprintService.toggleTaskCompletion(selectedSprintTasks.id, task.id, newStatus);
    setSelectedSprintTasks(prev => ({
      ...prev, tasks: prev.tasks.map(t => t.id === task.id ? { ...t, completed: newStatus } : t)
    }));
    fetchData();
  };

  const handleToggleQuickTask = async (qt) => {
    await quickTaskService.update(qt.id, { ...qt, completed: !qt.completed });
    fetchData();
  };

  const handleDeleteQuickTask = async (id) => {
    if (window.confirm("Delete this quick task?")) {
      await quickTaskService.delete(id);
      fetchData();
    }
  };

  return (
    <div className="dashboard-container">
      <div className="action-bar" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginBottom: '20px' }}>
        <button className="btn-add-sprint" onClick={() => { setShowQuickTaskForm(false); setEditingSprint(null); setShowSprintForm(!showSprintForm); }}>
          {showSprintForm ? '← Back to Roadmap' : '+ Create New Sprint'}
        </button>
        {!showSprintForm && (
          <button className="btn-add-sprint" style={{ backgroundColor: '#f59e0b' }} onClick={() => setShowQuickTaskForm(!showQuickTaskForm)}>
            {showQuickTaskForm ? '← Back to Roadmap' : '⚡ Add Quick Task'}
          </button>
        )}
      </div>

      <main className="dashboard-content">
        {showSprintForm && <SprintForm userId={userId} initialData={editingSprint} onSprintCreated={() => { setShowSprintForm(false); setEditingSprint(null); fetchData(); }} />}
        {showQuickTaskForm && !showSprintForm && <QuickTaskForm userId={userId} onTaskCreated={() => { setShowQuickTaskForm(false); fetchData(); }} onCancel={() => setShowQuickTaskForm(false)} />}

        {!showSprintForm && !showQuickTaskForm && (
          <div className="table-wrapper">
            <table className="sprint-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Duration / Type</th>
                  <th>Status / Tasks</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sprints.length === 0 && quickTasks.length === 0 ? (
                  <tr><td colSpan="4" style={{ textAlign: 'center', color: '#6b7280' }}>No Sprints or Quick Tasks found.</td></tr>
                ) : (
                  <>
                    {sprints.map(s => (
                      <tr key={`sprint-${s.id}`}>
                        <td>
                          <div className="icon-text-row">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
                            <strong>{s.name}</strong>
                          </div>
                        </td>
                        <td>{s.startDate} — {s.endDate}</td>
                        <td>
                          <span className="badge badge-blue" style={{ cursor: 'pointer' }} onClick={() => setSelectedSprintTasks(s)}>
                            {s.tasks?.length || 0} Tasks View
                          </span>
                        </td>
                        <td>
                          <button className="btn-edit" onClick={() => handleEditSprint(s)}>Edit</button>
                          <button className="btn-delete" onClick={() => handleDeleteSprint(s.id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                    {quickTasks.map(qt => (
                      <tr key={`qt-${qt.id}`} style={{ backgroundColor: '#f8fafc' }}>
                        <td>
                          <div className="icon-text-row" style={{ textDecoration: qt.completed ? 'line-through' : 'none', color: qt.completed ? '#9ca3af' : 'inherit' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                            <div>
                              <strong>{qt.name}</strong>
                              {qt.description && <div style={{ fontSize: '0.85em', color: '#6b7280', marginTop: '2px' }}>{qt.description}</div>}
                            </div>
                          </div>
                        </td>
                        <td><span className="badge badge-gray">Standalone</span></td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input type="checkbox" checked={qt.completed} onChange={() => handleToggleQuickTask(qt)} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                            <span className={qt.completed ? "badge badge-green" : "badge badge-amber"}>
                              {qt.completed ? 'Done' : 'Pending'}
                            </span>
                          </div>
                        </td>
                        <td>
                          <button className="btn-delete" onClick={() => handleDeleteQuickTask(qt.id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {selectedSprintTasks && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header"><h3>Tasks for "{selectedSprintTasks.name}"</h3></div>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {selectedSprintTasks.tasks?.length > 0 ? (
                selectedSprintTasks.tasks.map((task, index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderBottom: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input type="checkbox" checked={task.completed} onChange={() => handleToggleTask(task)} style={{ cursor: 'pointer' }} />
                      <span style={{ textDecoration: task.completed ? 'line-through' : 'none', color: task.completed ? '#9ca3af' : '#111' }}>{task.name}</span>
                    </div>
                    <span className={task.priority === 'High' ? "badge badge-red" : task.priority === 'Low' ? "badge badge-green" : "badge badge-amber"}>{task.priority || 'Med'}</span>
                  </div>
                ))
              ) : (
                <p style={{ textAlign: 'center', color: '#6b7280' }}>No tasks added yet.</p>
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