import React, { useState, useEffect } from 'react';
import Header from '../common/Header';
import Sidebar from '../common/Sidebar';
import Modal from '../common/Modal';
import { doctorService } from '../../services/doctorService';
import { SPECIALIZATIONS } from '../../utils/constants';

const DoctorManagement = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingDoctor, setEditingDoctor] = useState(null);
    const [formData, setFormData] = useState({
        user: {
            username: '',
            email: '',
            password: '',
            firstName: '',
            lastName: '',
            phoneNumber: '',
            role: 'DOCTOR',
            active: true
        },
        specialization: '',
        qualification: '',
        experience: '',
        department: '',
        consultationFee: '',
        workingHours: '',
        available: true
    });

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        try {
            const data = await doctorService.getAllDoctors();
            setDoctors(data);
        } catch (error) {
            console.error('Error fetching doctors:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name.startsWith('user.')) {
            const userField = name.replace('user.', '');
            setFormData(prev => ({
                ...prev,
                user: {
                    ...prev.user,
                    [userField]: type === 'checkbox' ? checked : value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingDoctor) {
                await doctorService.updateDoctor(editingDoctor.id, formData);
            } else {
                await doctorService.createDoctor(formData);
            }
            fetchDoctors();
            setShowModal(false);
            resetForm();
        } catch (error) {
            console.error('Error saving doctor:', error);
            alert('Error saving doctor. Please try again.');
        }
    };

    const handleEdit = (doctor) => {
        setEditingDoctor(doctor);
        setFormData({
            user: {
                username: doctor.user.username,
                email: doctor.user.email,
                password: '',
                firstName: doctor.user.firstName,
                lastName: doctor.user.lastName,
                phoneNumber: doctor.user.phoneNumber || '',
                role: 'DOCTOR',
                active: doctor.user.active
            },
            specialization: doctor.specialization || '',
            qualification: doctor.qualification || '',
            experience: doctor.experience || '',
            department: doctor.department || '',
            consultationFee: doctor.consultationFee || '',
            workingHours: doctor.workingHours || '',
            available: doctor.available
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this doctor?')) {
            try {
                await doctorService.deleteDoctor(id);
                fetchDoctors();
            } catch (error) {
                console.error('Error deleting doctor:', error);
            }
        }
    };

    const resetForm = () => {
        setFormData({
            user: {
                username: '',
                email: '',
                password: '',
                firstName: '',
                lastName: '',
                phoneNumber: '',
                role: 'DOCTOR',
                active: true
            },
            specialization: '',
            qualification: '',
            experience: '',
            department: '',
            consultationFee: '',
            workingHours: '',
            available: true
        });
        setEditingDoctor(null);
    };

    const openAddModal = () => {
        resetForm();
        setShowModal(true);
    };

    return (
        <div className="main-layout">
            <Sidebar />
            <div className="content-area">
                <Header title="Doctor Management" />
                <div className="page-content">
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">All Doctors</h3>
                            <button className="btn btn-primary" onClick={openAddModal}>
                                Add New Doctor
                            </button>
                        </div>

                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Doctor ID</th>
                                        <th>Name</th>
                                        <th>Specialization</th>
                                        <th>Experience</th>
                                        <th>Department</th>
                                        <th>Fee</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {doctors.map((doctor) => (
                                        <tr key={doctor.id}>
                                            <td>{doctor.doctorId}</td>
                                            <td>Dr. {doctor.user.firstName} {doctor.user.lastName}</td>
                                            <td>{doctor.specialization}</td>
                                            <td>{doctor.experience} years</td>
                                            <td>{doctor.department}</td>
                                            <td>${doctor.consultationFee}</td>
                                            <td>
                                                <span className={`status-badge ${doctor.available && doctor.user.active ? 'status-active' : 'status-inactive'}`}>
                                                    {doctor.available && doctor.user.active ? 'Available' : 'Unavailable'}
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    className="btn btn-sm btn-secondary"
                                                    onClick={() => handleEdit(doctor)}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-danger"
                                                    onClick={() => handleDelete(doctor.id)}
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

                    {/* Doctor Form Modal */}
                    {showModal && (
                        <Modal
                            title={editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}
                            onClose={() => setShowModal(false)}
                        >
                            <form onSubmit={handleSubmit}>
                                <h4>User Information</h4>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Username</label>
                                        <input
                                            type="text"
                                            name="department"
                                            value={formData.department}
                                            onChange={handleInputChange}
                                            className="form-control"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Qualification</label>
                                    <input
                                        type="text"
                                        name="qualification"
                                        value={formData.qualification}
                                        onChange={handleInputChange}
                                        className="form-control"
                                        placeholder="MBBS, MD, etc."
                                        required
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Experience (Years)</label>
                                        <input
                                            type="number"
                                            name="experience"
                                            value={formData.experience}
                                            onChange={handleInputChange}
                                            className="form-control"
                                            min="0"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Consultation Fee ($)</label>
                                        <input
                                            type="number"
                                            name="consultationFee"
                                            value={formData.consultationFee}
                                            onChange={handleInputChange}
                                            className="form-control"
                                            min="0"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Working Hours</label>
                                    <input
                                        type="text"
                                        name="workingHours"
                                        value={formData.workingHours}
                                        onChange={handleInputChange}
                                        className="form-control"
                                        placeholder="9:00 AM - 5:00 PM"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>
                                        <input
                                            type="checkbox"
                                            name="available"
                                            checked={formData.available}
                                            onChange={handleInputChange}
                                        />
                                        Available for appointments
                                    </label>
                                </div>

                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        {editingDoctor ? 'Update' : 'Create'} Doctor
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

export default DoctorManagement;