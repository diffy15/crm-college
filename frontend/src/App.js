import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Enquiries from './pages/Enquiries';
import Students from './pages/Students';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import { authService } from './services/authService';
import Communications from './pages/Communications';
import Courses from './pages/Courses';
import Fees from './pages/Fees';

function App() {
  const isAuthenticated = authService.isAuthenticated();

  return (
    <BrowserRouter>
      <Routes>
        {/* Login Route */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/enquiries"
          element={
            <PrivateRoute>
              <Layout>
                <Enquiries />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/students"
          element={
            <PrivateRoute>
              <Layout>
                <Students />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/communications"
          element={
            <PrivateRoute>
              <Layout>
                <Communications />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/courses"
          element={
            <PrivateRoute>
              <Layout>
                <Courses />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/fees"
          element={
            <PrivateRoute>
              <Layout>
                <Fees />
              </Layout>
            </PrivateRoute>
          }
        />

        {/* Default Redirect */}
        <Route
          path="/"
          element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />}
        />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;