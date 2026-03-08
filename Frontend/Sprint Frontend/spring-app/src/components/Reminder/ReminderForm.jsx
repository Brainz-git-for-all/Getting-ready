import React, { useState, useEffect } from 'react';
import './ReminderDashboard.css';

const ReminderForm = ({ onSubmit, onCancel, initialData }) => {
    // Helper to format Java LocalDateTime to HTML datetime-local format (YYYY-MM-DDThh:mm)
    const formatForInput = (dateString) => {
        if (!dateString) return '';
        const d = new Date(dateString);
        // Ensure valid date before formatting
        if (isNaN(d.getTime())) return '';
        return d.toISOString().slice(0, 16);
    };

    const [formData, setFormData] = useState({
        name: '',
        remindAt: '',
        deadline: ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                remindAt: formatForInput(initialData.remindAt),
                deadline: formatForInput(initialData.deadline)
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Convert local datetime strings to ISO Strings for Spring Boot backend compatibility
        const payload = {
            ...formData,
            remindAt: formData.remindAt ? new Date(formData.remindAt).toISOString() : null,
            deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null,
        };

        onSubmit(payload);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>{initialData ? 'Edit Reminder' : 'Create New Reminder'}</h3>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Reminder Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="E.g., Pay electricity bill"
                        />
                    </div>

                    <div className="form-group">
                        <label>Remind At (When to notify)</label>
                        <input
                            type="datetime-local"
                            name="remindAt"
                            value={formData.remindAt}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Deadline (Final Due Date)</label>
                        <input
                            type="datetime-local"
                            name="deadline"
                            value={formData.deadline}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn-cancel" onClick={onCancel}>Cancel</button>
                        <button type="submit" className="btn-primary">
                            {initialData ? 'Update' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReminderForm;