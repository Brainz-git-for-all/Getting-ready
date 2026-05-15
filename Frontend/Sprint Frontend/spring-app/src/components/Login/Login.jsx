import React, { useState } from 'react';
import { authService } from '../../api';

const Login = ({ onLoginSuccess, onSwitchToRegister }) => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setIsSubmitting(true);
        try {
            const response = await authService.login(credentials);
            const actualUserId = response.data?.id || response.data?.userId;
            if (!actualUserId) return setError("Login failed: Missing ID.");

            localStorage.setItem('userId', actualUserId);
            localStorage.setItem('username', response.data?.username || "User");
            localStorage.setItem('isLoggedIn', 'true');
            onLoginSuccess();
        } catch (err) {
            setError('Unauthorized: Please check your credentials.');
        } finally { setIsSubmitting(false); }
    };

    return (
        <div className="login-container">
            <form className="login-card" onSubmit={handleSubmit}>
                <h2>Sign In</h2>
                {error && <div className="error-message">{error}</div>}

                <div className="form-group"><input type="text" placeholder="Username" value={credentials.username} onChange={e => setCredentials({ ...credentials, username: e.target.value })} required /></div>
                <div className="form-group"><input type="password" placeholder="Password" value={credentials.password} onChange={e => setCredentials({ ...credentials, password: e.target.value })} required /></div>

                <button type="submit" className="btn-login" disabled={isSubmitting}>{isSubmitting ? 'Authenticating...' : 'Login'}</button>
                <p style={{ marginTop: '15px', fontSize: '0.8rem' }}>Don't have an account? <span onClick={onSwitchToRegister} style={{ color: '#4f46e5', cursor: 'pointer' }}>Register here</span></p>
            </form>
        </div>
    );
};
export default Login;