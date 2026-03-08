import React, { useState, useEffect } from 'react';
import './Link.css';

const LinkForm = ({ userId, initialData, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        link: '',
        category: '',
        description: '', // Integrated description
        remindAt: '',
        lookUpDeadline: ''
    });

    useEffect(() => {
        if (initialData) {
            // Spring Boot sends datetime as "YYYY-MM-DDTHH:mm:ss". Input expects "YYYY-MM-DDTHH:mm"
            const formatForInput = (dateString) => {
                if (!dateString) return '';
                return dateString.substring(0, 16);
            };

            setFormData({
                link: initialData.link || '',
                category: initialData.category || '',
                description: initialData.description || '',
                remindAt: formatForInput(initialData.remindAt),
                lookUpDeadline: formatForInput(initialData.lookUpDeadline)
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Append seconds to dates for Spring Boot LocalDateTime mapping, or send null
        const payload = {
            link: formData.link,
            category: formData.category,
            description: formData.description,
            remindAt: formData.remindAt ? `${formData.remindAt}:00` : null,
            lookUpDeadline: formData.lookUpDeadline ? `${formData.lookUpDeadline}:00` : null,
            userId: parseInt(userId, 10)
        };

        onSubmit(payload);
    };

    return (
        <div className="link-modal-overlay">
            <div className="link-modal-content">
                <div className="link-modal-header">
                    <h2>{initialData ? 'Edit Saved Link' : 'Save New Link'}</h2>
                    <button className="close-btn" onClick={onCancel}>&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="link-form">
                    <div className="form-group">
                        <label>URL / Link <span className="text-red">*</span></label>
                        <input
                            type="url"
                            name="link"
                            className="form-control"
                            placeholder="https://example.com"
                            value={formData.link}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Category</label>
                        <input
                            type="text"
                            name="category"
                            className="form-control"
                            placeholder="e.g., AI, Research, Software"
                            value={formData.category}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            name="description"
                            className="form-control"
                            placeholder="What is this resource for?"
                            value={formData.description}
                            onChange={handleChange}
                            rows="3"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Remind Me At</label>
                            <input
                                type="datetime-local"
                                name="remindAt"
                                className="form-control"
                                value={formData.remindAt}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label>Lookup Deadline</label>
                            <input
                                type="datetime-local"
                                name="lookUpDeadline"
                                className="form-control"
                                value={formData.lookUpDeadline}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="link-modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
                        <button type="submit" className="btn btn-primary">
                            {initialData ? 'Update Link' : 'Save Link'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LinkForm;