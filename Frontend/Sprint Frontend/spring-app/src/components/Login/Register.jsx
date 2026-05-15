import React, { useState } from 'react';
import { authService } from '../../api';

const Register = ({ onLoginSuccess, onSwitchToLogin }) => {
    const [credentials, setCredentials] = useState({
        username: '', password: '', email: '', phoneNumber: ''
    });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setIsSubmitting(true);

        try {
            await authService.register(credentials);
            const loginRes = await authService.login({ username: credentials.username, password: credentials.password });
            const actualUserId = loginRes.data?.id || loginRes.data?.userId;

            if (!actualUserId) return setError("Login failed manually.");

            localStorage.setItem('userId', actualUserId);
            localStorage.setItem('username', loginRes.data?.username || credentials.username);
            localStorage.setItem('isLoggedIn', 'true');
            onLoginSuccess();
        } catch (err) {
            setError(err.response?.data || 'Registration failed.');
        } finally { setIsSubmitting(false); }
    };

    return (
        <div className="login-container">
            <form className="login-card" onSubmit={handleSubmit}>
                <h2>Register</h2>
                {error && <div className="error-message">{error}</div>}

                <div className="form-group"><input type="text" placeholder="Username *" value={credentials.username} onChange={e => setCredentials({ ...credentials, username: e.target.value })} required /></div>
                <div className="form-group"><input type="email" placeholder="Email Address *" value={credentials.email} onChange={e => setCredentials({ ...credentials, email: e.target.value })} required /></div>
                <div className="form-group"><input type="tel" placeholder="Phone (Optional)" value={credentials.phoneNumber} onChange={e => setCredentials({ ...credentials, phoneNumber: e.target.value })} /></div>
                <div className="form-group"><input type="password" placeholder="Password *" value={credentials.password} onChange={e => setCredentials({ ...credentials, password: e.target.value })} required /></div>

                <button type="submit" className="btn-login" disabled={isSubmitting}>{isSubmitting ? 'Registering...' : 'Register'}</button>
                <p style={{ marginTop: '15px', fontSize: '0.8rem' }}>Already have an account? <span onClick={onSwitchToLogin} style={{ color: '#4f46e5', cursor: 'pointer' }}>Login here</span></p>
            </form>
        </div>
    );
};
export default Register;