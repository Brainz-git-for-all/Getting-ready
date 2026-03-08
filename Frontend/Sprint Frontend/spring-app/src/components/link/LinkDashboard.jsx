import React, { useState, useEffect } from 'react';
import { linkService } from '../../api';
import LinkForm from './LinkForm';
import './Link.css';

// SVG Icons
const ExternalLinkIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
);
const ClockIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
);
const EditIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
);
const TrashIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
);

const LinkDashboard = ({ userId }) => {
    const [links, setLinks] = useState([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingLink, setEditingLink] = useState(null);

    useEffect(() => {
        if (userId) fetchLinks();
    }, [userId]);

    const fetchLinks = async () => {
        try {
            const response = await linkService.getAllByUser(userId);
            setLinks(response.data || []);
        } catch (error) {
            console.error("Failed to fetch links", error);
        }
    };

    const handleFormSubmit = async (payload) => {
        try {
            if (editingLink) {
                await linkService.update(editingLink.id, payload);
            } else {
                await linkService.create(payload);
            }
            fetchLinks();
            closeForm();
        } catch (error) {
            console.error("Failed to save link", error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this link?")) return;
        try {
            await linkService.delete(id);
            setLinks(prev => prev.filter(link => link.id !== id));
        } catch (error) {
            console.error("Failed to delete link", error);
        }
    };

    const openCreateForm = () => {
        setEditingLink(null);
        setIsFormOpen(true);
    };

    const openEditForm = (link) => {
        setEditingLink(link);
        setIsFormOpen(true);
    };

    const closeForm = () => {
        setIsFormOpen(false);
        setEditingLink(null);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "Not set";
        const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleString(undefined, options);
    };

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="header-info">
                    <h1>My Saved Links</h1>
                    <p>Manage and track your resources</p>
                </div>
                <button className="btn btn-primary" onClick={openCreateForm}>
                    + Add New Link
                </button>
            </header>

            <div className="link-grid">
                {links.length === 0 ? (
                    <div className="empty-state">
                        <p>No links saved yet. Start by adding one!</p>
                    </div>
                ) : (
                    links.map(link => (
                        <div key={link.id} className="link-card">
                            <div className="link-card-header">
                                <span className="category-badge">{link.category || 'Uncategorized'}</span>
                                <div className="card-actions">
                                    <button onClick={() => openEditForm(link)} className="icon-btn edit">
                                        <EditIcon />
                                    </button>
                                    <button onClick={() => handleDelete(link.id)} className="icon-btn delete">
                                        <TrashIcon />
                                    </button>
                                </div>
                            </div>

                            <h3 className="link-title">
                                <a href={link.link} target="_blank" rel="noopener noreferrer">
                                    {link.link} <ExternalLinkIcon />
                                </a>
                            </h3>

                            {/* Added Description Display */}
                            {link.description && (
                                <div className="link-description">
                                    <p>{link.description}</p>
                                </div>
                            )}

                            <div className="link-footer">
                                <div className="date-info">
                                    <ClockIcon />
                                    <span>Remind: {formatDate(link.remindAt)}</span>
                                </div>
                                <div className="date-info">
                                    <ClockIcon />
                                    <span>Deadline: {formatDate(link.lookUpDeadline)}</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {isFormOpen && (
                <LinkForm
                    userId={userId}
                    initialData={editingLink}
                    onSubmit={handleFormSubmit}
                    onCancel={closeForm}
                />
            )}
        </div>
    );
};

export default LinkDashboard;