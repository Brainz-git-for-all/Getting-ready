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
            // 1. Call your updated AuthController @PostMapping("/login")
            const response = await authService.login(credentials);

            /**
             * 2. Extract data from the new UserResponse structure:
             * response.data.id (The Long ID from your Java backend)
             * response.data.username
             */
            localStorage.setItem('userId', response.data.id);
            localStorage.setItem('username', response.data.username);
            localStorage.setItem('isLoggedIn', 'true');

            // 3. Trigger the success callback to change App view
            onLoginSuccess();
        } catch (err) {
            // Handle 401 Unauthorized or connection errors
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