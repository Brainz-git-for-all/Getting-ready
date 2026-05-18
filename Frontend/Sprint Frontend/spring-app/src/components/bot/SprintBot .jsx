import React, { useState, useRef, useEffect } from 'react';
import { aiService } from '../../api';

import { customAlert } from '../AlertSystem';

const SprintBot = ({ userId }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { sender: 'ai', text: 'Hi! I am SprintBot. Tell me what you want to achieve, and I will build a plan for you!' }
    ]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Auto-scroll to bottom of chat
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async () => {
        if (!inputText.trim()) return;

        const userMsg = inputText;
        setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
        setInputText('');
        setIsLoading(true);

        try {
            const response = await aiService.chat({ userId, message: userMsg });

            // FIX: Safely parse the data whether Axios auto-parsed it or not
            let aiData;
            if (typeof response.data === 'string') {
                aiData = JSON.parse(response.data);
            } else {
                aiData = response.data;
            }

            setMessages(prev => [...prev, {
                sender: 'ai',
                text: aiData.message,
                proposal: aiData.type === 'PROPOSAL' ? aiData.proposal : null
            }]);

        } catch (error) {
            // NEW: Print the actual error to the console so we can see it!
            console.error("🔥 SprintBot Error Details:", error);

            setMessages(prev => [...prev, {
                sender: 'ai',
                text: "Sorry, I had trouble. Press F12 and look at the Console to see the exact error!"
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAcceptProposal = async (proposal) => {
        try {
            await aiService.acceptProposal({ userId, ...proposal });
            customAlert("Success!", "I have added everything to your dashboard and calendar!");
            setMessages(prev => [...prev, { sender: 'ai', text: "Proposal accepted and saved! Refresh your page to see the updates." }]);
        } catch (error) {
            customAlert("Error", "Failed to save the proposal.");
        }
    };

    return (
        <div className="bot-container">
            {isOpen && (
                <div className="bot-window">
                    <div className="bot-header">
                        <span>✨ SprintBot AI</span>
                        <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontSize: '16px' }}>✖</button>
                    </div>

                    <div className="bot-messages">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={msg.sender === 'user' ? 'msg-user' : 'msg-ai'}>
                                <div>{msg.text}</div>

                                {/* If the AI generated a plan, show the Accept button */}
                                {msg.proposal && (
                                    <div className="proposal-card">
                                        <strong>Suggested Plan:</strong>
                                        {msg.proposal.sprintName && <div>• Sprint: {msg.proposal.sprintName} ({msg.proposal.durationDays} Days)</div>}
                                        {msg.proposal.tasks && <div>• Tasks: {msg.proposal.tasks.length}</div>}
                                        {msg.proposal.habits && <div>• Habits: {msg.proposal.habits.length}</div>}
                                        {msg.proposal.scheduleBlocks && <div>• Schedule Blocks: {msg.proposal.scheduleBlocks.length}</div>}

                                        <button className="proposal-accept-btn" onClick={() => handleAcceptProposal(msg.proposal)}>
                                            Accept & Save Plan
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                        {isLoading && <div className="msg-ai">Thinking... 🤔</div>}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="bot-input-area">
                        <input
                            type="text"
                            className="bot-input"
                            placeholder="Ask me to build a sprint..."
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        />
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