import React, { useState, useEffect } from 'react';
import { sprintService, habitService } from '../../api';
import './MainDashboard.css';

// A palette of nice, contrasting colors for different sprints
const SPRINT_COLORS = [
    '#4f46e5', // Indigo
    '#059669', // Emerald
    '#e11d48', // Rose
    '#d97706', // Amber
    '#7c3aed', // Purple
    '#0891b2', // Cyan
    '#c026d3', // Fuchsia
    '#2563eb', // Blue
    '#dc2626', // Red
    '#475569'  // Slate
];

const MainDashboard = ({ userId }) => {
    const [sprints, setSprints] = useState([]);
    const [habits, setHabits] = useState([]);
    const [logs, setLogs] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        if (!userId) return;
        fetchDashboardData();
    }, [userId]);

    const fetchDashboardData = async () => {
        try {
            const [sprintRes, habitRes, logsRes] = await Promise.all([
                sprintService.getAllByUser(userId),
                habitService.getAll(userId),
                habitService.getAllLogs(userId).catch(() => ({ data: [] }))
            ]);
            setSprints(sprintRes.data || []);
            setHabits(habitRes.data || []);
            setLogs(logsRes.data || []);
        } catch (error) {
            console.error("Error fetching dashboard data", error);
        }
    };

    const goodHabits = habits.filter(h => !h.badHabit);
    const badHabits = habits.filter(h => h.badHabit);

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    // Helper to consistently assign a color to a sprint based on its ID
    const getSprintColor = (sprintId) => {
        return SPRINT_COLORS[sprintId % SPRINT_COLORS.length];
    };

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
                return dateStr >= sprint.startDate && dateStr <= sprint.endDate;
            });

            days.push(
                <div key={day} className={`calendar-day ${isToday ? 'today' : ''} ${activeSprintsToday.length > 0 ? 'sprint-active' : ''}`}>
                    <span className="day-number">{day}</span>

                    {activeSprintsToday.map(sprint => {
                        const sprintColor = getSprintColor(sprint.id);

                        return (
                            <div key={sprint.id} className="sprint-indicator-wrapper">
                                <div
                                    className="sprint-indicator"
                                    style={{ backgroundColor: sprintColor }}
                                >
                                    {sprint.name}
                                </div>

                                <div className="custom-tooltip">
                                    <div
                                        className="tooltip-title"
                                        style={{ color: sprintColor, borderBottomColor: sprintColor }}
                                    >
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
            <div className="dashboard-metrics-row">
                <div className="metric-card"><h3>Active Sprints</h3><p className="metric-value">{sprints.length}</p></div>
                <div className="metric-card"><h3>Good Habits</h3><p className="metric-value text-green">{goodHabits.length}</p></div>
                <div className="metric-card"><h3>Bad Habits</h3><p className="metric-value text-red">{badHabits.length}</p></div>
            </div>

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