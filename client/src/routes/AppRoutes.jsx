import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import MainLayout from '../layouts/MainLayout';
import ProtectedRoute from '../components/common/ProtectedRoute';
import RoleRoute from '../components/common/RoleRoute';
import api from '../services/api';
import { loginSuccess, logout } from '../redux/slices/authSlice';

// Pages
import Landing from '../pages/Landing';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import Jobs from '../pages/Jobs';
import StudentDashboard from '../pages/StudentDashboard';
import Resume from '../pages/Resume';
import Applications from '../pages/Applications';
import RecruiterDashboard from '../pages/RecruiterDashboard';
import AdminDashboard from '../pages/AdminDashboard';

const AppRoutes = () => {
  const dispatch = useDispatch();
  const [checkingAuth, setCheckingAuth] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await api.get('/auth/me');
          if (response.data && response.data.success) {
            dispatch(loginSuccess({ user: response.data.user, token }));
          } else {
            dispatch(logout());
          }
        } catch (error) {
          console.error('Auth initialization failed:', error);
          dispatch(logout());
        }
      }
      setCheckingAuth(false);
    };

    initAuth();
  }, [dispatch]);

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/jobs" element={<Jobs />} />

        {/* Protected Routes (Any Authenticated User) */}
        <Route element={<ProtectedRoute />}>
          {/* Add generic authenticated routes here */}
        </Route>

        {/* Role: Student Routes */}
        <Route element={<RoleRoute allowedRoles={['student']} />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/resume" element={<Resume />} />
          <Route path="/student/applications" element={<Applications />} />
        </Route>

        {/* Role: Recruiter Routes */}
        <Route element={<RoleRoute allowedRoles={['recruiter']} />}>
          <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
        </Route>

        {/* Role: Admin Routes */}
        <Route element={<RoleRoute allowedRoles={['admin']} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;

