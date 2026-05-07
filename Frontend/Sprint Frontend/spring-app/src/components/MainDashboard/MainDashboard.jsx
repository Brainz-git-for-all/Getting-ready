import React, { useState, useEffect } from 'react';
import { sprintService, habitService, quickTaskService } from '../../api';
import './MainDashboard.css';

const SPRINT_COLORS = [
    '#4f46e5', '#059669', '#e11d48', '#d97706', '#7c3aed',
    '#0891b2', '#c026d3', '#2563eb', '#dc2626', '#475569'
];

const MainDashboard = ({ userId }) => {
    const [sprints, setSprints] = useState([]);
    const [quickTasks, setQuickTasks] = useState([]);
    const [habits, setHabits] = useState([]);
    const [logs, setLogs] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        if (!userId) return;
        fetchDashboardData();
    }, [userId]);

    const fetchDashboardData = async () => {
        try {
            const [sprintRes, qtRes, habitRes, logsRes] = await Promise.all([
                sprintService.getAllByUser(userId),
                quickTaskService.getAllByUser(userId),
                habitService.getAll(userId),
                habitService.getAllLogs(userId).catch(() => ({ data: [] }))
            ]);

            setSprints(sprintRes.data || []);
            setQuickTasks(qtRes.data || []);
            setHabits(habitRes.data || []);
            setLogs(logsRes.data || []);
        } catch (error) {
            console.error("Error fetching dashboard data", error);
        }
    };

    /* --- BULLETPROOF DATE NORMALIZER --- */
    // Spring Boot randomly sends dates as [2024, 11, 24] or "2024-11-24". This fixes both.
    const normalizeDate = (dateVal) => {
        if (!dateVal) return null;
        if (Array.isArray(dateVal)) {
            const y = dateVal[0];
            const m = String(dateVal[1]).padStart(2, '0');
            const d = String(dateVal[2]).padStart(2, '0');
            return `${y}-${m}-${d}`;
        }
        if (typeof dateVal === 'string') {
            return dateVal.split('T')[0]; // Strips off times if they exist
        }
        return null;
    };

    const getTodayStr = () => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    const todayStr = getTodayStr();

    /* --- DATA CALCULATIONS --- */
    const goodHabits = habits.filter(h => !h.badHabit);
    const badHabits = habits.filter(h => h.badHabit);

    let totalActiveTasks = 0;
    let completedActiveTasks = 0;
    let highPriority = 0;
    let medPriority = 0;
    let lowPriority = 0;

    // Helper to count tasks
    const tallyTask = (task) => {
        totalActiveTasks++;
        if (task.completed === true || String(task.completed) === 'true') {
            completedActiveTasks++;
        } else {
            const p = String(task.priority || 'medium').toLowerCase().trim();
            if (p === 'high') highPriority++;
            else if (p === 'low') lowPriority++;
            else medPriority++;
        }
    };

    // 1. Find overlapping Sprints (Handles MULTIPLE sprints active today)
    let activeSprints = sprints.filter(s => {
        const start = normalizeDate(s.startDate);
        const end = normalizeDate(s.endDate);
        if (!start || !end) return false;
        return start <= todayStr && end >= todayStr;
    });

    // Fallback: If no sprints are running *exactly* today, grab upcoming ones so it isn't empty
    if (activeSprints.length === 0) {
        activeSprints = sprints.filter(s => {
            const end = normalizeDate(s.endDate);
            return end && end >= todayStr;
        });
    }

    // Tally Sprint Tasks
    activeSprints.forEach(sprint => {
        if (sprint.tasks && Array.isArray(sprint.tasks)) {
            sprint.tasks.forEach(task => tallyTask(task));
        }
    });

    // 2. Find Quick Tasks active today
    const activeQuickTasks = quickTasks.filter(qt => {
        const start = normalizeDate(qt.startDate);
        const end = normalizeDate(qt.endDate);
        if (!start || !end) return false;
        return start <= todayStr && end >= todayStr;
    });

    // Tally Quick Tasks
    activeQuickTasks.forEach(qt => tallyTask(qt));

    // Progress Bar %
    const sprintProgress = totalActiveTasks === 0 ? 0 : Math.round((completedActiveTasks / totalActiveTasks) * 100);

    /* --- PIE CHART CSS LOGIC --- */
    const totalPending = highPriority + medPriority + lowPriority;
    let conicString = '#e5e7eb 0% 100%'; // Grey donut by default if 0 tasks

    if (totalPending > 0) {
        const highPct = (highPriority / totalPending) * 100;
        const medPct = (medPriority / totalPending) * 100;

        const highStop = highPct;
        const medStop = highPct + medPct;

        // Draws the Pie: Red -> Orange -> Green
        conicString = `
            #ef4444 0% ${highStop}%,
            #f59e0b ${highStop}% ${medStop}%,
            #10b981 ${medStop}% 100%
        `;
    }

    /* --- CALENDAR LOGIC --- */
    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const getSprintColor = (sprintId) => SPRINT_COLORS[sprintId % SPRINT_COLORS.length];

    const renderCalendar = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

        const days = [];

        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const currentDayDate = new Date(year, month, day);
            const isToday = new Date().toDateString() === currentDayDate.toDateString();

            const activeSprintsToday = sprints.filter(sprint => {
                const start = normalizeDate(sprint.startDate);
                const end = normalizeDate(sprint.endDate);
                if (!start || !end) return false;
                return dateStr >= start && dateStr <= end;
            });

            days.push(
                <div key={day} className={`calendar-day ${isToday ? 'today' : ''} ${activeSprintsToday.length > 0 ? 'sprint-active' : ''}`}>
                    <span className="day-number">{day}</span>

                    {activeSprintsToday.map(sprint => {
                        const sprintColor = getSprintColor(sprint.id);

                        return (
                            <div key={sprint.id} className="sprint-indicator-wrapper">
                                <div className="sprint-indicator" style={{ backgroundColor: sprintColor }}>
                                    {sprint.name}
                                </div>

                                <div className="custom-tooltip">
                                    <div className="tooltip-title" style={{ color: sprintColor, borderBottomColor: sprintColor }}>
                                        Sprint: {sprint.name}
                                    </div>
                                    <div className="tooltip-body">
                                        {sprint.tasks && sprint.tasks.length > 0 ? (
                                            sprint.tasks.map(t => (
                                                <div key={t.id} className="tooltip-task-item">
                                                    {t.completed ? '✅' : '⏳'} {t.name}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="tooltip-empty">No tasks scheduled</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            );
        }

        return (
            <>
                <div className="calendar-header">
                    <h3>{monthNames[month]} {year}</h3>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={prevMonth}>&lt;</button>
                        <button onClick={nextMonth}>&gt;</button>
                    </div>
                </div>
                <div className="calendar-grid">
                    {dayNames.map(d => <div key={d} className="calendar-day-name">{d}</div>)}
                    {days}
                </div>
            </>
        );
    };

    const renderHabitHeatmap = (isBad = false) => {
        const targetHabits = isBad ? badHabits : goodHabits;
        const totalHabits = targetHabits.length;

        if (totalHabits === 0) return <p className="empty-state">No {isBad ? 'bad' : 'good'} habits found.</p>;

        const days = [];
        for (let i = 29; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const logForDay = logs.find(log => log.logDate === dateStr);

            let completedCount = 0;
            if (logForDay) {
                completedCount = logForDay.completedHabitIds.filter(id =>
                    targetHabits.some(h => h.id === id)
                ).length;
            }

            const percentage = (completedCount / totalHabits) * 100;
            const prefix = isBad ? 'bad-heat-' : 'heat-';
            let intensityClass = `${prefix}0`;

            if (percentage > 0 && percentage <= 33) intensityClass = `${prefix}1`;
            else if (percentage > 33 && percentage <= 66) intensityClass = `${prefix}2`;
            else if (percentage > 66 && percentage < 100) intensityClass = `${prefix}3`;
            else if (percentage === 100) intensityClass = `${prefix}4`;

            days.push(<div key={dateStr} className={`heat-cell ${intensityClass}`} title={`${dateStr}: ${completedCount}/${totalHabits}`}></div>);
        }

        return (
            <div className="heatmap-container">
                <div className="heatmap-grid">{days}</div>
            </div>
        );
    };

    return (
        <div className="main-dashboard">

            {/* --- METRICS ROW --- */}
            <div className="dashboard-metrics-row">

                {/* 1. Progress Bar (Combined Sprints & Quick Tasks) */}
                <div className="metric-card" style={{ flex: '1.2' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <h3 style={{ margin: 0, color: '#374151' }}>Today's Task Progress</h3>
                        <span style={{ fontWeight: 'bold', color: '#4f46e5', fontSize: '18px' }}>{sprintProgress}%</span>
                    </div>

                    <div style={{ width: '100%', backgroundColor: '#e5e7eb', borderRadius: '999px', height: '14px', overflow: 'hidden', marginBottom: '12px' }}>
                        <div style={{ width: `${sprintProgress}%`, backgroundColor: '#4f46e5', height: '100%', transition: 'width 0.5s ease' }}></div>
                    </div>
                    <p style={{ margin: 0, fontSize: '14px', color: '#6b7280', fontWeight: 500 }}>
                        {completedActiveTasks} of {totalActiveTasks} tasks completed today
                    </p>
                </div>

                {/* 2. Priority Breakdown (NATIVE DONUT CHART) */}
                <div className="metric-card" style={{ flex: '1.5', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ margin: '0 0 12px 0', color: '#374151' }}>Pending Priorities</h3>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1 }}>
                        {/* The CSS Pie Chart */}
                        <div style={{
                            width: '80px', height: '80px',
                            borderRadius: '50%',
                            background: `conic-gradient(${conicString})`,
                            position: 'relative',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}>
                            {/* The Donut Hole */}
                            <div style={{
                                width: '50px', height: '50px',
                                backgroundColor: 'white',
                                borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '14px', fontWeight: 'bold', color: '#374151'
                            }}>
                                {totalPending > 0 ? totalPending : '0'}
                            </div>
                        </div>

                        {/* Chart Legend */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600 }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444' }}></span> High
                                </span>
                                <span style={{ color: '#ef4444' }}>{highPriority}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600 }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f59e0b' }}></span> Med
                                </span>
                                <span style={{ color: '#f59e0b' }}>{medPriority}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600 }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981' }}></span> Low
                                </span>
                                <span style={{ color: '#10b981' }}>{lowPriority}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Habit Stats */}
                <div className="metric-card" style={{ flex: '1' }}>
                    <h3 style={{ margin: '0 0 16px 0', color: '#374151' }}>Active Habits</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #f3f4f6' }}>
                        <span style={{ fontSize: '15px', color: '#4b5563', fontWeight: 500 }}>Good:</span>
                        <span style={{ fontWeight: 'bold', color: '#16a34a', backgroundColor: '#dcfce7', padding: '4px 10px', borderRadius: '12px' }}>{goodHabits.length}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '15px', color: '#4b5563', fontWeight: 500 }}>Bad:</span>
                        <span style={{ fontWeight: 'bold', color: '#dc2626', backgroundColor: '#fee2e2', padding: '4px 10px', borderRadius: '12px' }}>{badHabits.length}</span>
                    </div>
                </div>

            </div>

            {/* --- DASHBOARD CONTENT --- */}
            <div className="dashboard-content-grid">
                <div className="dashboard-card sprint-calendar-card">
                    <h2>Sprint Calendar</h2>
                    {renderCalendar()}
                </div>

                <div className="dashboard-right-col">
                    <div className="dashboard-card">
                        <h2>Good Habit Consistency</h2>
                        {renderHabitHeatmap(false)}
                    </div>
                    <div className="dashboard-card">
                        <h2>Bad Habit Occurrences</h2>
                        {renderHabitHeatmap(true)}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MainDashboard;