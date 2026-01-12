import React, { useState, useEffect } from 'react';
import { dashboardService } from '../services/dashboardService';
import { communicationService } from '../services/communicationService';
import { feeService } from '../services/feeService';
import { Link } from 'react-router-dom';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [followups, setFollowups] = useState([]);
  const [feeStats, setFeeStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [dashRes, followupRes, feeRes] = await Promise.all([
        dashboardService.getStats(),
        communicationService.getTodaysFollowups(),
        feeService.getStats()
      ]);
      
      if (dashRes.success) {
        setStats(dashRes.data);
      }
      if (followupRes.success) {
        setFollowups(followupRes.data);
      }
      if (feeRes.success) {
        setFeeStats(feeRes.data);
      }
    } catch (err) {
      setError('Failed to load statistics');
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)}L`;
    }
    return `₹${amount.toLocaleString()}`;
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="alert alert-error">{error}</div>;
  }

  return (
    <div>
      <h2 style={{ marginBottom: '30px', color: '#333' }}>Dashboard</h2>

      {stats && (
        <>
          {/* Overview Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{stats.overview.totalEnquiries}</div>
              <div className="stat-label">Total Enquiries</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.overview.totalStudents}</div>
              <div className="stat-label">Total Students</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.overview.recentEnquiries}</div>
              <div className="stat-label">Recent Enquiries</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.overview.recentAdmissions}</div>
              <div className="stat-label">Recent Admissions</div>
            </div>
          </div>

          {/* Enquiry Breakdown */}
          <div className="card">
            <h3 className="card-title">Enquiry Status</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value" style={{ color: '#1976d2' }}>{stats.enquiries.new}</div>
                <div className="stat-label">New</div>
              </div>
              <div className="stat-card">
                <div className="stat-value" style={{ color: '#f57c00' }}>{stats.enquiries.contacted}</div>
                <div className="stat-label">Contacted</div>
              </div>
              <div className="stat-card">
                <div className="stat-value" style={{ color: '#388e3c' }}>{stats.enquiries.admitted}</div>
                <div className="stat-label">Admitted</div>
              </div>
              <div className="stat-card">
                <div className="stat-value" style={{ color: '#d32f2f' }}>{stats.enquiries.rejected}</div>
                <div className="stat-label">Rejected</div>
              </div>
            </div>
          </div>

          {/* Student Breakdown */}
          <div className="card">
            <h3 className="card-title">Student Status</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value" style={{ color: '#388e3c' }}>{stats.students.active}</div>
                <div className="stat-label">Active</div>
              </div>
              <div className="stat-card">
                <div className="stat-value" style={{ color: '#666' }}>{stats.students.inactive}</div>
                <div className="stat-label">Inactive</div>
              </div>
              <div className="stat-card">
                <div className="stat-value" style={{ color: '#1976d2' }}>{stats.students.graduated}</div>
                <div className="stat-label">Graduated</div>
              </div>
              <div className="stat-card">
                <div className="stat-value" style={{ color: '#d32f2f' }}>{stats.students.dropped}</div>
                <div className="stat-label">Dropped</div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Today's Follow-ups */}
      {followups && followups.length > 0 && (
        <div className="card">
          <div className="card-header" style={{ marginBottom: '15px' }}>
            <h3 className="card-title">📅 Today's Follow-ups ({followups.length})</h3>
            <Link to="/communications" className="btn btn-sm btn-primary">
              View All
            </Link>
          </div>
          <div>
            {followups.slice(0, 5).map((item) => (
              <div 
                key={item._id} 
                style={{ 
                  padding: '15px', 
                  borderBottom: '1px solid #f0f0f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                    <strong style={{ fontSize: '16px' }}>
                      {item.enquiryId?.studentName || item.studentId?.fullName}
                    </strong>
                    <span className="badge badge-contacted">{item.communicationType}</span>
                  </div>
                  <div style={{ color: '#666', fontSize: '14px', marginBottom: '5px' }}>
                    {item.subject}
                  </div>
                  {item.enquiryId && (
                    <div style={{ fontSize: '12px', color: '#999' }}>
                      Enquiry: {item.enquiryId.email} | {item.enquiryId.phone}
                    </div>
                  )}
                  {item.studentId && (
                    <div style={{ fontSize: '12px', color: '#999' }}>
                      Student: {item.studentId.studentId} | {item.studentId.email}
                    </div>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', color: '#999', marginBottom: '5px' }}>
                    {new Date(item.followUpDate).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                  <div style={{ fontSize: '11px', color: '#667eea', fontWeight: '600' }}>
                    By: {item.recordedByName}
                  </div>
                </div>
              </div>
            ))}
            {followups.length > 5 && (
              <div style={{ padding: '15px', textAlign: 'center' }}>
                <Link to="/communications" className="btn btn-secondary btn-sm">
                  View All {followups.length} Follow-ups
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Fee Statistics */}
      {feeStats && feeStats.data && (
        <div className="card">
          <div className="card-header" style={{ marginBottom: '15px' }}>
            <h3 className="card-title">💰 Fee Statistics</h3>
            <Link to="/fees" className="btn btn-sm btn-primary">
              View Details
            </Link>
          </div>

          {/* Overall Fee Summary */}
          <div style={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '25px',
            borderRadius: '10px',
            color: 'white',
            marginBottom: '20px'
          }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
              gap: '20px',
              textAlign: 'center'
            }}>
              <div>
                <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>
                  Total Expected
                </div>
                <div style={{ fontSize: '28px', fontWeight: '700' }}>
                  {formatCurrency(feeStats.data.overall.totalExpected)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>
                  Total Collected
                </div>
                <div style={{ fontSize: '28px', fontWeight: '700' }}>
                  {formatCurrency(feeStats.data.overall.totalRevenue)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>
                  Total Pending
                </div>
                <div style={{ fontSize: '28px', fontWeight: '700' }}>
                  {formatCurrency(feeStats.data.overall.totalPending)}
                </div>
              </div>
            </div>
          </div>

          {/* This Month Collection */}
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ fontSize: '16px', color: '#333', marginBottom: '15px' }}>
              📊 This Month Collection
            </h4>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value" style={{ color: '#388e3c' }}>
                  {formatCurrency(feeStats.data.thisMonth.amount)}
                </div>
                <div className="stat-label">Amount Collected</div>
              </div>
              <div className="stat-card">
                <div className="stat-value" style={{ color: '#1976d2' }}>
                  {feeStats.data.thisMonth.count}
                </div>
                <div className="stat-label">Payments Received</div>
              </div>
            </div>
          </div>

          {/* Payment Status Breakdown */}
          {feeStats.data.byStatus && feeStats.data.byStatus.length > 0 && (
            <div>
              <h4 style={{ fontSize: '16px', color: '#333', marginBottom: '15px' }}>
                📈 Payment Status Breakdown
              </h4>
              <div className="stats-grid">
                {feeStats.data.byStatus.map((status) => {
                  const statusColors = {
                    'Paid': '#388e3c',
                    'Partial': '#f57c00',
                    'Pending': '#1976d2',
                    'Overdue': '#d32f2f'
                  };
                  return (
                    <div key={status._id} className="stat-card">
                      <div className="stat-value" style={{ color: statusColors[status._id] || '#666' }}>
                        {status.count}
                      </div>
                      <div className="stat-label">{status._id}</div>
                      {status.amount > 0 && (
                        <div style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>
                          {formatCurrency(status.amount)} pending
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="card">
        <h3 className="card-title">⚡ Quick Actions</h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '15px',
          marginTop: '20px'
        }}>
          <Link 
            to="/enquiries" 
            className="btn btn-primary" 
            style={{ textDecoration: 'none', textAlign: 'center' }}
          >
            + Add Enquiry
          </Link>
          <Link 
            to="/students" 
            className="btn btn-success" 
            style={{ textDecoration: 'none', textAlign: 'center' }}
          >
            + Add Student
          </Link>
          <Link 
            to="/courses" 
            className="btn btn-secondary" 
            style={{ textDecoration: 'none', textAlign: 'center' }}
          >
            📚 Manage Courses
          </Link>
          <Link 
            to="/communications" 
            className="btn btn-secondary" 
            style={{ textDecoration: 'none', textAlign: 'center' }}
          >
            📝 Log Communication
          </Link>
          <Link 
            to="/fees" 
            className="btn btn-secondary" 
            style={{ textDecoration: 'none', textAlign: 'center' }}
          >
            💰 Add Payment
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;