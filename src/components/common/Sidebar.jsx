import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/sidebar.css';

const Sidebar = () => {
    const { user } = useAuth();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    const getMenuItems = () => {
        switch (user?.role) {
            case 'ADMIN':
                return [
                    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
                    { path: '/admin/users', label: 'User Management', icon: '👥' },
                    { path: '/admin/patients', label: 'Patients', icon: '🤒' },
                    { path: '/admin/doctors', label: 'Doctors', icon: '👨‍⚕️' },
                    { path: '/admin/appointments', label: 'Appointments', icon: '📅' }
                ];
            case 'DOCTOR':
                return [
                    { path: '/doctor/dashboard', label: 'Dashboard', icon: '📊' },
                    { path: '/doctor/appointments', label: 'My Appointments', icon: '📅' },
                    { path: '/doctor/patients', label: 'Patient Records', icon: '📋' }
                ];
            case 'PATIENT':
                return [
                    { path: '/patient/dashboard', label: 'Dashboard', icon: '📊' },
                    { path: '/patient/book-appointment', label: 'Book Appointment', icon: '📅' },
                    { path: '/patient/medical-history', label: 'Medical History', icon: '📋' }
                ];
            default:
                return [];
        }
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="logo">
                    <span className="logo-icon">🏥</span>
                    <span className="logo-text">HealthCare</span>
                </div>
            </div>

            <nav className="sidebar-nav">
                <ul className="nav-list">
                    {getMenuItems().map((item) => (
                        <li key={item.path} className="nav-item">
                            <Link
                                to={item.path}
                                className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                            >
                                <span className="nav-icon">{item.icon}</span>
                                <span className="nav-label">{item.label}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;