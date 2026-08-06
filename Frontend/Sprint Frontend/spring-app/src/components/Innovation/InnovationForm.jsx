import React, { useState, useEffect } from 'react';

const InnovationForm = ({ userId, initialData, onSubmit, onCancel }) => {
  const [form, setForm] = useState({ name: '', description: '' });

  useEffect(() => {
    if (initialData) {
      setForm({ name: initialData.name || '', description: initialData.description || '' });
    }
  }, [initialData]);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSubmit({ ...form, userId: Number(userId) });
  };

  return (
    <div style={overlay}>
      <div style={modal}>
        <h2 style={title}>{initialData ? 'Edit Thought' : 'New Thought'}</h2>

        <form onSubmit={handleSubmit}>
          <label style={label}>Name *</label>
          <input
            style={input}
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Give your idea a name..."
            required
            autoFocus
          />

          <label style={label}>Description</label>
          <textarea
            style={{ ...input, height: '120px', resize: 'vertical' }}
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Describe your thought in detail..."
          />

          <div style={actions}>
            <button type="button" style={cancelBtn} onClick={onCancel}>Cancel</button>
            <button type="submit" style={submitBtn}>{initialData ? 'Save Changes' : 'Add Thought'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const overlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const modal = { background: '#111827', border: '1px solid #1e2538', borderRadius: '12px', padding: '28px 32px', width: '100%', maxWidth: '440px', boxSizing: 'border-box' };
const title = { fontSize: '18px', fontWeight: 700, color: '#f1f5f9', margin: '0 0 20px' };
const label = { display: 'block', fontSize: '13px', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' };
const input = { width: '100%', padding: '10px 14px', background: '#1e2538', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0', fontSize: '14px', outline: 'none', boxSizing: 'border-box', marginBottom: '16px', fontFamily: 'inherit' };
const actions = { display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' };
const cancelBtn = { padding: '9px 18px', background: 'transparent', border: '1px solid #334155', borderRadius: '8px', color: '#94a3b8', fontSize: '14px', cursor: 'pointer' };
const submitBtn = { padding: '9px 20px', background: '#3b82f6', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer' };

export default InnovationForm;
