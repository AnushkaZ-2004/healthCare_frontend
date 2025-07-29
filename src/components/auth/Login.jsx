import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/login.css';

const Login = () => {
    const [credentials, setCredentials] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials({
            ...credentials,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const result = await login(credentials);

        if (result.success) {
            const user = JSON.parse(localStorage.getItem('healthcare_user'));
            // Redirect based on user role
            switch (user.role) {
                case 'ADMIN':
                    navigate('/admin/dashboard');
                    break;
                case 'DOCTOR':
                    navigate('/doctor/dashboard');
                    break;
                case 'PATIENT':
                    navigate('/patient/dashboard');
                    break;
                default:
                    navigate('/admin/dashboard');
            }
        } else {
            setError(result.message || 'Login failed. Please check your credentials.');
        }

        setLoading(false);
    };

    return (
        <div className="login-container">
            <div className="login-background">
                <div className="login-card">
                    <div className="login-header">
                        <div className="logo">
                            <div className="logo-icon">🏥</div>
                            <h1>HealthCare Management</h1>
                        </div>
                        <p>Sign in to your account</p>
                    </div>

                    <form onSubmit={handleSubmit} className="login-form">
                        {error && <div className="error-message">{error}</div>}

                        <div className="form-group">
                            <label htmlFor="username">Username</label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={credentials.username}
                                onChange={handleChange}
                                required
                                placeholder="Enter your username"
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={credentials.password}
                                onChange={handleChange}
                                required
                                placeholder="Enter your password"
                                disabled={loading}
                            />
                        </div>

                        <button
                            type="submit"
                            className="login-button"
                            disabled={loading}
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="login-footer">
                        <div className="demo-accounts">
                            <h3>Demo Accounts:</h3>
                            <div className="demo-account">
                                <strong>Admin:</strong> admin / admin123
                            </div>
                            <div className="demo-account">
                                <strong>Doctor:</strong> dr.smith / admin123
                            </div>
                            <div className="demo-account">
                                <strong>Patient:</strong> patient1 / admin123
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;