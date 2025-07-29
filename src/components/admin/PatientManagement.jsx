// src/components/admin/PatientManagement.jsx
import React, { useState, useEffect } from 'react';
import Header from '../common/Header';
import Sidebar from '../common/Sidebar';
import Modal from '../common/Modal';
import { patientService } from '../../services/patientService';
import { BLOOD_GROUPS } from '../../utils/constants';
import { formatDateOnly } from '../../utils/helpers';

const PatientManagement = () => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showMedicalHistory, setShowMedicalHistory] = useState(false);
    const [editingPatient, setEditingPatient] = useState(null);
    const [medicalHistory, setMedicalHistory] = useState([]);
    const [formData, setFormData] = useState({
        user: {
            username: '',
            email: '',
            password: '',
            firstName: '',
            lastName: '',
            phoneNumber: '',
            role: 'PATIENT',
            active: true
        },
        dateOfBirth: '',
        gender: 'Male',
        address: '',
        emergencyContact: '',
        bloodGroup: 'A+',
        allergies: '',
        medicalHistory: ''
    });

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            const data = await patientService.getAllPatients();
            setPatients(data);
        } catch (error) {
            console.error('Error fetching patients:', error);
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
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingPatient) {
                await patientService.updatePatient(editingPatient.id, formData);
            } else {
                await patientService.createPatient(formData);
            }
            fetchPatients();
            setShowModal(false);
            resetForm();
        } catch (error) {
            console.error('Error saving patient:', error);
            alert('Error saving patient. Please try again.');
        }
    };

    const handleEdit = (patient) => {
        setEditingPatient(patient);
        setFormData({
            user: {
                username: patient.user.username,
                email: patient.user.email,
                password: '',
                firstName: patient.user.firstName,
                lastName: patient.user.lastName,
                phoneNumber: patient.user.phoneNumber || '',
                role: 'PATIENT',
                active: patient.user.active
            },
            dateOfBirth: patient.dateOfBirth || '',
            gender: patient.gender || 'Male',
            address: patient.address || '',
            emergencyContact: patient.emergencyContact || '',
            bloodGroup: patient.bloodGroup || 'A+',
            allergies: patient.allergies || '',
            medicalHistory: patient.medicalHistory || ''
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this patient? This will also delete their medical records.')) {
            try {
                await patientService.deletePatient(id);
                fetchPatients();
            } catch (error) {
                console.error('Error deleting patient:', error);
                alert('Error deleting patient. Please try again.');
            }
        }
    };

    const handleViewMedicalHistory = async (patientId) => {
        try {
            const history = await patientService.getPatientMedicalHistory(patientId);
            setMedicalHistory(history);
            setShowMedicalHistory(true);
        } catch (error) {
            console.error('Error fetching medical history:', error);
            alert('Error fetching medical history.');
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
                role: 'PATIENT',
                active: true
            },
            dateOfBirth: '',
            gender: 'Male',
            address: '',
            emergencyContact: '',
            bloodGroup: 'A+',
            allergies: '',
            medicalHistory: ''
        });
        setEditingPatient(null);
    };

    const openAddModal = () => {
        resetForm();
        setShowModal(true);
    };

    const calculateAge = (birthDate) => {
        if (!birthDate) return 'N/A';
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    return (
        <div className="main-layout">
            <Sidebar />
            <div className="content-area">
                <Header title="Patient Management" />
                <div className="page-content">
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">All Patients</h3>
                            <button className="btn btn-primary" onClick={openAddModal}>
                                Add New Patient
                            </button>
                        </div>

                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Patient ID</th>
                                        <th>Name</th>
                                        <th>Age</th>
                                        <th>Gender</th>
                                        <th>Blood Group</th>
                                        <th>Phone</th>
                                        <th>Email</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {patients.map((patient) => (
                                        <tr key={patient.id}>
                                            <td>{patient.patientId}</td>
                                            <td>{patient.user.firstName} {patient.user.lastName}</td>
                                            <td>{calculateAge(patient.dateOfBirth)}</td>
                                            <td>{patient.gender || 'N/A'}</td>
                                            <td>{patient.bloodGroup || 'N/A'}</td>
                                            <td>{patient.user.phoneNumber || 'N/A'}</td>
                                            <td>{patient.user.email}</td>
                                            <td>
                                                <span className={`status-badge ${patient.user.active ? 'status-active' : 'status-inactive'}`}>
                                                    {patient.user.active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    className="btn btn-sm btn-secondary"
                                                    onClick={() => handleEdit(patient)}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-primary"
                                                    onClick={() => handleViewMedicalHistory(patient.id)}
                                                >
                                                    History
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-danger"
                                                    onClick={() => handleDelete(patient.id)}
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

                    {/* Patient Form Modal */}
                    {showModal && (
                        <Modal
                            title={editingPatient ? 'Edit Patient' : 'Add New Patient'}
                            onClose={() => setShowModal(false)}
                        >
                            <form onSubmit={handleSubmit}>
                                <h4>User Information</h4>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Username</label>
                                        <input
                                            type="text"
                                            name="user.username"
                                            value={formData.user.username}
                                            onChange={handleInputChange}
                                            className="form-control"
                                            required
                                            disabled={editingPatient}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Email</label>
                                        <input
                                            type="email"
                                            name="user.email"
                                            value={formData.user.email}
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
                                            name="user.firstName"
                                            value={formData.user.firstName}
                                            onChange={handleInputChange}
                                            className="form-control"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Last Name</label>
                                        <input
                                            type="text"
                                            name="user.lastName"
                                            value={formData.user.lastName}
                                            onChange={handleInputChange}
                                            className="form-control"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Phone Number</label>
                                    <input
                                        type="tel"
                                        name="user.phoneNumber"
                                        value={formData.user.phoneNumber}
                                        onChange={handleInputChange}
                                        className="form-control"
                                    />
                                </div>

                                {!editingPatient && (
                                    <div className="form-group">
                                        <label>Password</label>
                                        <input
                                            type="password"
                                            name="user.password"
                                            value={formData.user.password}
                                            onChange={handleInputChange}
                                            className="form-control"
                                            required
                                        />
                                    </div>
                                )}

                                <h4>Patient Information</h4>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Date of Birth</label>
                                        <input
                                            type="date"
                                            name="dateOfBirth"
                                            value={formData.dateOfBirth}
                                            onChange={handleInputChange}
                                            className="form-control"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Gender</label>
                                        <select
                                            name="gender"
                                            value={formData.gender}
                                            onChange={handleInputChange}
                                            className="form-control"
                                        >
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Address</label>
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        className="form-control"
                                        rows="3"
                                    ></textarea>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Emergency Contact</label>
                                        <input
                                            type="text"
                                            name="emergencyContact"
                                            value={formData.emergencyContact}
                                            onChange={handleInputChange}
                                            className="form-control"
                                            placeholder="Name - Phone Number"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Blood Group</label>
                                        <select
                                            name="bloodGroup"
                                            value={formData.bloodGroup}
                                            onChange={handleInputChange}
                                            className="form-control"
                                        >
                                            {BLOOD_GROUPS.map(group => (
                                                <option key={group} value={group}>{group}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Allergies</label>
                                    <textarea
                                        name="allergies"
                                        value={formData.allergies}
                                        onChange={handleInputChange}
                                        className="form-control"
                                        rows="2"
                                        placeholder="List any known allergies"
                                    ></textarea>
                                </div>

                                <div className="form-group">
                                    <label>Medical History</label>
                                    <textarea
                                        name="medicalHistory"
                                        value={formData.medicalHistory}
                                        onChange={handleInputChange}
                                        className="form-control"
                                        rows="3"
                                        placeholder="Previous medical conditions, surgeries, etc."
                                    ></textarea>
                                </div>

                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        {editingPatient ? 'Update' : 'Create'} Patient
                                    </button>
                                </div>
                            </form>
                        </Modal>
                    )}

                    {/* Medical History Modal */}
                    {showMedicalHistory && (
                        <Modal
                            title="Medical History"
                            onClose={() => setShowMedicalHistory(false)}
                        >
                            <div className="medical-history-list">
                                {medicalHistory.length > 0 ? (
                                    medicalHistory.map((record) => (
                                        <div key={record.id} className="medical-record-item">
                                            <div className="record-header">
                                                <div className="record-date">{formatDateOnly(record.visitDate)}</div>
                                                <div className="record-doctor">Dr. {record.doctorName}</div>
                                            </div>
                                            <div className="record-content">
                                                <div className="record-field">
                                                    <strong>Diagnosis:</strong> {record.diagnosis || 'N/A'}
                                                </div>
                                                <div className="record-field">
                                                    <strong>Symptoms:</strong> {record.symptoms || 'N/A'}
                                                </div>
                                                <div className="record-field">
                                                    <strong>Treatment:</strong> {record.treatment || 'N/A'}
                                                </div>
                                                <div className="record-field">
                                                    <strong>Prescription:</strong> {record.prescription || 'N/A'}
                                                </div>
                                                {record.notes && (
                                                    <div className="record-field">
                                                        <strong>Notes:</strong> {record.notes}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="no-data">No medical history found</div>
                                )}
                            </div>
                        </Modal>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PatientManagement;