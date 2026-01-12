import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';

function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const admin = authService.getCurrentAdmin();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <div>
      {/* Header */}
      <div className="header">
        <div className="header-content">
          <h1>🎓 College CRM</h1>
          <div className="header-user">
            <span>Welcome, {admin?.fullName || 'Admin'}</span>
            <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="nav">
        <div className="nav-content">
  <Link to="/dashboard" className={isActive('/dashboard')}>
    Dashboard
  </Link>
  <Link to="/enquiries" className={isActive('/enquiries')}>
    Enquiries
  </Link>
  <Link to="/students" className={isActive('/students')}>
    Students
  </Link>
  <Link to="/courses" className={isActive('/courses')}>
    Courses
  </Link>
  <Link to="/communications" className={isActive('/communications')}>
    Communications
  </Link>
  <Link to="/fees" className={isActive('/fees')}>
    Fees
  </Link>
</div>
      </div>

      {/* Main Content */}
      <div className="container">{children}</div>
    </div>
  );
}

export default Layout;