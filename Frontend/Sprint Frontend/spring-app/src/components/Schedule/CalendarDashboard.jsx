import React, { useState, useEffect } from 'react';
import { sprintService, quickTaskService } from '../../api';

const PRIORITY_SCORE = { 'High': 3, 'Medium': 2, 'Low': 1 };
const getPriorityScore = (prio) => PRIORITY_SCORE[prio] || 0;
const SPRINT_COLORS = ['#4f46e5', '#059669', '#e11d48', '#d97706', '#7c3aed', '#0891b2', '#c026d3', '#2563eb'];

const normalizeDate = (dateVal) => {
    if (!dateVal) return null;
    if (Array.isArray(dateVal)) return `${dateVal[0]}-${String(dateVal[1]).padStart(2, '0')}-${String(dateVal[2]).padStart(2, '0')}`;
    if (typeof dateVal === 'string') return dateVal.split('T')[0];
    return null;
};

const CalendarDashboard = ({ userId }) => {
    const [sprints, setSprints] = useState([]);
    const [quickTasks, setQuickTasks] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const fetchData = async () => {
        if (!userId || userId === 'null') return;
        try {
            const [sprintRes, qtRes] = await Promise.all([
                sprintService.getAllByUser(userId),
                quickTaskService.getAllByUser(userId)
            ]);

            setSprints(sprintRes.data || []);
            setQuickTasks(qtRes.data || []);

            const sTasks = (sprintRes.data || []).flatMap(s => s.tasks.map(t => ({ ...t, sprintId: s.id, _isQuick: false })));
            const qTasks = (qtRes.data || []).map(t => ({ ...t, _isQuick: true }));
            setTasks([...sTasks, ...qTasks]);
        } catch (err) { console.error("Fetch error", err); }
    };

    useEffect(() => { fetchData(); }, [userId]);

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const calendarCells = [];
    for (let i = 0; i < firstDay; i++) {
        calendarCells.push(<div key={`empty-${i}`} className="calendar-day" style={{ background: 'transparent', border: 'none' }}></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const isToday = new Date().toISOString().split('T')[0] === dateStr;

        const daySprints = sprints.filter(s => normalizeDate(s.startDate) <= dateStr && normalizeDate(s.endDate) >= dateStr);
        const dayQuickTasks = quickTasks.filter(qt => normalizeDate(qt.startDate) <= dateStr && normalizeDate(qt.endDate) >= dateStr);

        calendarCells.push(
            <div key={day} className="calendar-day" style={{
                minHeight: '120px', border: isToday ? '2px solid var(--primary)' : '1px solid var(--border)',
                background: isToday ? 'var(--white)' : '#f8fafc', padding: '6px', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '4px'
            }}>
                <div style={{ textAlign: 'right', fontSize: '12px', fontWeight: 'bold', color: isToday ? 'var(--primary)' : 'var(--text-muted)' }}>{day}</div>

                {dayQuickTasks.map(qt => (
                    <div key={`qt-${qt.id}`} style={{ fontSize: '10px', color: qt.completed ? 'var(--text-muted)' : '#b45309', background: '#fef3c7', padding: '2px 4px', borderRadius: '4px', textDecoration: qt.completed ? 'line-through' : 'none' }}>
                        {qt.priority === 'High' ? '🔥 ' : '⚡ '}{qt.name}
                    </div>
                ))}

                {daySprints.map(s => {
                    const sprintTasksToday = tasks.filter(t => !t._isQuick && t.sprintId === s.id && normalizeDate(t.endDate) === dateStr);
                    sprintTasksToday.sort((a, b) => getPriorityScore(b.priority) - getPriorityScore(a.priority));

                    return (
                        <div key={`sprint-group-${s.id}`} style={{ marginBottom: '6px' }}>
                            <div style={{ background: SPRINT_COLORS[s.id % SPRINT_COLORS.length], color: 'white', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 'bold' }}>
                                {s.name}
                            </div>
                            {sprintTasksToday.map(t => (
                                <div key={`st-${t.id}`} style={{
                                    fontSize: '9.5px', marginLeft: '6px', marginTop: '2px', padding: '2px 4px', borderRadius: '0 4px 4px 0',
                                    background: t.priority === 'High' ? '#fee2e2' : '#f1f5f9',
                                    color: t.completed ? 'var(--text-muted)' : (t.priority === 'High' ? '#b91c1c' : 'var(--text-main)'),
                                    borderLeft: `2px solid ${t.priority === 'High' ? '#ef4444' : '#cbd5e1'}`,
                                    textDecoration: t.completed ? 'line-through' : 'none',
                                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                                }}>
                                    {t.priority === 'High' ? '🔥 ' : '↳ '}{t.name}
                                </div>
                            ))}
                        </div>
                    );
                })}
            </div>
        );
    }

    return (
        <div style={{ padding: '20px', background: 'var(--white)', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, fontSize: '20px' }}>{monthNames[month]} {year}</h2>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn-secondary" onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}>&lt; Prev</button>
                    <button className="btn-secondary" onClick={() => setCurrentMonth(new Date())}>Today</button>
                    <button className="btn-secondary" onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}>Next &gt;</button>
                </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', minWidth: '560px' }}>
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                        <div key={d} style={{ textAlign: 'center', fontSize: '12px', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '8px' }}>{d}</div>
                    ))}
                    {calendarCells}
                </div>
            </div>
        </div>
    );
};

export default CalendarDashboard;
