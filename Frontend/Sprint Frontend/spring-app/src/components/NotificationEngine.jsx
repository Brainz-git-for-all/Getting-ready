import React, { useEffect, useRef } from 'react';
import { habitService, sprintService, quickTaskService, scheduleBlockService } from '../api';

const ALERT_SOUND = "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3";

const NotificationEngine = ({ userId }) => {
    // Keep track of what we've already reminded the user about today so we don't spam them
    const notifiedIds = useRef(new Set());
    const audioRef = useRef(new Audio(ALERT_SOUND));

    useEffect(() => {
        if (!userId) return;

        // Ask browser for notification permission on load
        if (Notification.permission === "default") {
            Notification.requestPermission();
        }

        const fireNotification = (idKey, title, body) => {
            if (notifiedIds.current.has(idKey)) return; // Already notified

            notifiedIds.current.add(idKey);
            audioRef.current.play().catch(e => console.log("Audio play prevented by browser"));

            if (Notification.permission === "granted") {
                new Notification(title, { body, icon: "/favicon.ico" }); // Change icon path if needed
            }
        };

        const checkReminders = async () => {
            try {
                const now = new Date();
                const currentDayName = now.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
                const currentTimeStr = now.toTimeString().substring(0, 5); // "HH:MM"
                const currentDateTimeStr = now.toISOString().substring(0, 16); // "YYYY-MM-DDTHH:MM"

                // Fetch data
                const [habitsRes, blocksRes, sprintsRes, qTasksRes] = await Promise.all([
                    habitService.getAll(userId),
                    scheduleBlockService.getByUserAndDay(userId, currentDayName),
                    sprintService.getAllByUser(userId),
                    quickTaskService.getAllByUser(userId)
                ]);

                // 1. Check Habits (Daily at specific time)
                (habitsRes.data || []).forEach(habit => {
                    if (habit.remindEnabled && habit.remindTime) {
                        const hTime = habit.remindTime.substring(0, 5);
                        if (hTime === currentTimeStr) {
                            fireNotification(`habit-${habit.id}-${todayStr()}`, "Habit Reminder", `Time for your habit: ${habit.name}`);
                        }
                    }
                });

                // 2. Check Schedule Blocks (Offset minutes before start)
                (blocksRes.data || []).forEach(block => {
                    if (block.remindEnabled && block.startTime) {
                        // Calculate trigger time
                        const [hours, minutes] = block.startTime.split(':').map(Number);
                        const blockTime = new Date(now);
                        blockTime.setHours(hours, minutes, 0, 0);
                        blockTime.setMinutes(blockTime.getMinutes() - (block.remindOffsetMinutes || 15));

                        const triggerTimeStr = blockTime.toTimeString().substring(0, 5);
                        if (triggerTimeStr === currentTimeStr) {
                            fireNotification(`block-${block.id}-${todayStr()}`, "Upcoming Schedule", `${block.category?.name} starts in ${block.remindOffsetMinutes} minutes!`);
                        }
                    }
                });

                // 3. Check Sprint Tasks (Exact Date & Time)
                (sprintsRes.data || []).forEach(sprint => {
                    (sprint.tasks || []).forEach(task => {
                        if (!task.completed && task.remindAt) {
                            const taskRemindStr = task.remindAt.substring(0, 16); // Match "YYYY-MM-DDTHH:MM"
                            if (taskRemindStr === currentDateTimeStr) {
                                fireNotification(`task-${task.id}`, "Task Reminder", `Deadline approaching for: ${task.name}`);
                            }
                        }
                    });
                });

                // 4. Check Quick Tasks (Exact Date & Time)
                (qTasksRes.data || []).forEach(qt => {
                    if (!qt.completed && qt.remindAt) {
                        const qtRemindStr = qt.remindAt.substring(0, 16);
                        if (qtRemindStr === currentDateTimeStr) {
                            fireNotification(`qtask-${qt.id}`, "Quick Task Reminder", `Reminder: ${qt.name}`);
                        }
                    }
                });

            } catch (error) {
                console.error("Reminder Engine Error:", error);
            }
        };

        const todayStr = () => new Date().toISOString().split('T')[0];

        // Run immediately, then check every 1 minute
        checkReminders();
        const intervalId = setInterval(checkReminders, 60000);

        return () => clearInterval(intervalId);
    }, [userId]);

    return null; // Renders nothing on the screen!
};

export default NotificationEngine;