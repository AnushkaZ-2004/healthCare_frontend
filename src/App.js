import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './components/auth/Login';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminDashboard from './components/admin/Dashboard';
import DoctorDashboard from './components/doctor/DoctorDashboard';
import PatientDashboard from './components/patient/PatientDashboard';
import UserManagement from './components/admin/UserManagement';
import PatientManagement from './components/admin/PatientManagement';
import DoctorManagement from './components/admin/DoctorManagement';
import AppointmentManagement from './components/admin/AppointmentManagement';
import MyAppointments from './components/doctor/MyAppointments';
import PatientRecords from './components/doctor/PatientRecords';
import BookAppointment from './components/patient/BookAppointment';
import MyMedicalHistory from './components/patient/MyMedicalHistory';
import './styles/global.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <UserManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin/patients" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <PatientManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin/doctors" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <DoctorManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin/appointments" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AppointmentManagement />
              </ProtectedRoute>
            } />

            {/* Doctor Routes */}
            <Route path="/doctor/dashboard" element={
              <ProtectedRoute allowedRoles={['DOCTOR', 'ADMIN']}>
                <DoctorDashboard />
              </ProtectedRoute>
            } />
            <Route path="/doctor/appointments" element={
              <ProtectedRoute allowedRoles={['DOCTOR', 'ADMIN']}>
                <MyAppointments />
              </ProtectedRoute>
            } />
            <Route path="/doctor/patients" element={
              <ProtectedRoute allowedRoles={['DOCTOR', 'ADMIN']}>
                <PatientRecords />
              </ProtectedRoute>
            } />

            {/* Patient Routes */}
            <Route path="/patient/dashboard" element={
              <ProtectedRoute allowedRoles={['PATIENT', 'ADMIN']}>
                <PatientDashboard />
              </ProtectedRoute>
            } />
            <Route path="/patient/book-appointment" element={
              <ProtectedRoute allowedRoles={['PATIENT', 'ADMIN']}>
                <BookAppointment />
              </ProtectedRoute>
            } />
            <Route path="/patient/medical-history" element={
              <ProtectedRoute allowedRoles={['PATIENT', 'ADMIN']}>
                <MyMedicalHistory />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;