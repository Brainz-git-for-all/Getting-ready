import React, { useState, useEffect } from 'react';
import { habitService, aiService } from '../../api';
import HabitForm from './HabitForm';
import DailyLogForm from './DailyLogForm';
import { customConfirm } from '../AlertSystem';

const normalizeLogDate = (logDate) => {
    if (!logDate) return null;
    if (Array.isArray(logDate)) {
        const [y, m, d] = logDate;
        return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }
    if (typeof logDate === 'string') return logDate.split('T')[0];
    return null;
};

const getLast30Days = () => {
    const dates = [];
    for (let i = 0; i < 30; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
};

const HabitDashboard = ({ userId }) => {
    const [habits, setHabits] = useState([]);
    const [logs, setLogs] = useState([]);
    const [view, setView] = useState('dashboard');
    const [editingHabit, setEditingHabit] = useState(null);
    const [showInsightsModal, setShowInsightsModal] = useState(false);
    const [insightData, setInsightData] = useState(null);
    const [loadingInsights, setLoadingInsights] = useState(false);

    const loadData = async () => {
        try {
            const [habitsRes, logsRes] = await Promise.all([
                habitService.getAll(userId),
                habitService.getAllLogs(userId).catch(() => ({ data: [] }))
            ]);
            setHabits(habitsRes.data || []);
            setLogs(logsRes.data || []);
        } catch (err) { console.error("Error fetching data", err); }
    };

    useEffect(() => { if (userId && userId !== 'null') loadData(); }, [userId]);

    const handleDelete = async (id) => {
        const isConfirmed = await customConfirm("Delete Habit", "Are you sure you want to delete this habit and its progress?", "Delete");
        if (isConfirmed) { await habitService.delete(id); loadData(); }
    };

    const handleEdit = (habit) => { setEditingHabit(habit); setView('add'); };
    const closeForm = () => { setView('dashboard'); setEditingHabit(null); loadData(); };

    const getHabitStats = (habitId) => {
        const last30 = getLast30Days();
        const loggedDates = new Set(
            logs
                .filter(s => (s.completedHabitIds || []).map(Number).includes(Number(habitId)))
                .map(s => normalizeLogDate(s.logDate))
                .filter(Boolean)
        );
        const logged = last30.filter(d => loggedDates.has(d)).length;
        return { logged, total: 30, pct: Math.round((logged / 30) * 100) };
    };

    const getBarColor = (habit, pct) => {
        if (habit.badHabit) {
            // Bad habit: high % = more red (you did it a lot), low % = green (you avoided it)
            if (pct >= 60) return '#ef4444';
            if (pct >= 30) return '#f59e0b';
            return '#10b981';
        } else {
            // Good habit: high % = more green (consistent), low % = red (inconsistent)
            if (pct >= 70) return '#10b981';
            if (pct >= 40) return '#f59e0b';
            return '#ef4444';
        }
    };

    const handleGetInsights = async () => {
        setLoadingInsights(true);
        setInsightData(null);
        setShowInsightsModal(true);
        try {
            const res = await aiService.getHabitInsights(userId);
            const raw = res.data;
            let parsed;
            try {
                parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
            } catch {
                parsed = { overallMessage: typeof raw === 'string' ? raw : 'Analysis complete.', insights: [] };
            }
            setInsightData(parsed);
        } catch (err) {
            setInsightData({ overallMessage: 'Could not load insights. Make sure the AI service is running.', insights: [] });
        } finally {
            setLoadingInsights(false);
        }
    };

    return (
        <div>
            {view === 'dashboard' && (
                <>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginBottom: '20px' }}>
                        <button className="btn-secondary" onClick={handleGetInsights}>✨ AI Insights</button>
                        <button className="btn-secondary" onClick={() => setView('log')}>Log Progress</button>
                        <button className="btn-primary" onClick={() => { setEditingHabit(null); setView('add'); }}>+ New Habit</button>
                    </div>

                    <div className="table-wrapper">
                        <table className="sprint-table">
                            <thead>
                                <tr>
                                    <th>Habit Name</th>
                                    <th>Type</th>
                                    <th>Last 30 Days</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {habits.length === 0 ? (
                                    <tr><td colSpan="4" style={{ textAlign: 'center', color: '#6b7280' }}>No habits found.</td></tr>
                                ) : (
                                    habits.map(habit => {
                                        const stats = getHabitStats(habit.id);
                                        const barColor = getBarColor(habit, stats.pct);
                                        return (
                                            <tr key={habit.id}>
                                                <td>
                                                    <div style={{ fontWeight: 600 }}>{habit.name}</div>
                                                    {habit.description && (
                                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{habit.description}</div>
                                                    )}
                                                </td>
                                                <td>
                                                    <span className={habit.badHabit ? "badge badge-red" : "badge badge-green"}>
                                                        {habit.badHabit ? 'Bad Habit' : 'Good Habit'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '160px' }}>
                                                        <div style={{ flex: 1, height: '8px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                                                            <div style={{ width: `${stats.pct}%`, height: '100%', background: barColor, borderRadius: '999px', transition: 'width 0.4s ease' }} />
                                                        </div>
                                                        <span style={{ fontSize: '12px', fontWeight: 700, color: barColor, minWidth: '40px', textAlign: 'right' }}>
                                                            {stats.logged}/30
                                                        </span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <button className="btn-edit" onClick={() => handleEdit(habit)}>Edit</button>
                                                    <button className="btn-delete" onClick={() => handleDelete(habit.id)}>Delete</button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {view === 'add' && <HabitForm userId={userId} existingHabit={editingHabit} onClose={closeForm} />}
            {view === 'log' && <DailyLogForm userId={userId} habits={habits} onClose={closeForm} />}

            {/* AI Insights Modal */}
            {showInsightsModal && (
                <div className="modal-overlay" onClick={() => setShowInsightsModal(false)}>
                    <div className="modal-content" style={{ maxWidth: '580px' }} onClick={e => e.stopPropagation()}>
                        <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '15px', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0, fontSize: '18px' }}>✨ AI Habit Insights</h3>
                            <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>Personalized analysis based on your habits & schedule</p>
                        </div>

                        {loadingInsights ? (
                            <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                                <div style={{ fontSize: '32px', marginBottom: '12px' }}>🤔</div>
                                <div style={{ fontWeight: 600 }}>Analyzing your habit history...</div>
                                <div style={{ fontSize: '13px', marginTop: '6px' }}>Reading your logs from the last 30 days</div>
                            </div>
                        ) : insightData ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '480px', overflowY: 'auto', paddingRight: '4px' }}>
                                {/* Overall summary */}
                                {insightData.overallMessage && (
                                    <div style={{ background: 'linear-gradient(135deg, #e0e7ff, #ede9fe)', borderRadius: '10px', padding: '14px 16px', border: '1px solid #c7d2fe' }}>
                                        <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#4338ca', marginBottom: '5px', letterSpacing: '0.05em' }}>Overall Assessment</div>
                                        <div style={{ fontSize: '14px', color: '#1e1b4b', lineHeight: '1.6' }}>{insightData.overallMessage}</div>
                                    </div>
                                )}

                                {/* Per-habit insight cards */}
                                {(insightData.insights || []).map((insight, i) => {
                                    const habit = habits.find(h => h.name === insight.name) || {};
                                    const isBad = habit.badHabit;
                                    const pct = insight.totalDays > 0 ? Math.round((insight.daysLogged / insight.totalDays) * 100) : 0;
                                    const barColor = isBad
                                        ? (pct >= 60 ? '#ef4444' : pct >= 30 ? '#f59e0b' : '#10b981')
                                        : (pct >= 70 ? '#10b981' : pct >= 40 ? '#f59e0b' : '#ef4444');

                                    const assessmentColors = {
                                        'On Track': { bg: '#d1fae5', color: '#065f46' },
                                        'Good Progress': { bg: '#dbeafe', color: '#1e40af' },
                                        'Needs Improvement': { bg: '#fef3c7', color: '#92400e' },
                                        'Struggling': { bg: '#fee2e2', color: '#991b1b' },
                                        'Breaking Free': { bg: '#d1fae5', color: '#065f46' },
                                    };
                                    const badge = assessmentColors[insight.assessment] || { bg: '#f1f5f9', color: '#475569' };

                                    return (
                                        <div key={i} style={{ background: '#f8fafc', border: '1px solid var(--border)', borderRadius: '10px', padding: '14px 16px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                                <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-main)' }}>{insight.name}</div>
                                                <span style={{ background: badge.bg, color: badge.color, fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', whiteSpace: 'nowrap' }}>
                                                    {insight.assessment}
                                                </span>
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                                <div style={{ flex: 1, height: '6px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                                                    <div style={{ width: `${pct}%`, height: '100%', background: barColor, borderRadius: '999px', transition: 'width 0.4s' }} />
                                                </div>
                                                <span style={{ fontSize: '12px', fontWeight: 700, color: barColor, whiteSpace: 'nowrap' }}>
                                                    {insight.daysLogged}/{insight.totalDays} days
                                                </span>
                                            </div>

                                            <div style={{ fontSize: '13px', lineHeight: '1.65', color: 'var(--text-main)' }}>{insight.advice}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : null}

                        <div className="modal-actions" style={{ marginTop: '20px' }}>
                            <button className="btn-secondary" onClick={() => setShowInsightsModal(false)}>Close</button>
                            {!loadingInsights && (
                                <button className="btn-primary" onClick={handleGetInsights}>Refresh</button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HabitDashboard;
