import React, { useState, useEffect } from 'react';
import { sprintService } from '../../api';
import './SprintDashboard.css';
import SprintForm from './SpringForm.jsx';

const SprintDashboard = () => {
  const [sprints, setSprints] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingSprint, setEditingSprint] = useState(null);

  const fetchSprints = async () => {
    try {
      const response = await sprintService.getAll();
      setSprints(response.data);
    } catch (error) {
      console.error("Error loading sprints:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this sprint?")) {
      try {
        await sprintService.delete(id);
        fetchSprints(); // Refresh list
      } catch (error) {
        console.error("Delete failed:", error);
      }
    }
  };

  const handleEdit = (sprint) => {
    setEditingSprint(sprint);
    setShowForm(true);
  };

  useEffect(() => {
    fetchSprints();
  }, []);

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
                      <td><span className="task-badge">{s.tasks?.length || 0}</span></td>
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
    </div>
  );
};

export default SprintDashboard;