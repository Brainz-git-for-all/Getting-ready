import React, { useState, useEffect } from 'react';
import { sprintService, habitService } from '../../api';
import './MainDashboard.css';

const MainDashboard = ({ userId }) => {
    const [sprints, setSprints] = useState([]);
    const [habits, setHabits] = useState([]);
    const [logs, setLogs] = useState([]);

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
                <div className="metric-card"><h3>Active Sprints</h3><p>{sprints.length}</p></div>
                <div className="metric-card"><h3>Good Habits</h3><p style={{ color: 'green' }}>{goodHabits.length}</p></div>
                <div className="metric-card"><h3>Bad Habits</h3><p style={{ color: 'red' }}>{badHabits.length}</p></div>
            </div>

            <div className="dashboard-content-grid">
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
    );
};

export default MainDashboard;