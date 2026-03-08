import React, { useState, useEffect } from 'react';
import { reminderService } from '../../api';
import ReminderForm from './ReminderForm';
import './ReminderDashboard.css';

const ReminderDashboard = ({ userId }) => {
    const [reminders, setReminders] = useState([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingReminder, setEditingReminder] = useState(null);

    useEffect(() => {
        if (userId) {
            fetchReminders();
        }
    }, [userId]);

    const fetchReminders = async () => {
        try {
            const response = await reminderService.getAllByUser(userId);
            // Sort by deadline closest to furthest
            const sortedReminders = response.data.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
            setReminders(sortedReminders);
        } catch (error) {
            console.error("Failed to fetch reminders", error);
        }
    };

    const handleCreateOrUpdate = async (reminderData) => {
        try {
            if (editingReminder) {
                await reminderService.update(userId, editingReminder.id, reminderData);
            } else {
                await reminderService.create(userId, reminderData);
            }
            fetchReminders();
            closeForm();
        } catch (error) {
            console.error("Failed to save reminder", error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this reminder?')) {
            try {
                await reminderService.delete(userId, id);
                setReminders(reminders.filter(r => r.id !== id));
            } catch (error) {
                console.error("Failed to delete reminder", error);
            }
        }
    };

    const openForm = (reminder = null) => {
        setEditingReminder(reminder);
        setIsFormOpen(true);
    };

    const closeForm = () => {
        setEditingReminder(null);
        setIsFormOpen(false);
    };

    // Helper function to figure out the status border color
    const getReminderStatusClass = (deadlineDate) => {
        const now = new Date();
        const deadline = new Date(deadlineDate);
        const hoursUntilDeadline = (deadline - now) / (1000 * 60 * 60);

        if (hoursUntilDeadline < 0) return 'overdue';
        if (hoursUntilDeadline < 48) return 'upcoming'; // Due within 48 hours
        return 'normal';
    };

    return (
        <div className="reminder-dashboard">
            <div className="reminder-header">
                <h2>Your Reminders</h2>
                <button className="btn-primary" onClick={() => openForm()}>+ New Reminder</button>
            </div>

            {reminders.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>
                    <p>You don't have any active reminders. Create one to get started!</p>
                </div>
            ) : (
                <div className="reminder-grid">
                    {reminders.map(reminder => (
                        <div key={reminder.id} className={`reminder-card ${getReminderStatusClass(reminder.deadline)}`}>
                            <h3 className="reminder-title">{reminder.name}</h3>

                            <div className="reminder-dates">
                                <div className="reminder-date-row">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                                    <span>Remind: {new Date(reminder.remindAt).toLocaleString()}</span>
                                </div>
                                <div className="reminder-date-row">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                    <span style={{ color: getReminderStatusClass(reminder.deadline) === 'overdue' ? '#ef4444' : 'inherit' }}>
                                        Due: {new Date(reminder.deadline).toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            <div className="reminder-actions">
                                <button className="btn-edit" onClick={() => openForm(reminder)}>Edit</button>
                                <button className="btn-delete" onClick={() => handleDelete(reminder.id)}>Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isFormOpen && (
                <ReminderForm
                    onSubmit={handleCreateOrUpdate}
                    onCancel={closeForm}
                    initialData={editingReminder}
                />
            )}
        </div>
    );
};

export default ReminderDashboard;