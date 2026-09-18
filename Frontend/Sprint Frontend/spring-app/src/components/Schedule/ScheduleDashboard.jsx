import React, { useState, useEffect } from 'react';
import { scheduleBlockService, habitService, sprintService, quickTaskService } from '../../api';
import ScheduleBlockForm from './ScheduleBlockForm';
import { customConfirm, customAlert } from '../AlertSystem';

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
const PRIORITY_SCORE = { 'High': 3, 'Medium': 2, 'Low': 1 };
const getPriorityScore = (prio) => PRIORITY_SCORE[prio] || 0;

const ScheduleDashboard = ({ userId }) => {
    const [blocks, setBlocks] = useState([]);
    const [habits, setHabits] = useState([]);
    const [tasks, setTasks] = useState([]);

    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [formModalData, setFormModalData] = useState(null);
    const [activeBlockId, setActiveBlockId] = useState(null);
    const [todayLoggedIds, setTodayLoggedIds] = useState([]);
    const [visibleHours, setVisibleHours] = useState(14);
    const [repeatMode, setRepeatMode] = useState(false);
    const [repeatDays, setRepeatDays] = useState([]);

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

    useEffect(() => {
        if (!activeBlockId || !userId) return;
        const today = new Date().toISOString().split('T')[0];
        habitService.getTodaysLog(userId, today)
            .then(res => {
                if (res.data?.completedHabitIds) setTodayLoggedIds(res.data.completedHabitIds.map(Number));
                else setTodayLoggedIds([]);
            })
            .catch(() => setTodayLoggedIds([]));
    }, [activeBlockId, userId]);

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
        const today = new Date().toISOString().split('T')[0];
        const isLogged = todayLoggedIds.includes(Number(h.id));
        const newIds = isLogged
            ? todayLoggedIds.filter(id => id !== Number(h.id))
            : [...todayLoggedIds, Number(h.id)];
        setTodayLoggedIds(newIds);
        await habitService.saveTodaysLog(userId, today, newIds);
        fetchData();
    };

    const handleTaskToggle = async (t) => {
        const newStatus = !t.completed;
        if (t._isQuick) await quickTaskService.update(t.id, { ...t, completed: newStatus });
        else await sprintService.toggleTaskCompletion(t.sprintId, t.id, newStatus);
        fetchData();
    };

    const closeDetailModal = () => { setActiveBlockId(null); setRepeatMode(false); setRepeatDays([]); };

    const toggleRepeatDay = (day) => {
        setRepeatDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
    };

    const handleRepeatConfirm = async () => {
        if (!activeBlock || repeatDays.length === 0) return;
        const payloads = repeatDays.map(d => ({
            day: d,
            startTime: `${activeBlock.startTime}:00`,
            endTime: `${activeBlock.endTime}:00`,
            remindEnabled: activeBlock.remindEnabled,
            remindOffsetMinutes: activeBlock.remindOffsetMinutes,
            user: { id: userId },
            category: { id: activeBlock.category?.id }
        }));
        try {
            await scheduleBlockService.createBulk(payloads);
            closeDetailModal();
            fetchData();
        } catch {
            customAlert("Conflict", "One or more days already have an overlapping block at that time.");
        }
    };

    const computeOverlapLayout = (day) => {
        const dayBlocks = blocks.filter(b => b.day === day && b.startTime < b.endTime);
        const layout = new Map(); // id -> { col, total }
        if (dayBlocks.length === 0) return layout;

        const sorted = [...dayBlocks].sort((a, b) => a.startTime.localeCompare(b.startTime));

        // Group into clusters where any two blocks within a cluster overlap
        const clusters = [];
        sorted.forEach(block => {
            const matching = clusters.filter(c =>
                c.some(b => b.startTime < block.endTime && b.endTime > block.startTime)
            );
            if (matching.length === 0) {
                clusters.push([block]);
            } else {
                const merged = matching.reduce((acc, c) => {
                    clusters.splice(clusters.indexOf(c), 1);
                    return acc.concat(c);
                }, []).concat(block);
                clusters.push(merged);
            }
        });

        clusters.forEach(cluster => {
            if (cluster.length === 1) {
                layout.set(cluster[0].id, { col: 0, total: 1 });
                return;
            }
            const clusterSorted = [...cluster].sort((a, b) => a.startTime.localeCompare(b.startTime));
            const lanes = []; // lanes[i] = last endTime in that lane
            clusterSorted.forEach(block => {
                let placed = false;
                for (let i = 0; i < lanes.length; i++) {
                    if (block.startTime >= lanes[i]) {
                        lanes[i] = block.endTime;
                        layout.set(block.id, { col: i, total: -1 });
                        placed = true;
                        break;
                    }
                }
                if (!placed) {
                    layout.set(block.id, { col: lanes.length, total: -1 });
                    lanes.push(block.endTime);
                }
            });
            const colTotal = lanes.length;
            cluster.forEach(b => { if (layout.has(b.id)) layout.get(b.id).total = colTotal; });
        });

        return layout;
    };

    const handleDeleteBlock = async (id) => {
        const isConfirmed = await customConfirm("Remove Schedule Block", "Are you sure you want to remove this block from your schedule?", "Remove");
        if (isConfirmed) { await scheduleBlockService.delete(id); setActiveBlockId(null); fetchData(); }
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
                                {DAYS.map(day => {
                                    const overlapLayout = computeOverlapLayout(day);
                                    const maxCols = overlapLayout.size > 0
                                        ? Math.max(...Array.from(overlapLayout.values()).map(v => v.total))
                                        : 1;
                                    return (
                                        <div key={day} className="day-column" style={{ gridTemplateColumns: `repeat(${maxCols}, 1fr)` }}>
                                            {getDayItems(day).map((item, idx) => {
                                                const start = timeToRow(item.startTime, false); const end = timeToRow(item.endTime, true);
                                                if (item.isTBA) return <div key={`tba-${idx}`} className="tba-grid-cell" style={{ gridRow: `${start} / ${end}`, gridColumn: `1 / ${maxCols + 1}` }} onClick={() => { setFormModalData({ ...item, startTime: item.startTime, endTime: item.endTime, day: item.day }); setIsFormModalOpen(true); }} />;

                                                const blockId = item.originalId || item.id;
                                                const bLayout = overlapLayout.get(blockId) || { col: 0, total: 1 };
                                                const gridColumn = bLayout.total <= 1
                                                    ? `1 / ${maxCols + 1}`
                                                    : `${bLayout.col + 1} / ${bLayout.col + 2}`;

                                                const catHabits = habits.filter(h => h.category?.id === item.category?.id);
                                                const catTasks = tasks.filter(t => t.category?.id === item.category?.id);
                                                catTasks.sort((a, b) => getPriorityScore(b.priority) - getPriorityScore(a.priority));

                                                return (
                                                    <div
                                                        key={`${item.id}-${item.startTime}`}
                                                        className="block-grid-cell"
                                                        style={{ gridRow: `${start} / ${end}`, gridColumn, '--accent': item.category?.color || '#4f46e5' }}
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
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {activeBlock && (
                        <div className="modal-overlay" onClick={closeDetailModal}>
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
                                                    <button
                                                        className="btn-primary"
                                                        style={{ padding: '6px 12px', fontSize: '12px', background: todayLoggedIds.includes(Number(h.id)) ? '#059669' : '#10b981' }}
                                                        onClick={() => handleLogClick(h)}
                                                    >
                                                        {todayLoggedIds.includes(Number(h.id)) ? '✓ Logged' : 'Log Habit'}
                                                    </button>
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

                                {repeatMode && (
                                    <div style={{ margin: '16px 0', padding: '14px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                        <p style={{ margin: '0 0 10px 0', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Copy to which days?</p>
                                        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                                            {DAYS.filter(d => d !== activeBlock.day).map(d => (
                                                <div
                                                    key={d}
                                                    onClick={() => toggleRepeatDay(d)}
                                                    style={{
                                                        width: '34px', height: '34px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', transition: '0.2s',
                                                        background: repeatDays.includes(d) ? 'var(--primary)' : 'var(--bg-card)',
                                                        color: repeatDays.includes(d) ? 'white' : 'var(--text-muted)',
                                                        border: `1px solid ${repeatDays.includes(d) ? 'var(--primary)' : 'var(--border)'}`
                                                    }}
                                                >
                                                    {d.substring(0, 1)}
                                                </div>
                                            ))}
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button className="btn-primary" style={{ padding: '6px 16px', fontSize: '13px' }} disabled={repeatDays.length === 0} onClick={handleRepeatConfirm}>Confirm</button>
                                            <button className="btn-secondary" style={{ padding: '6px 16px', fontSize: '13px' }} onClick={() => { setRepeatMode(false); setRepeatDays([]); }}>Cancel</button>
                                        </div>
                                    </div>
                                )}

                                <div className="modal-actions" style={{ borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                                    <button className="btn-secondary" style={{ marginRight: '10px' }} onClick={() => { closeDetailModal(); setFormModalData(activeBlock); setIsFormModalOpen(true); }}>Edit</button>
                                    <button className="btn-delete" style={{ marginRight: '10px' }} onClick={() => handleDeleteBlock(activeBlock.id)}>Remove</button>
                                    {!repeatMode && (
                                        <button className="btn-secondary" style={{ marginRight: 'auto' }} onClick={() => { setRepeatMode(true); setRepeatDays([]); }}>Repeat</button>
                                    )}
                                    <button className="btn-secondary" onClick={closeDetailModal}>Close</button>
                                </div>
                            </div>
                        </div>
                    )}
                    {isFormModalOpen && <div className="modal-overlay"><ScheduleBlockForm userId={userId} initialData={formModalData} onClose={() => { setIsFormModalOpen(false); fetchData(); }} /></div>}
                </div>
        </div>
    );
};

export default ScheduleDashboard;