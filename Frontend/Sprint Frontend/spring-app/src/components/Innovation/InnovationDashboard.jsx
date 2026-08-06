import React, { useState, useEffect } from 'react';
import { innovationService } from '../../api';
import InnovationForm from './InnovationForm';

const EditIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const TrashIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const BulbIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18h6M10 22h4M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 1 0 6 8c0 1.5.8 2.82 2.5 3.5.76.76 1.23 1.52 1.41 2.5z" />
  </svg>
);

const InnovationDashboard = ({ userId }) => {
  const [innovations, setInnovations] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (userId) fetchInnovations();
  }, [userId]);

  const fetchInnovations = async () => {
    try {
      const res = await innovationService.getAllByUser(userId);
      setInnovations(res.data || []);
    } catch (err) {
      setError('Could not load thoughts. Make sure the backend is running.');
    }
  };

  const handleSubmit = async (payload) => {
    try {
      if (editing) {
        await innovationService.update(editing.id, payload);
      } else {
        await innovationService.create(payload);
      }
      fetchInnovations();
      closeForm();
    } catch (err) {
      setError('Failed to save — check that the backend restarted after the latest changes.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this thought?')) return;
    try {
      await innovationService.delete(id);
      setInnovations(prev => prev.filter(i => i.id !== id));
    } catch (err) {
      setError('Failed to delete.');
    }
  };

  const openCreate = () => { setEditing(null); setIsFormOpen(true); };
  const openEdit = (item) => { setEditing(item); setIsFormOpen(true); };
  const closeForm = () => { setIsFormOpen(false); setEditing(null); };

  const filtered = innovations.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    (i.description || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Innovations & Thoughts</h1>
          <p style={styles.subtitle}>Capture ideas before they slip away</p>
        </div>
        <button style={styles.addBtn} onClick={openCreate}>+ New Thought</button>
      </div>

      {/* Error banner */}
      {error && (
        <div style={styles.errorBanner}>
          ⚠ {error}
          <button style={styles.errorClose} onClick={() => setError('')}>✕</button>
        </div>
      )}

      {/* Search */}
      <div style={styles.searchWrap}>
        <input
          style={styles.searchInput}
          placeholder="Search thoughts..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div style={styles.empty}>
          <BulbIcon />
          <p style={{ marginTop: 12, color: '#64748b', fontSize: 15 }}>
            {innovations.length === 0 ? 'No thoughts yet. Add your first idea!' : 'No results found.'}
          </p>
        </div>
      ) : (
        <div style={styles.grid}>
          {filtered.map((item, idx) => (
            <div key={item.id} style={{ ...styles.card, '--accent': ACCENT_COLORS[idx % ACCENT_COLORS.length] }}>
              <div style={styles.cardTop}>
                <div style={{ ...styles.dot, background: ACCENT_COLORS[idx % ACCENT_COLORS.length] }} />
                <div style={styles.cardActions}>
                  <button style={styles.iconBtn} onClick={() => openEdit(item)} title="Edit"><EditIcon /></button>
                  <button style={{ ...styles.iconBtn, ...styles.deleteBtn }} onClick={() => handleDelete(item.id)} title="Delete"><TrashIcon /></button>
                </div>
              </div>
              <h3 style={styles.cardName}>{item.name}</h3>
              {item.description && <p style={styles.cardDesc}>{item.description}</p>}
            </div>
          ))}
        </div>
      )}

      {isFormOpen && (
        <InnovationForm
          userId={userId}
          initialData={editing}
          onSubmit={handleSubmit}
          onCancel={closeForm}
        />
      )}
    </div>
  );
};

const ACCENT_COLORS = ['#60a5fa', '#a78bfa', '#34d399', '#f59e0b', '#f87171', '#38bdf8'];

const styles = {
  container: { padding: '24px', maxWidth: '960px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' },
  title: { fontSize: '22px', fontWeight: 700, color: '#f1f5f9', margin: 0 },
  subtitle: { fontSize: '13px', color: '#64748b', margin: '4px 0 0' },
  addBtn: { background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' },
  searchWrap: { marginBottom: '24px' },
  searchInput: { width: '100%', padding: '10px 14px', background: '#1e2538', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' },
  card: { background: '#111827', border: '1px solid #1e2538', borderTop: '3px solid var(--accent)', borderRadius: '10px', padding: '18px 20px', transition: 'transform .15s', cursor: 'default' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
  dot: { width: '8px', height: '8px', borderRadius: '50%' },
  cardActions: { display: 'flex', gap: '6px' },
  iconBtn: { background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px', borderRadius: '4px', display: 'flex', alignItems: 'center' },
  deleteBtn: { color: '#f87171' },
  cardName: { fontSize: '15px', fontWeight: 600, color: '#e2e8f0', margin: '0 0 8px' },
  cardDesc: { fontSize: '13px', color: '#94a3b8', margin: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap' },
  empty: { textAlign: 'center', padding: '60px 20px', color: '#475569', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  errorBanner: { background: 'rgba(248,113,113,0.1)', border: '1px solid #f87171', borderRadius: '8px', padding: '12px 16px', color: '#fca5a5', fontSize: '13px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  errorClose: { background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '14px', padding: '0 4px' },
};

export default InnovationDashboard;
