import React, { useState, useEffect } from 'react';
import { scheduleBlockService, habitService, sprintService, quickTaskService } from '../../api';
import ScheduleBlockForm from './ScheduleBlockForm';
import CategoryDashboard from './CategoryDashboard';
import { customConfirm } from '../AlertSystem'; // <-- NEW

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
const PRIORITY_SCORE = { 'High': 3, 'Medium': 2, 'Low': 1 };
const getPriorityScore = (prio) => PRIORITY_SCORE[prio] || 0;

const ScheduleDashboard = ({ userId }) => {
    const [blocks, setBlocks] = useState([]);
    const [habits, setHabits] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [view, setView] = useState('schedule');

    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [formModalData, setFormModalData] = useState(null);
    const [activeBlockId, setActiveBlockId] = useState(null);
    const [visibleHours, setVisibleHours] = useState(14);

    const fetchData = async () => {
        if (!userId || userId === 'null') return;
        try {
            const [blocksRes, habitRes, sprintRes, qtRes] = await Promise.all([
                scheduleBlockService.getByUserAndDay(userId, 'ALL'), habitService.getAll(userId),
                sprintService.getAllByUser(userId), quickTaskService.getAllByUser(userId)
            ]);

            const normalizedBlocks = (blocksRes.data || []).map(b => ({
                ...b, startTime: b.startTime.substring(0, 5), endTime: b.endTime.substring(0, 5)
            }));

            setBlocks(normalizedBlocks); setHabits(habitRes.data || []);
            const sTasks = (sprintRes.data || []).flatMap(s => s.tasks.map(t => ({ ...t, sprintId: s.id, _isQuick: false })));
            const qTasks = (qtRes.data || []).map(t => ({ ...t, _isQuick: true }));
            setTasks([...sTasks, ...qTasks]);
        } catch (err) { console.error("Fetch error", err); }
    };

    useEffect(() => {
        fetchData();
        const handleOpenModal = () => { setFormModalData(null); setIsFormModalOpen(true); };
        const handleToggleView = () => setView(prev => prev === 'schedule' ? 'categories' : 'schedule');
        window.addEventListener('open-block-modal', handleOpenModal);
        window.addEventListener('toggle-cat-view', handleToggleView);
        return () => { window.removeEventListener('open-block-modal', handleOpenModal); window.removeEventListener('toggle-cat-view', handleToggleView); };
    }, [userId]);

    const timeToRow = (t, isEnd = false) => {
        if (isEnd && t === "23:59") return 49;
        const [h, m] = t.split(':').map(Number); return (h * 2) + (m >= 30 ? 1 : 0) + 1;
    };

    const getDayItems = (day) => {
        const dayBlocks = blocks.filter(b => b.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime));
        const res = []; let last = "00:00";
        dayBlocks.forEach(b => {
            if (b.startTime > last) { res.push({ isTBA: true, startTime: last, endTime: b.startTime, day }); }
            res.push({ ...b, isTBA: false }); last = b.endTime;
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

    if (view === 'categories') return <CategoryDashboard userId={userId} onBack={() => setView('schedule')} />;

    const activeBlock = blocks.find(b => b.id === activeBlockId);
    let modalHabits = []; let modalTasks = [];
    if (activeBlock) {
        modalHabits = habits.filter(h => h.category?.id === activeBlock.category?.id);
        modalTasks = tasks.filter(t => t.category?.id === activeBlock.category?.id);
        modalTasks.sort((a, b) => getPriorityScore(b.priority) - getPriorityScore(a.priority));
    }

    return (
        <div className="viewport-container-schedule" style={{ '--visible-hours': visibleHours }}>
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
                                    if (item.isTBA) return <div key={idx} className="tba-grid-cell" style={{ gridRow: `${start} / ${end}` }} onClick={() => { setFormModalData(item); setIsFormModalOpen(true); }} />;

                                    const catHabits = habits.filter(h => h.category?.id === item.category?.id);
                                    const catTasks = tasks.filter(t => t.category?.id === item.category?.id);
                                    catTasks.sort((a, b) => getPriorityScore(b.priority) - getPriorityScore(a.priority));

                                    return (
                                        <div key={item.id} className="block-grid-cell" style={{ gridRow: `${start} / ${end}`, '--accent': item.category?.color || '#4f46e5' }} onClick={() => setActiveBlockId(item.id)}>
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

            {isFormModalOpen && <div className="modal-overlay"><ScheduleBlockForm userId={userId} initialData={formModalData} onClose={() => { setIsFormModalOpen(false); fetchData(); }} /></div>}

            {activeBlock && (
                <div className="modal-overlay" onClick={() => setActiveBlockId(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ color: activeBlock.category?.color, margin: 0 }}>{activeBlock.category?.name}</h3>
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>{activeBlock.startTime} - {activeBlock.endTime}</span>
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
                            <button className="btn-delete" style={{ marginRight: 'auto' }} onClick={() => handleDeleteBlock(activeBlock.id)}>Remove Block</button>
                            <button className="btn-secondary" onClick={() => setActiveBlockId(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ScheduleDashboard;