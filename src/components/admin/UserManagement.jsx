import React, { useState, useEffect } from 'react';
import Header from '../common/Header';
import Sidebar from '../common/Sidebar';
import Modal from '../common/Modal';
import { userService } from '../../services/userService';
import { USER_ROLES } from '../../utils/constants';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        role: 'PATIENT',
        active: true
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const data = await userService.getAllUsers();
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingUser) {
                await userService.updateUser(editingUser.id, formData);
            } else {
                await userService.createUser(formData);
            }
            fetchUsers();
            setShowModal(false);
            resetForm();
        } catch (error) {
            console.error('Error saving user:', error);
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setFormData({
            username: user.username,
            email: user.email,
            password: '',
            firstName: user.firstName,
            lastName: user.lastName,
            phoneNumber: user.phoneNumber || '',
            role: user.role,
            active: user.active
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await userService.deleteUser(id);
                fetchUsers();
            } catch (error) {
                console.error('Error deleting user:', error);
            }
        }
    };

    const handleDeactivate = async (id) => {
        try {
            await userService.deactivateUser(id);
            fetchUsers();
        } catch (error) {
            console.error('Error deactivating user:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            username: '',
            email: '',
            password: '',
            firstName: '',
            lastName: '',
            phoneNumber: '',
            role: 'PATIENT',
            active: true
        });
        setEditingUser(null);
    };

    const openAddModal = () => {
        resetForm();
        setShowModal(true);
    };

    return (
        <div className="main-layout">
            <Sidebar />
            <div className="content-area">
                <Header title="User Management" />
                <div className="page-content">
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">All Users</h3>
                            <button className="btn btn-primary" onClick={openAddModal}>
                                Add New User
                            </button>
                        </div>

                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Username</th>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Phone</th>
                                        <th>Role</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user.id}>
                                            <td>{user.username}</td>
                                            <td>{user.firstName} {user.lastName}</td>
                                            <td>{user.email}</td>
                                            <td>{user.phoneNumber || 'N/A'}</td>
                                            <td>
                                                <span className={`status-badge role-${user.role.toLowerCase()}`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`status-badge ${user.active ? 'status-active' : 'status-inactive'}`}>
                                                    {user.active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    className="btn btn-sm btn-secondary"
                                                    onClick={() => handleEdit(user)}
                                                >
                                                    Edit
                                                </button>
                                                {user.active && (
                                                    <button
                                                        className="btn btn-sm btn-warning"
                                                        onClick={() => handleDeactivate(user.id)}
                                                    >
                                                        Deactivate
                                                    </button>
                                                )}
                                                <button
                                                    className="btn btn-sm btn-danger"
                                                    onClick={() => handleDelete(user.id)}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* User Form Modal */}
                    {showModal && (
                        <Modal
                            title={editingUser ? 'Edit User' : 'Add New User'}
                            onClose={() => setShowModal(false)}
                        >
                            <form onSubmit={handleSubmit}>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Username</label>
                                        <input
                                            type="text"
                                            name="username"
                                            value={formData.username}
                                            onChange={handleInputChange}
                                            className="form-control"
                                            required
                                            disabled={editingUser} // Don't allow username changes
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className="form-control"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>First Name</label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleInputChange}
                                            className="form-control"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Last Name</label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleInputChange}
                                            className="form-control"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Phone Number</label>
                                        <input
                                            type="tel"
                                            name="phoneNumber"
                                            value={formData.phoneNumber}
                                            onChange={handleInputChange}
                                            className="form-control"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Role</label>
                                        <select
                                            name="role"
                                            value={formData.role}
                                            onChange={handleInputChange}
                                            className="form-control"
                                            required
                                        >
                                            {Object.values(USER_ROLES).map(role => (
                                                <option key={role} value={role}>{role}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Password {editingUser && '(Leave blank to keep current password)'}</label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className="form-control"
                                        required={!editingUser}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>
                                        <input
                                            type="checkbox"
                                            name="active"
                                            checked={formData.active}
                                            onChange={handleInputChange}
                                        />
                                        Active User
                                    </label>
                                </div>

                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        {editingUser ? 'Update' : 'Create'} User
                                    </button>
                                </div>
                            </form>
                        </Modal>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserManagement;