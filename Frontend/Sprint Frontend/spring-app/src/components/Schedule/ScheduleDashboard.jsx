import React, { useState, useEffect } from 'react';
import { scheduleBlockService, habitService, sprintService, quickTaskService } from '../../api';
import ScheduleBlockForm from './ScheduleBlockForm';
import { customConfirm } from '../AlertSystem';

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
const PRIORITY_SCORE = { 'High': 3, 'Medium': 2, 'Low': 1 };
const getPriorityScore = (prio) => PRIORITY_SCORE[prio] || 0;
const SPRINT_COLORS = ['#4f46e5', '#059669', '#e11d48', '#d97706', '#7c3aed', '#0891b2', '#c026d3', '#2563eb'];

const normalizeDate = (dateVal) => {
    if (!dateVal) return null;
    if (Array.isArray(dateVal)) return `${dateVal[0]}-${String(dateVal[1]).padStart(2, '0')}-${String(dateVal[2]).padStart(2, '0')}`;
    if (typeof dateVal === 'string') return dateVal.split('T')[0];
    return null;
};

const ScheduleDashboard = ({ userId }) => {
    const [viewMode, setViewMode] = useState('schedule');

    const [blocks, setBlocks] = useState([]);
    const [habits, setHabits] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [sprints, setSprints] = useState([]);
    const [quickTasks, setQuickTasks] = useState([]);

    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [formModalData, setFormModalData] = useState(null);
    const [activeBlockId, setActiveBlockId] = useState(null);
    const [visibleHours, setVisibleHours] = useState(14);
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const fetchData = async () => {
        if (!userId || userId === 'null') return;
        try {
            const [blocksRes, habitRes, sprintRes, qtRes] = await Promise.all([
                scheduleBlockService.getByUserAndDay(userId, 'ALL'),
                habitService.getAll(userId),
                sprintService.getAllByUser(userId),
                quickTaskService.getAllByUser(userId)
            ]);

            const normalizedBlocks = (blocksRes.data || []).map(b => ({
                ...b, startTime: b.startTime.substring(0, 5), endTime: b.endTime.substring(0, 5)
            }));

            setBlocks(normalizedBlocks);
            setHabits(habitRes.data || []);
            setSprints(sprintRes.data || []);
            setQuickTasks(qtRes.data || []);

            const sTasks = (sprintRes.data || []).flatMap(s => s.tasks.map(t => ({ ...t, sprintId: s.id, _isQuick: false })));
            const qTasks = (qtRes.data || []).map(t => ({ ...t, _isQuick: true }));
            setTasks([...sTasks, ...qTasks]);
        } catch (err) { console.error("Fetch error", err); }
    };

    useEffect(() => {
        fetchData();
        const handleOpenModal = () => { setFormModalData(null); setIsFormModalOpen(true); };
        window.addEventListener('open-block-modal', handleOpenModal);
        return () => window.removeEventListener('open-block-modal', handleOpenModal);
    }, [userId]);

    const timeToRow = (t, isEnd = false) => {
        if (isEnd && t === "23:59") return 49;
        const [h, m] = t.split(':').map(Number); return (h * 2) + (m >= 30 ? 1 : 0) + 1;
    };

    const getDayItems = (day) => {
        const normalBlocks = blocks.filter(b => b.day === day && b.startTime < b.endTime);
        const startsTonight = blocks.filter(b => b.day === day && b.startTime > b.endTime);
        const prevDay = DAYS[(DAYS.indexOf(day) + 6) % 7];
        const endedFromYesterday = blocks.filter(b => b.day === prevDay && b.startTime > b.endTime);

        const displayItems = [
            ...normalBlocks,
            ...startsTonight.map(b => ({ ...b, endTime: "23:59", _isOvernightPart: true, originalId: b.id })),
            ...endedFromYesterday.map(b => ({ ...b, day: day, startTime: "00:00", _isOvernightPart: true, originalId: b.id }))
        ].sort((a, b) => a.startTime.localeCompare(b.startTime));

        const res = []; let last = "00:00";
        displayItems.forEach(b => {
            if (b.startTime > last) { res.push({ isTBA: true, startTime: last, endTime: b.startTime, day }); }
            res.push({ ...b, isTBA: false });
            last = b.endTime > last ? b.endTime : last;
        });
        if (last < "23:59") { res.push({ isTBA: true, startTime: last, endTime: "23:59", day }); }
        return res;
    };

    const handleLogClick = async (h) => {
        await habitService.saveTodaysLog(userId, new Date().toISOString().split('T')[0], [h.id]); fetchData();
    };

    const handleTaskToggle = async (t) => {
        const newStatus = !t.completed;
        if (t._isQuick) await quickTaskService.update(t.id, { ...t, completed: newStatus });
        else await sprintService.toggleTaskCompletion(t.sprintId, t.id, newStatus);
        fetchData();
    };

    const handleDeleteBlock = async (id) => {
        const isConfirmed = await customConfirm("Remove Schedule Block", "Are you sure you want to remove this block from your schedule?", "Remove");
        if (isConfirmed) { await scheduleBlockService.delete(id); setActiveBlockId(null); fetchData(); }
    };

    const renderCalendar = () => {
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

            // Sprints that cover this day
            const daySprints = sprints.filter(s => normalizeDate(s.startDate) <= dateStr && normalizeDate(s.endDate) >= dateStr);

            // FIX: Quick Tasks that cover this day
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
                        // FIX: Sprint Tasks that cover this day
                        const sprintTasksToday = tasks.filter(t => !t._isQuick && t.sprintId === s.id && normalizeDate(t.startDate) <= dateStr && normalizeDate(t.endDate) >= dateStr);
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
            <div style={{ padding: '20px', background: 'var(--white)', borderRadius: '12px', border: '1px solid var(--border)', marginTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0, fontSize: '20px' }}>{monthNames[month]} {year}</h2>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn-secondary" onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}>&lt; Prev</button>
                        <button className="btn-secondary" onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}>Next &gt;</button>
                    </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                        <div key={d} style={{ textAlign: 'center', fontSize: '12px', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '8px' }}>{d}</div>
                    ))}
                    {calendarCells}
                </div>
            </div>
        );
    };

    const activeBlock = blocks.find(b => b.id === activeBlockId);
    let modalHabits = []; let modalTasks = [];
    if (activeBlock) {
        modalHabits = habits.filter(h => h.category?.id === activeBlock.category?.id);
        modalTasks = tasks.filter(t => t.category?.id === activeBlock.category?.id);
        modalTasks.sort((a, b) => getPriorityScore(b.priority) - getPriorityScore(a.priority));
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '16px' }}>
                <div className="view-toggle">
                    <button type="button" className={`toggle-btn ${viewMode === 'schedule' ? 'active' : ''}`} onClick={() => setViewMode('schedule')}>
                        <svg className="toggle-icon" style={{ marginRight: '8px' }} viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                        Schedule Grid
                    </button>
                    <button type="button" className={`toggle-btn ${viewMode === 'calendar' ? 'active' : ''}`} onClick={() => setViewMode('calendar')}>
                        <svg className="toggle-icon" style={{ marginRight: '8px' }} viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line><path d="M8 14h.01"></path><path d="M12 14h.01"></path><path d="M16 14h.01"></path><path d="M8 18h.01"></path><path d="M12 18h.01"></path><path d="M16 18h.01"></path></svg>
                        Monthly Calendar
                    </button>
                </div>
            </div>

            {viewMode === 'calendar' ? renderCalendar() : (
                <div className="viewport-container-schedule" style={{ '--visible-hours': visibleHours, flex: 1 }}>
                    <div className="schedule-toolbar">
                        <span className="toolbar-label" style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-muted)' }}>Scale:</span>
                        <input type="range" min="8" max="24" value={visibleHours} onChange={(e) => setVisibleHours(Number(e.target.value))} style={{ cursor: 'pointer' }} />
                        <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-muted)' }}>{visibleHours}h View</span>
                    </div>
                    <div className="timetable-main">
                        <div className="day-labels-sticky"><div className="time-corner">Time</div>{DAYS.map(d => <div key={d} className="day-label">{d.substring(0, 3)}</div>)}</div>
                        <div className="grid-scroll-area">
                            <div className="grid-viewport">
                                <div className="time-column">{Array.from({ length: 24 }).map((_, i) => (<div key={i} className="hour-cell">{String(i).padStart(2, '0')}:00</div>))}</div>
                                {DAYS.map(day => (
                                    <div key={day} className="day-column">
                                        {getDayItems(day).map((item, idx) => {
                                            const start = timeToRow(item.startTime, false); const end = timeToRow(item.endTime, true);
                                            if (item.isTBA) return <div key={`tba-${idx}`} className="tba-grid-cell" style={{ gridRow: `${start} / ${end}` }} onClick={() => { setFormModalData({ ...item, startTime: item.startTime, endTime: item.endTime, day: item.day }); setIsFormModalOpen(true); }} />;

                                            const catHabits = habits.filter(h => h.category?.id === item.category?.id);
                                            const catTasks = tasks.filter(t => t.category?.id === item.category?.id);
                                            catTasks.sort((a, b) => getPriorityScore(b.priority) - getPriorityScore(a.priority));

                                            return (
                                                <div
                                                    key={`${item.id}-${item.startTime}`}
                                                    className="block-grid-cell"
                                                    style={{ gridRow: `${start} / ${end}`, '--accent': item.category?.color || '#4f46e5' }}
                                                    onClick={() => setActiveBlockId(item.originalId || item.id)}
                                                >
                                                    <div className="block-content">
                                                        <div className="block-cat">{item.category?.name}</div>
                                                        <div className="block-items-detailed">
                                                            {catHabits.map(h => <div key={`h-${h.id}`} className="sch-item sch-habit">{h.name}</div>)}
                                                            {catTasks.map(t => <div key={`t-${t.id}`} className={`sch-item ${t._isQuick ? 'sch-qtask' : 'sch-task'}`}>{t._isQuick ? '⚡ ' : ''}{t.name}</div>)}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {activeBlock && (
                        <div className="modal-overlay" onClick={() => setActiveBlockId(null)}>
                            <div className="modal-content" onClick={e => e.stopPropagation()}>
                                <div className="modal-header" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h3 style={{ color: activeBlock.category?.color, margin: 0 }}>{activeBlock.category?.name}</h3>
                                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>{activeBlock.startTime} - {activeBlock.endTime} ({activeBlock.day.substring(0, 3)})</span>
                                </div>
                                {modalHabits.length > 0 && (
                                    <div style={{ marginTop: '20px' }}>
                                        <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '10px' }}>Daily Habits</h4>
                                        <div className="details-list">
                                            {modalHabits.map(h => (
                                                <div key={h.id} className="details-item">
                                                    <span style={{ color: '#065f46', fontWeight: 600 }}>{h.name}</span>
                                                    <button className="btn-primary" style={{ padding: '6px 12px', fontSize: '12px', background: '#10b981' }} onClick={() => handleLogClick(h)}>Log Habit</button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {modalTasks.length > 0 && (
                                    <div style={{ marginTop: '20px' }}>
                                        <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '10px' }}>Scheduled Tasks</h4>
                                        <div className="details-list">
                                            {modalTasks.map(t => (
                                                <div key={t.id} className={`details-item ${t.completed ? 'done' : ''}`}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <span style={{ color: t._isQuick ? '#b45309' : '#3730a3', fontWeight: 'bold' }}>{t._isQuick ? '⚡ ' : '📋 '} {t.name}</span>
                                                        <span className={t.priority === 'High' ? "badge badge-red" : t.priority === 'Low' ? "badge badge-green" : "badge badge-amber"}>{t.priority}</span>
                                                    </div>
                                                    <button className={t.completed ? "btn-secondary" : "btn-primary"} style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => handleTaskToggle(t)}>{t.completed ? 'Undo' : 'Complete'}</button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {modalHabits.length === 0 && modalTasks.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center', margin: '30px 0' }}>Nothing scheduled for this category.</p>}
                                <div className="modal-actions" style={{ borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                                    <button className="btn-secondary" style={{ marginRight: '10px' }} onClick={() => { setActiveBlockId(null); setFormModalData(activeBlock); setIsFormModalOpen(true); }}>Edit</button>
                                    <button className="btn-delete" style={{ marginRight: 'auto' }} onClick={() => handleDeleteBlock(activeBlock.id)}>Remove</button>
                                    <button className="btn-secondary" onClick={() => setActiveBlockId(null)}>Close</button>
                                </div>
                            </div>
                        </div>
                    )}
                    {isFormModalOpen && <div className="modal-overlay"><ScheduleBlockForm userId={userId} initialData={formModalData} onClose={() => { setIsFormModalOpen(false); fetchData(); }} /></div>}
                </div>
            )}
        </div>
    );
};

export default ScheduleDashboard;