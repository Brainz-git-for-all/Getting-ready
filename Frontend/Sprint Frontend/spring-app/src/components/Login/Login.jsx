import React, { useState } from 'react';
import { authService } from '../../api';
import './Login.css';

const Login = ({ onLoginSuccess, onSwitchToRegister }) => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await authService.login(credentials);
            localStorage.setItem('username', response.data.username);
            localStorage.setItem('isLoggedIn', 'true');
            onLoginSuccess();
        } catch (err) {
            setError('Unauthorized: Please check your credentials.');
        }
    };

    return (
        <div className="login-container">
            <form className="login-card" onSubmit={handleSubmit}>
                <h2>Sign In</h2>
                <p>Access your project roadmap</p>
                {error && <div className="error-message">{error}</div>}
                <div className="form-group">
                    <input
                        placeholder="Username"
                        onChange={e => setCredentials({ ...credentials, username: e.target.value })}
                        required
                    />
                </div>
                <div className="form-group">
                    <input
                        type="password"
                        placeholder="Password"
                        onChange={e => setCredentials({ ...credentials, password: e.target.value })}
                        required
                    />
                </div>
                <button type="submit" className="btn-login">Login</button>
                <p style={{ marginTop: '15px', fontSize: '0.8rem' }}>
                    Don't have an account? <span onClick={onSwitchToRegister} style={{ color: '#4f46e5', cursor: 'pointer' }}>Register here</span>
                </p>
            </form>
        </div>
    );
};

export default Login;