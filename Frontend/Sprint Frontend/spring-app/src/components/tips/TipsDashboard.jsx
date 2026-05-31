import React, { useState, useEffect } from 'react';
import { aiService } from '../../api';

const TipsDashboard = ({ userId }) => {
    const [tipsData, setTipsData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const loadTips = async () => {
        setIsLoading(true);
        try {
            const response = await aiService.getTips(userId);
            // Parse it safely in case it's a string
            const data = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
            setTipsData(data);
        } catch (error) {
            console.error("Failed to fetch tips:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadTips();
    }, [userId]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '24px', color: 'var(--text-main)' }}>AI Coach & Analytics</h2>
                    <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)' }}>Personalized insights based on your schedule and goals.</p>
                </div>
                <button className="btn-primary" onClick={loadTips} disabled={isLoading}>
                    {isLoading ? 'Analyzing...' : '🔄 Refresh Analysis'}
                </button>
            </div>

            {isLoading ? (
                <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" style={{ animation: 'spin 2s linear infinite' }}>
                        <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                    </svg>
                    <p style={{ marginTop: '16px', fontWeight: 600 }}>Analyzing your database...</p>
                    <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
                </div>
            ) : (
                <>
                    {/* ADVICE OF THE DAY BANNER */}
                    <div style={{
                        background: 'linear-gradient(135deg, #4f46e5, #c026d3)',
                        padding: '40px', borderRadius: '16px', color: 'white',
                        boxShadow: '0 10px 25px rgba(79, 70, 229, 0.2)', textAlign: 'center'
                    }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginBottom: '16px', opacity: 0.8 }}>
                            <path d="M9 18h6" /><path d="M10 22h4" /><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 1 0 6 8c0 1.5.8 2.82 2.5 3.5.76.76 1.23 1.52 1.41 2.5z" />
                        </svg>
                        <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8 }}>Advice of the Day</h3>
                        <p style={{ margin: 0, fontSize: '22px', fontWeight: 600, lineHeight: 1.4 }}>
                            "{tipsData?.adviceOfTheDay || "Stay focused, you're doing great."}"
                        </p>
                    </div>

                    {/* 3 ACTIONABLE TIPS */}
                    <div style={{ background: 'var(--white)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                        <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: 'var(--text-main)', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                            🎯 Actionable Insights
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {(tipsData?.tips || []).map((tip, index) => (
                                <div key={index} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', background: '#f8fafc', padding: '16px', borderRadius: '8px', borderLeft: '4px solid var(--primary)' }}>
                                    <div style={{ background: '#e0e7ff', color: 'var(--primary)', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>
                                        {index + 1}
                                    </div>
                                    <p style={{ margin: 0, color: 'var(--text-main)', fontSize: '15px', lineHeight: 1.5 }}>
                                        {tip}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default TipsDashboard;