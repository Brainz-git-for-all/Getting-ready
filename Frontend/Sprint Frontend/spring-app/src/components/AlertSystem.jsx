import React, { useState, useEffect } from 'react';

export const alertManager = { confirm: null, alert: null };

// Call this anywhere instead of window.confirm()
export const customConfirm = (title, message, confirmText = "Confirm") => {
    if (alertManager.confirm) return alertManager.confirm(title, message, confirmText);
    return Promise.resolve(window.confirm(message));
};

// Call this anywhere instead of alert()
export const customAlert = (title, message) => {
    if (alertManager.alert) return alertManager.alert(title, message);
    alert(message);
};

const AlertSystem = () => {
    const [state, setState] = useState({ isOpen: false, type: 'alert', title: '', message: '', confirmText: 'OK' });
    const [resolvers, setResolvers] = useState(null);

    useEffect(() => {
        alertManager.confirm = (title, message, confirmText) => {
            return new Promise((resolve) => {
                setState({ isOpen: true, type: 'confirm', title, message, confirmText });
                setResolvers(() => resolve);
            });
        };
        alertManager.alert = (title, message) => {
            return new Promise((resolve) => {
                setState({ isOpen: true, type: 'alert', title, message, confirmText: 'OK' });
                setResolvers(() => resolve);
            });
        };
    }, []);

    if (!state.isOpen) return null;

    const handleConfirm = () => {
        setState({ ...state, isOpen: false });
        if (resolvers) resolvers(true);
    };

    const handleCancel = () => {
        setState({ ...state, isOpen: false });
        if (resolvers) resolvers(false);
    };

    return (
        <div className="modal-overlay" style={{ zIndex: 999999 }}>
            <div className="modal-content" style={{ maxWidth: '400px', margin: 'auto', textAlign: 'center', padding: '32px' }}>
                <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
                    {state.type === 'confirm' ? (
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    ) : (
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                    )}
                </div>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '20px', color: 'var(--text-main)' }}>{state.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px', lineHeight: '1.5' }}>{state.message}</p>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                    {state.type === 'confirm' && <button className="btn-secondary" onClick={handleCancel}>Cancel</button>}
                    <button className={state.type === 'confirm' ? "btn-delete" : "btn-primary"} onClick={handleConfirm} style={{ minWidth: '100px' }}>
                        {state.confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AlertSystem;