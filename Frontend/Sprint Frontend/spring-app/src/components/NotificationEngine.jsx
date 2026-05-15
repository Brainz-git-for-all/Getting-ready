import React, { useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

const ALERT_SOUND = "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3";

const NotificationEngine = ({ userId }) => {
    const audioRef = useRef(new Audio(ALERT_SOUND));

    useEffect(() => {
        if (!userId) return;

        if (Notification.permission === "default") {
            Notification.requestPermission();
        }

        const fireNotification = (title, body) => {
            audioRef.current.play().catch(e => console.log("Audio blocked by browser."));

            if (Notification.permission === "granted") {
                new Notification(title, { body, icon: "/favicon.ico" });
            }
        };

        // ==========================================
        // WEBSOCKET LISTENER (Listens for everything!)
        // ==========================================
        const stompClient = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
            onConnect: () => {
                console.log("🟢 WebSockets Connected! Listening for all reminders...");

                stompClient.subscribe(`/queue/alerts-${userId}`, (message) => {
                    // Plays sound and shows Desktop notification perfectly
                    fireNotification("🔔 SprintApp Alert", message.body);
                });
            }
        });

        stompClient.activate();

        // Cleanup when logging out
        return () => stompClient.deactivate();
    }, [userId]);

    return null;
};

export default NotificationEngine;