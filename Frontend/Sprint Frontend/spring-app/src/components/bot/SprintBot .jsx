import React, { useState, useRef, useEffect } from 'react';
import { aiService } from '../../api';
import { customAlert } from '../AlertSystem';
import AiProfileForm from './AiProfileForm';

const SprintBot = ({ userId }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [showProfileForm, setShowProfileForm] = useState(false);
    const [messages, setMessages] = useState([
        { sender: 'ai', text: 'Hi! Tell me what you want to achieve, and I will check your current Sprints and Categories to build a flawless plan.' }
    ]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const hasActiveProposal = messages.length > 0 && messages[messages.length - 1].proposal != null;

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async () => {
        if (!inputText.trim()) return;

        const userMsg = inputText;
        const newMessages = [...messages, { sender: 'user', text: userMsg }];
        setMessages(newMessages);
        setInputText('');
        setIsLoading(true);

        try {
            const formattedHistory = newMessages.map(msg => ({
                role: msg.sender === 'user' ? 'user' : 'assistant',
                content: msg.proposal ? JSON.stringify(msg.proposal) : msg.text
            }));

            const response = await aiService.chat({ userId, history: formattedHistory });

            let aiData;
            const rawData = response.data;

            // Robust Parsing Logic
            try {
                aiData = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
            } catch (parseError) {
                // If parsing fails, treat it as a normal chat message
                aiData = { type: 'CHAT', message: typeof rawData === 'string' ? rawData : "Unexpected response format." };
            }

            setMessages(prev => [...prev, {
                sender: 'ai',
                text: aiData.message || "I've processed your request.",
                proposal: aiData.type === 'PROPOSAL' ? aiData.proposal : null
            }]);

        } catch (error) {
            console.error("SprintBot Error:", error);
            setMessages(prev => [...prev, { sender: 'ai', text: "Sorry, I had trouble processing that! Check the server logs." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAcceptProposal = async (proposal) => {
        try {
            let safeProposal = typeof proposal === 'string' ? JSON.parse(proposal) : proposal;
            const payload = { userId: parseInt(userId), ...safeProposal };

            console.log("🚀 REACT IS SENDING THIS EXACT DATA TO JAVA:", payload);

            await aiService.acceptProposal(payload);

            setMessages(prev => [...prev, { sender: 'ai', text: "Proposal saved! (Auto-refresh is currently paused for debugging)." }]);
            customAlert("Success!", "Check the F12 console now!");

            // 🛑 TEMPORARILY COMMENTED OUT SO WE CAN READ THE CONSOLE 🛑
            // setTimeout(() => {
            //     window.location.reload();
            // }, 1500);

        } catch (error) {
            console.error("Failed to send proposal:", error);
            customAlert("Error", "Failed to save the proposal.");
        }
    };

    return (
        <div className="bot-container">
            {showProfileForm && <AiProfileForm userId={userId} onClose={() => setShowProfileForm(false)} />}

            {isOpen && (
                <div className={`bot-window ${hasActiveProposal ? 'bot-window-wide' : ''}`}>
                    <div className="bot-header">
                        <span>✨ SprintBot Consultant</span>
                        <div>
                            <button onClick={() => setShowProfileForm(true)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontSize: '16px', marginRight: '10px' }}>⚙️</button>
                            <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontSize: '16px' }}>✖</button>
                        </div>
                    </div>

                    <div className="bot-messages">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={msg.sender === 'user' ? 'msg-user' : 'msg-ai'}>
                                <div>{msg.text}</div>

                                {msg.proposal && (
                                    <div className="proposal-card">
                                        {msg.proposal.sprintName && (
                                            <div className="proposal-title">
                                                Sprint: {msg.proposal.sprintName} ({msg.proposal.durationDays} Days)
                                            </div>
                                        )}
                                        {msg.proposal.sprintId && (
                                            <div className="proposal-title">
                                                Adding to Existing Sprint ID: {msg.proposal.sprintId}
                                            </div>
                                        )}

                                        {/* SPRINT TASKS TABLE */}
                                        {msg.proposal.tasks && msg.proposal.tasks.length > 0 && (
                                            <>
                                                <strong>📋 Sprint Tasks</strong>
                                                <table className="ai-table">
                                                    <thead><tr><th>Name</th><th>Description</th><th>Priority</th><th>End Date</th></tr></thead>
                                                    <tbody>
                                                        {msg.proposal.tasks.map((t, i) => (
                                                            <tr key={i}><td>{t.name}</td><td>{t.description}</td><td>{t.priority}</td><td>{t.endDate || '-'}</td></tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </>
                                        )}

                                        {/* QUICK TASKS TABLE */}
                                        {msg.proposal.quickTasks && msg.proposal.quickTasks.length > 0 && (
                                            <>
                                                <strong>⚡ Quick Tasks</strong>
                                                <table className="ai-table">
                                                    <thead><tr><th>Name</th><th>Description</th><th>Category</th></tr></thead>
                                                    <tbody>
                                                        {msg.proposal.quickTasks.map((t, i) => (
                                                            <tr key={i}><td>{t.name}</td><td>{t.description}</td><td>{t.categoryName || '-'}</td></tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </>
                                        )}

                                        {/* HABITS TABLE */}
                                        {msg.proposal.habits && msg.proposal.habits.length > 0 && (
                                            <>
                                                <strong>🔄 Daily Habits</strong>
                                                <table className="ai-table">
                                                    <thead><tr><th>Habit Name</th><th>Type</th><th>Category</th><th>Time</th></tr></thead>
                                                    <tbody>
                                                        {msg.proposal.habits.map((h, i) => (
                                                            <tr key={i}>
                                                                <td>{h.name}</td>
                                                                <td style={{ color: h.badHabit ? 'red' : 'green' }}>{h.badHabit ? 'Bad Habit' : 'Good Habit'}</td>
                                                                <td>{h.categoryName || '-'}</td>
                                                                <td>{h.remindTime || 'None'}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </>
                                        )}

                                        {/* SCHEDULE BLOCKS TABLE */}
                                        {msg.proposal.scheduleBlocks && msg.proposal.scheduleBlocks.length > 0 && (
                                            <>
                                                <strong>📅 Schedule Blocks</strong>
                                                <table className="ai-table">
                                                    <thead><tr><th>Day</th><th>Start</th><th>End</th><th>Category</th></tr></thead>
                                                    <tbody>
                                                        {msg.proposal.scheduleBlocks.map((b, i) => (
                                                            <tr key={i}><td>{b.day}</td><td>{b.startTime}</td><td>{b.endTime}</td><td>{b.categoryName}</td></tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </>
                                        )}

                                        <button className="proposal-accept-btn" onClick={() => handleAcceptProposal(msg.proposal)}>
                                            ✓ Accept & Save Plan
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                        {isLoading && <div className="msg-ai">Analyzing database... 🤔</div>}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="bot-input-area">
                        <input type="text" className="bot-input" placeholder="Ask me to build a sprint..." value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} />
                        <button className="bot-send" onClick={handleSend} disabled={isLoading}>➤</button>
                    </div>
                </div>
            )}

            {!isOpen && (
                <div className="bot-bubble" onClick={() => setIsOpen(true)}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                </div>
            )}
        </div>
    );
};

export default SprintBot;