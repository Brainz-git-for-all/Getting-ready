import React, { useState } from 'react';
import { authService } from '../../api';
import './Login.css';

const Login = ({ onLoginSuccess }) => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await authService.login(credentials);
            // Correctly accessing the username property from the JSON body
            localStorage.setItem('username', response.data.username);
            onLoginSuccess();
        } catch (err) {
            setError('Unauthorized: Please check your credentials.');
        }
    };

    return (
        <div className="login-container">
            <form className="login-card" onSubmit={handleSubmit}>
                <h2>Sign In</h2>
                <p>Please enter your details to sign in</p>

                {/* Updated to match .error-message in CSS */}
                {error && <div className="error-message">{error}</div>}

                <div className="form-group">
                    <input
                        placeholder="Username"
                        value={credentials.username}
                        onChange={e => setCredentials({ ...credentials, username: e.target.value })}
                        required
                    />
                </div>

                <div className="form-group">
                    <input
                        type="password"
                        placeholder="Password"
                        value={credentials.password}
                        onChange={e => setCredentials({ ...credentials, password: e.target.value })}
                        required
                    />
                </div>

                {/* Updated to match .btn-login in CSS */}
                <button type="submit" className="btn-login">Login</button>
            </form>
        </div>
    );
};

export default Login;