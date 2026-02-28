import React, { useState, useEffect } from 'react';
import { sprintService, habitService } from '../../api';
import './MainDashboard.css';

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
                habitService.getAllLogs(userId).catch(() => ({ data: [] })) // Fallback if API missing
            ]);
            setSprints(sprintRes.data || []);
            setHabits(habitRes.data || []);
            setLogs(logsRes.data || []);
        } catch (error) {
            console.error("Error fetching dashboard data", error);
        }
    };

    // --- CALENDAR LOGIC ---
    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const renderCalendar = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);

        const days = [];
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

        // Empty slots before month starts
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
        }

        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

            // Check if this date falls within any sprint
            const activeSprints = sprints.filter(s => {
                return dateStr >= s.startDate && dateStr <= s.endDate;
            });

            const isToday = new Date().toISOString().split('T')[0] === dateStr;

            days.push(
                <div key={d} className={`calendar-day ${isToday ? 'today' : ''} ${activeSprints.length > 0 ? 'sprint-active' : ''}`}>
                    <span className="day-number">{d}</span>
                    {activeSprints.map(s => (
                        <div key={s.id} className="sprint-indicator" title={s.name}>{s.name}</div>
                    ))}
                </div>
            );
        }

        return (
            <div className="calendar-container">
                <div className="calendar-header">
                    <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))}>◀</button>
                    <h3>{monthNames[month]} {year}</h3>
                    <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))}>▶</button>
                </div>
                <div className="calendar-grid">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="calendar-day-name">{day}</div>
                    ))}
                    {days}
                </div>
            </div>
        );
    };

    // --- HABIT HEATMAP LOGIC ---
    const renderHabitHeatmap = () => {
        const totalHabits = habits.length;
        if (totalHabits === 0) return <p className="empty-state">No habits created yet. Go to Habits tab!</p>;

        const days = [];
        // Generate last 30 days
        for (let i = 29; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];

            const logForDay = logs.find(log => log.logDate === dateStr);
            const completedCount = logForDay ? logForDay.completedHabitIds.length : 0;
            const percentage = (completedCount / totalHabits) * 100;

            let intensityClass = 'heat-0';
            if (percentage > 0 && percentage <= 33) intensityClass = 'heat-1';
            else if (percentage > 33 && percentage <= 66) intensityClass = 'heat-2';
            else if (percentage > 66 && percentage < 100) intensityClass = 'heat-3';
            else if (percentage === 100) intensityClass = 'heat-4';

            days.push(
                <div
                    key={dateStr}
                    className={`heat-cell ${intensityClass}`}
                    title={`${dateStr}: ${completedCount}/${totalHabits} habits completed`}
                ></div>
            );
        }

        return (
            <div className="heatmap-container">
                <div className="heatmap-grid">{days}</div>
                <div className="heatmap-legend">
                    <span>Less</span>
                    <div className="heat-cell heat-0"></div>
                    <div className="heat-cell heat-1"></div>
                    <div className="heat-cell heat-2"></div>
                    <div className="heat-cell heat-3"></div>
                    <div className="heat-cell heat-4"></div>
                    <span>More</span>
                </div>
            </div>
        );
    };

    return (
        <div className="main-dashboard">
            <div className="dashboard-metrics-row">
                <div className="metric-card">
                    <h3>Active Sprints</h3>
                    <p className="metric-value">{sprints.length}</p>
                </div>
                <div className="metric-card">
                    <h3>Total Habits tracked</h3>
                    <p className="metric-value">{habits.length}</p>
                </div>
            </div>

            <div className="dashboard-content-grid">
                <div className="dashboard-card calendar-card">
                    <h2>Sprint Calendar</h2>
                    {renderCalendar()}
                </div>

                <div className="dashboard-card habits-card">
                    <h2>Habit Consistency (Last 30 Days)</h2>
                    {renderHabitHeatmap()}
                </div>
            </div>
        </div>
    );
};

export default MainDashboard;