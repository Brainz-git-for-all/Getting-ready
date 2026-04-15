import React, { useState } from 'react';
import { authService } from '../../api';


const Register = ({ onLoginSuccess, onSwitchToLogin }) => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            // 1. Register the new user in the backend
            await authService.register(credentials);

            // 2. Automatically log them in to get the JWT cookies
            const loginResponse = await authService.login(credentials);
            const actualUserId = loginResponse.data?.id || loginResponse.data?.userId;

            if (!actualUserId) {
                setError("Registration successful, but auto-login failed. Please login manually.");
                setIsSubmitting(false);
                return;
            }

            // 3. Save to local storage just like Login.js
            localStorage.setItem('userId', actualUserId);
            localStorage.setItem('username', loginResponse.data?.username || credentials.username);
            localStorage.setItem('isLoggedIn', 'true');

            // 4. Trigger success to load the dashboard
            onLoginSuccess();
        } catch (err) {
            // Display specific backend error if available (e.g., "Username is already taken!")
            if (err.response && err.response.data && typeof err.response.data === 'string') {
                setError(err.response.data);
            } else {
                setError('Registration failed. Please try a different username.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="login-container">
            <form className="login-card" onSubmit={handleSubmit}>
                <h2>Register</h2>
                <p>Create a new account</p>

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
                    {isSubmitting ? 'Registering...' : 'Register'}
                </button>

                <p style={{ marginTop: '15px', fontSize: '0.8rem' }}>
                    Already have an account? <span
                        onClick={onSwitchToLogin}
                        style={{ color: '#4f46e5', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        Login here
                    </span>
                </p>
            </form>
        </div>
    );
};

export default Register;