import React, { useState, useEffect } from 'react';
import { sprintService } from '../../api';
import './SprintDashboard.css';
import SprintForm from './SpringForm.jsx';

const SprintDashboard = () => {
  const [sprints, setSprints] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const fetchSprints = async () => {
    try {
      const response = await sprintService.getAll();
      setSprints(response.data);
    } catch (error) {
      console.error("Error loading sprints:", error);
    }
  };

  useEffect(() => {
    fetchSprints();
  }, []);

  return (
    <div className="dashboard-container">
      {/* NEW HEADER STRUCTURE */}
      <header className="main-header">
        <div className="header-content">
          <div className="title-section">
            <h1>Project Roadmap</h1>
            <p className="subtitle">Manage your sprints and team velocity</p>
          </div>
        </div>
      </header>
      < div className="action-bar">
        <button className="btn-add-sprint" onClick={() => setShowForm(!showForm)}>
        {showForm ? '← Back to Roadmap' : '+ Create New Sprint'}
      </button>
      </div>


      <main className="dashboard-content">
        {showForm ? (
          <SprintForm onSprintCreated={() => {
            setShowForm(false);
            fetchSprints();
          }} />
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
                        <button className="btn-delete" onClick={() => {/* handle delete */ }}>Delete</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="empty-row">No sprints found. Create one to get started!</td>
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