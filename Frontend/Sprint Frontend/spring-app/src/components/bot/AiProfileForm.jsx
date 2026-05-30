import React, { useState } from 'react';
import { aiService } from '../../api';
import { customAlert } from '../AlertSystem';

const AiProfileForm = ({ userId, onClose }) => {
    const [energy, setEnergy] = useState('Early Morning');
    const [hours, setHours] = useState('3-5 hours');
    const [distraction, setDistraction] = useState('');
    const [goal, setGoal] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        // Combine answers into a paragraph for the AI
        const profileData = `User's natural energy peak is ${energy}. They can dedicate ${hours} a day to work. Their biggest distraction/weakness is: ${distraction}. Their overarching goal is: ${goal}.`;

        try {
            await aiService.saveProfile({ userId, profileData });
            customAlert("Success", "AI Profile saved! The bot will now customize plans for you.");
            onClose();
        } catch (error) {
            customAlert("Error", "Failed to save AI Profile.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="form-card" style={{ width: '400px' }}>
                <div className="modal-header">
                    <h3>🧠 Train Your AI</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '-15px', marginBottom: '20px' }}>
                        Tell SprintBot how you work best.
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>When is your natural energy peak?</label>
                        <select value={energy} onChange={(e) => setEnergy(e.target.value)}>
                            <option value="Early Morning">Early Morning</option>
                            <option value="Late Morning">Late Morning</option>
                            <option value="Afternoon">Afternoon</option>
                            <option value="Late Night">Late Night</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>How many hours a day can you dedicate?</label>
                        <select value={hours} onChange={(e) => setHours(e.target.value)}>
                            <option value="1-2 hours">1-2 hours</option>
                            <option value="3-5 hours">3-5 hours</option>
                            <option value="6+ hours">6+ hours</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>What is your biggest distraction/weakness?</label>
                        <input type="text" placeholder="e.g. Social media, burnout, procrastination" value={distraction} onChange={(e) => setDistraction(e.target.value)} required />
                    </div>

                    <div className="form-group">
                        <label>What is your main overarching goal right now?</label>
                        <input type="text" placeholder="e.g. Pass my IT exams, get a dev job" value={goal} onChange={(e) => setGoal(e.target.value)} required />
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-submit" disabled={isLoading}>
                            {isLoading ? 'Saving...' : 'Save Profile'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AiProfileForm;