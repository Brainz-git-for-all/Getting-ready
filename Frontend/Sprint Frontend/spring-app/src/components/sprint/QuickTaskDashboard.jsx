import React, { useState, useEffect } from 'react';
import { quickTaskService } from '../../api';
import QuickTaskForm from './QuickTaskForm';
import { customConfirm } from '../AlertSystem';

const QuickTaskDashboard = ({ userId }) => {
  const [quickTasks, setQuickTasks] = useState([]);
  const [showQuickTaskForm, setShowQuickTaskForm] = useState(false);
  const [editingQuickTask, setEditingQuickTask] = useState(null);

  const fetchData = async () => {
    if (!userId) return;
    try {
      const qtRes = await quickTaskService.getAllByUser(userId);
      setQuickTasks(qtRes.data || []);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  useEffect(() => { fetchData(); }, [userId]);

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
      <div className="action-bar" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '24px' }}>
        {!showQuickTaskForm && (
          <button className="btn-add-sprint" style={{ backgroundColor: 'var(--warning)' }} onClick={() => { setEditingQuickTask(null); setShowQuickTaskForm(true); }}>
            ⚡ Add Quick Task
          </button>
        )}
      </div>

      <main className="dashboard-content">
        {showQuickTaskForm && (
          <QuickTaskForm
            userId={userId}
            existingTask={editingQuickTask}
            onTaskCreated={() => { setShowQuickTaskForm(false); setEditingQuickTask(null); fetchData(); }}
            onCancel={() => { setShowQuickTaskForm(false); setEditingQuickTask(null); }}
          />
        )}

        {!showQuickTaskForm && (
          <div className="table-wrapper">
            <table className="sprint-table">
              <thead><tr><th>Task Name</th><th>Timeframe</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {quickTasks.length === 0 ? (
                  <tr><td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: '#6b7280' }}>No Quick Tasks found.</td></tr>
                ) : (
                  quickTasks.map(qt => (
                    <tr key={`qt-${qt.id}`}>
                      <td style={{ textDecoration: qt.completed ? 'line-through' : 'none', color: qt.completed ? '#9ca3af' : 'inherit' }}>
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
                      <td>
                          <button className="btn-edit" onClick={() => { setEditingQuickTask(qt); setShowQuickTaskForm(true); }}>Edit</button>
                          <button className="btn-delete" onClick={() => handleDeleteQuickTask(qt.id)}>Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default QuickTaskDashboard;
