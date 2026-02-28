import React, { useState } from 'react';
import { authService } from '../../api';
import './Login.css';

const Login = ({ onLoginSuccess, onSwitchToRegister }) => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            const response = await authService.login(credentials);

            // Console log to see exactly what Spring Boot sends back
            console.log("Backend Login Response:", response.data);

            // FIXED: Look for either 'id' or 'userId' in the response.
            const actualUserId = response.data?.id || response.data?.userId;

            if (!actualUserId) {
                setError("Login failed: The backend did not return a user ID.");
                setIsSubmitting(false);
                return; // Stop here, do not save undefined to local storage
            }

            localStorage.setItem('userId', actualUserId);
            localStorage.setItem('username', response.data?.username || "User");
            localStorage.setItem('isLoggedIn', 'true');

            onLoginSuccess();
        } catch (err) {
            setError('Unauthorized: Please check your credentials.');
        } finally {
            setIsSubmitting(false);
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
                        type="text"
                        placeholder="Username"
                        value={credentials.username}
                        onChange={e => setCredentials({ ...credentials, username: e.target.value })}
                        required
                        disabled={isSubmitting}
                    />
                </div>

                <div className="form-group">
                    <input
                        type="password"
                        placeholder="Password"
                        value={credentials.password}
                        onChange={e => setCredentials({ ...credentials, password: e.target.value })}
                        required
                        disabled={isSubmitting}
                    />
                </div>

                <button
                    type="submit"
                    className="btn-login"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Authenticating...' : 'Login'}
                </button>

                <p style={{ marginTop: '15px', fontSize: '0.8rem' }}>
                    Don't have an account? <span
                        onClick={onSwitchToRegister}
                        style={{ color: '#4f46e5', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        Register here
                    </span>
                </p>
            </form>
        </div>
    );
};

export default Login;