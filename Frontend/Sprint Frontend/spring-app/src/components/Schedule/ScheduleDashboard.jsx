import React, { useState, useEffect } from 'react';
import { scheduleBlockService, habitService, sprintService } from '../../api';
import ScheduleBlockForm from './ScheduleBlockForm';
import CategoryDashboard from './CategoryDashboard';
import './Schedule.css';

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

const ScheduleDashboard = ({ userId }) => {
    // Original Data Logic remains untouched
    const [blocks, setBlocks] = useState([]);
    const [habits, setHabits] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [view, setView] = useState('schedule');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalData, setModalData] = useState(null);

    // NEW: UI State for the Zoom Slider (Default 14 hours visible)
    const [visibleHours, setVisibleHours] = useState(14);

    const fetchData = async () => {
        if (!userId || userId === 'null') return;
        try {
            const [blocksRes, habitRes, sprintRes] = await Promise.all([
                scheduleBlockService.getByUserAndDay(userId, 'ALL'),
                habitService.getAll(userId),
                sprintService.getAllByUser(userId)
            ]);
            setBlocks(blocksRes.data || []);
            setHabits(habitRes.data || []);
            setTasks((sprintRes.data || []).flatMap(s => s.tasks.map(t => ({ ...t, sprintId: s.id }))));
        } catch (err) { console.error("Fetch error", err); }
    };

    useEffect(() => {
        fetchData();
        const handleOpenModal = () => { setModalData(null); setIsModalOpen(true); };
        const handleToggleView = () => setView(prev => prev === 'schedule' ? 'categories' : 'schedule');

        window.addEventListener('open-block-modal', handleOpenModal);
        window.addEventListener('toggle-cat-view', handleToggleView);
        return () => {
            window.removeEventListener('open-block-modal', handleOpenModal);
            window.removeEventListener('toggle-cat-view', handleToggleView);
        };
    }, [userId]);

    const timeToRow = (t) => {
        const [h, m] = t.split(':').map(Number);
        return (h * 2) + (m >= 30 ? 1 : 0) + 1;
    };

    const getDayItems = (day) => {
        const dayBlocks = blocks.filter(b => b.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime));
        const res = [];
        let last = "00:00";
        dayBlocks.forEach(b => {
            if (b.startTime > last) res.push({ isTBA: true, startTime: last, endTime: b.startTime, day });
            res.push({ ...b, isTBA: false });
            last = b.endTime;
        });
        if (last < "23:59") res.push({ isTBA: true, startTime: last, endTime: "23:59", day });
        return res;
    };

    // DOM-based Optimistic UI Handlers
    const handleLogClick = (e, h) => {
        const btn = e.currentTarget;
        btn.innerText = "Saved!";
        btn.classList.add("btn-success");
        habitService.saveTodaysLog(userId, new Date().toISOString().split('T')[0], [h.id])
            .then(() => setTimeout(() => fetchData(), 1000));
    };

    const handleTaskToggle = (e, t) => {
        const btn = e.currentTarget;
        const span = btn.previousElementSibling;
        const isCompleting = !span.classList.contains("done");

        if (isCompleting) {
            span.classList.add("done");
            btn.innerText = "Undo";
        } else {
            span.classList.remove("done");
            btn.innerText = "✓";
        }
        sprintService.toggleTaskCompletion(t.sprintId, t.id, isCompleting).then(() => fetchData());
    };

    if (view === 'categories') return <CategoryDashboard userId={userId} onBack={() => setView('schedule')} />;

    return (
        // Inline style passes the slider value dynamically to CSS variables!
        <div className="viewport-container-schedule" style={{ '--visible-hours': visibleHours }}>

            <div className="schedule-toolbar">
                <span className="toolbar-label">Scale:</span>
                <input
                    type="range"
                    min="8"
                    max="24"
                    value={visibleHours}
                    onChange={(e) => setVisibleHours(Number(e.target.value))}
                    className="zoom-slider"
                />
                <span className="toolbar-value">{visibleHours}h View</span>
            </div>

            <div className="timetable-main">
                <div className="day-labels-sticky">
                    <div className="time-corner">Time</div>
                    {DAYS.map(d => <div key={d} className="day-label">{d.substring(0, 3)}</div>)}
                </div>

                <div className="grid-scroll-area">
                    <div className="grid-viewport">
                        <div className="time-column">
                            {Array.from({ length: 24 }).map((_, i) => (
                                <div key={i} className="hour-cell">
                                    {String(i).padStart(2, '0')}:00
                                </div>
                            ))}
                        </div>

                        {DAYS.map(day => (
                            <div key={day} className="day-column">
                                {getDayItems(day).map((item, idx) => {
                                    const start = timeToRow(item.startTime);
                                    const end = timeToRow(item.endTime);

                                    if (item.isTBA) {
                                        return (
                                            <div key={idx} className="tba-grid-cell"
                                                style={{ gridRow: `${start} / ${end}` }}
                                                onClick={() => { setModalData(item); setIsModalOpen(true); }}
                                            />
                                        );
                                    }

                                    const catHabits = habits.filter(h => h.category?.id === item.category?.id);
                                    const catTasks = tasks.filter(t => t.category?.id === item.category?.id);
                                    const totalItems = catHabits.length + catTasks.length;

                                    return (
                                        <div key={item.id} className="block-grid-cell"
                                            style={{ gridRow: `${start} / ${end}`, '--accent': item.category?.color || '#4f46e5' }}>

                                            <div className="block-content">
                                                <div className="block-cat">{item.category?.name}</div>
                                                <div className="block-previews">
                                                    {totalItems > 0 && totalItems <= 2 && (
                                                        <>
                                                            {catHabits.map(h => <div key={h.id} className="preview-text h-text">{h.name}</div>)}
                                                            {catTasks.map(t => <div key={t.id} className="preview-text t-text">{t.name}</div>)}
                                                        </>
                                                    )}
                                                    {totalItems >= 3 && (
                                                        <>
                                                            {catHabits.map(h => <div key={h.id} className="dot h" title={h.name}></div>)}
                                                            {catTasks.map(t => <div key={t.id} className="dot t" title={t.name}></div>)}
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="block-popover">
                                                <div className="pop-header">
                                                    <strong>{item.category?.name}</strong>
                                                    <button className="pop-del" onClick={() => scheduleBlockService.delete(item.id).then(fetchData)}>×</button>
                                                </div>
                                                <div className="pop-body">
                                                    {catHabits.map(h => (
                                                        <div key={h.id} className="pop-row">
                                                            <span>{h.name}</span>
                                                            <button onClick={(e) => handleLogClick(e, h)}>Log</button>
                                                        </div>
                                                    ))}
                                                    {catTasks.map(t => (
                                                        <div key={t.id} className="pop-row">
                                                            <span className={t.completed ? 'done' : ''}>{t.name}</span>
                                                            <button onClick={(e) => handleTaskToggle(e, t)}>
                                                                {t.completed ? 'Undo' : '✓'}
                                                            </button>
                                                        </div>
                                                    ))}
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

            {isModalOpen && (
                <div className="modal-overlay">
                    <ScheduleBlockForm userId={userId} initialData={modalData} onClose={() => { setIsModalOpen(false); fetchData(); }} />
                </div>
            )}
        </div>
    );
};

export default ScheduleDashboard;