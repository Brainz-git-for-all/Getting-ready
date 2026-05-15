import React, { useState, useEffect } from 'react';
import { sprintService, quickTaskService, habitService } from '../../api';

const MainDashboard = ({ userId }) => {
    const [sprints, setSprints] = useState([]);
    const [quickTasks, setQuickTasks] = useState([]);
    const [habits, setHabits] = useState([]);
    const [logs, setLogs] = useState([]);

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
        } catch (error) { console.error("Error fetching dashboard data", error); }
    };

    const normalizeDate = (dateVal) => {
        if (!dateVal) return null;
        if (Array.isArray(dateVal)) {
            return `${dateVal[0]}-${String(dateVal[1]).padStart(2, '0')}-${String(dateVal[2]).padStart(2, '0')}`;
        }
        if (typeof dateVal === 'string') return dateVal.split('T')[0];
        return null;
    };

    const todayStr = new Date().toISOString().split('T')[0];

    // Calculate 3 days from now for upcoming deadlines
    const upcomingDate = new Date();
    upcomingDate.setDate(upcomingDate.getDate() + 3);
    const upcomingStr = upcomingDate.toISOString().split('T')[0];

    // --- TASK CALCULATIONS ---
    let totalActiveTasks = 0;
    let completedActiveTasks = 0;
    let highPriority = 0, medPriority = 0, lowPriority = 0;
    let upcomingDeadlines = [];

    const tallyTask = (task, parentName = "Quick Task") => {
        totalActiveTasks++;
        const isDone = task.completed === true || String(task.completed) === 'true';

        if (isDone) {
            completedActiveTasks++;
        } else {
            // Priorities
            const p = String(task.priority || 'medium').toLowerCase().trim();
            if (p === 'high') highPriority++;
            else if (p === 'low') lowPriority++;
            else medPriority++;

            // Upcoming Deadlines (Due today or next 3 days)
            const endDate = normalizeDate(task.endDate);
            if (endDate && endDate >= todayStr && endDate <= upcomingStr) {
                upcomingDeadlines.push({ ...task, parentName, isSprintTask: parentName !== "Quick Task" });
            }
        }
    };

    // Process Sprints
    sprints.filter(s => normalizeDate(s.endDate) >= todayStr).forEach(sprint => {
        (sprint.tasks || []).forEach(task => tallyTask(task, sprint.name));
    });

    // Process Quick Tasks
    quickTasks.filter(qt => normalizeDate(qt.endDate) >= todayStr).forEach(qt => tallyTask(qt, "Quick Task"));

    // Sort upcoming deadlines by date
    upcomingDeadlines.sort((a, b) => normalizeDate(a.endDate).localeCompare(normalizeDate(b.endDate)));

    // --- CSS PIE CHART LOGIC ---
    const sprintProgress = totalActiveTasks === 0 ? 0 : Math.round((completedActiveTasks / totalActiveTasks) * 100);
    const totalPending = highPriority + medPriority + lowPriority;
    let conicString = '#e5e7eb 0% 100%';

    if (totalPending > 0) {
        const highStop = (highPriority / totalPending) * 100;
        const medStop = highStop + ((medPriority / totalPending) * 100);
        conicString = `#ef4444 0% ${highStop}%, #f59e0b ${highStop}% ${medStop}%, #10b981 ${medStop}% 100%`;
    }

    return (
        <div className="main-dashboard" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* TOP ROW: High-Level Analytics */}
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>

                {/* 1. Velocity / Progress Card */}
                <div style={{ flex: '1.2', background: 'var(--white)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <div>
                            <h3 style={{ margin: '0 0 4px 0', color: 'var(--text-main)', fontSize: '16px' }}>Current Sprint & Task Velocity</h3>
                            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>Completion rate of active work</p>
                        </div>
                        <span style={{ fontWeight: 'bold', color: 'var(--primary)', fontSize: '24px' }}>{sprintProgress}%</span>
                    </div>

                    <div style={{ width: '100%', backgroundColor: 'var(--bg-main)', borderRadius: '999px', height: '16px', overflow: 'hidden', marginBottom: '16px' }}>
                        <div style={{ width: `${sprintProgress}%`, backgroundColor: 'var(--primary)', height: '100%', transition: 'width 0.5s ease' }}></div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600 }}>
                        <span style={{ color: 'var(--success)' }}>{completedActiveTasks} Completed</span>
                        <span style={{ color: 'var(--text-muted)' }}>{totalActiveTasks} Total Assigned</span>
                    </div>
                </div>

                {/* 2. Priority Donut Chart */}
                <div style={{ flex: '1', background: 'var(--white)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <div style={{
                        width: '100px', height: '100px', borderRadius: '50%',
                        background: `conic-gradient(${conicString})`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <div style={{
                            width: '64px', height: '64px', backgroundColor: 'var(--white)', borderRadius: '50%',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <span style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-main)', lineHeight: '1' }}>{totalPending}</span>
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>LEFT</span>
                        </div>
                    </div>

                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <h3 style={{ margin: '0', fontSize: '14px', color: 'var(--text-main)' }}>Pending Priorities</h3>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600 }}><span style={{ color: '#ef4444' }}>● High</span> <span>{highPriority}</span></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600 }}><span style={{ color: '#f59e0b' }}>● Medium</span> <span>{medPriority}</span></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600 }}><span style={{ color: '#10b981' }}>● Low</span> <span>{lowPriority}</span></div>
                    </div>
                </div>

                {/* 3. Habit Summary */}
                <div style={{ flex: '0.8', background: 'var(--white)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', color: 'var(--text-main)' }}>Daily Routines</h3>
                    <div style={{ padding: '12px', background: 'var(--bg-main)', borderRadius: '8px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>Active Good Habits</span>
                        <span style={{ fontWeight: 'bold', color: 'var(--success)' }}>{habits.filter(h => !h.badHabit).length}</span>
                    </div>
                    <div style={{ padding: '12px', background: '#fee2e2', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '13px', color: '#b91c1c', fontWeight: 600 }}>Habits to Break</span>
                        <span style={{ fontWeight: 'bold', color: 'var(--danger)' }}>{habits.filter(h => h.badHabit).length}</span>
                    </div>
                </div>
            </div>

            {/* BOTTOM ROW: Upcoming Deadlines */}
            <div style={{ background: 'var(--white)', borderRadius: '12px', border: '1px solid var(--border)', padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <div style={{ padding: '8px', background: '#fef3c7', borderRadius: '8px', color: '#d97706' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                    </div>
                    <h2 style={{ margin: 0, fontSize: '18px', color: 'var(--text-main)' }}>Critical Deadlines (Next 72 Hours)</h2>
                </div>

                {upcomingDeadlines.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', background: 'var(--bg-main)', borderRadius: '8px', color: 'var(--text-muted)' }}>
                        🎉 No urgent tasks due in the next 3 days. Excellent work!
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                        {upcomingDeadlines.map((task, idx) => (
                            <div key={idx} style={{ padding: '16px', border: '1px solid var(--border)', borderRadius: '8px', borderLeft: `4px solid ${task.priority === 'High' ? 'var(--danger)' : task.priority === 'Low' ? 'var(--success)' : 'var(--warning)'}` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--primary)', background: '#e0e7ff', padding: '2px 6px', borderRadius: '4px' }}>
                                        {task.isSprintTask ? `Sprint: ${task.parentName}` : '⚡ Quick Task'}
                                    </span>
                                    <span style={{ fontSize: '12px', fontWeight: 600, color: normalizeDate(task.endDate) === todayStr ? 'var(--danger)' : 'var(--text-muted)' }}>
                                        Due: {normalizeDate(task.endDate)}
                                    </span>
                                </div>
                                <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{task.name}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MainDashboard;