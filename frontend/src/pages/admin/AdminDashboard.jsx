import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { LuKeyRound, LuRefreshCcw, LuShieldCheck, LuUsers } from 'react-icons/lu';
import './admin.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';
const TOKEN_KEY = 'triAdminToken';

function AdminDashboard() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || '');
  const [credentials, setCredentials] = useState({ username: 'admin', password: '' });
  const [activeTab, setActiveTab] = useState('users');
  const [summary, setSummary] = useState(null);
  const [users, setUsers] = useState([]);
  const [otps, setOtps] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  const loadAdminData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [summaryRes, usersRes, otpsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/admin/summary`, { headers }),
        axios.get(`${API_BASE_URL}/api/admin/users`, { headers }),
        axios.get(`${API_BASE_URL}/api/admin/otps`, { headers }),
      ]);
      setSummary(summaryRes.data?.data || null);
      setUsers(usersRes.data?.data || []);
      setOtps(otpsRes.data?.data || []);
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Unable to load admin data';
      setError(message);
      if (err.response?.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        setToken('');
      }
    } finally {
      setLoading(false);
    }
  }, [headers]);

  useEffect(() => {
    if (token) {
      loadAdminData();
    }
  }, [token, loadAdminData]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await axios.post(`${API_BASE_URL}/api/admin/login`, credentials);
      const nextToken = response.data?.data?.token;
      if (!nextToken) throw new Error('Admin token missing');
      localStorage.setItem(TOKEN_KEY, nextToken);
      setToken(nextToken);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Admin login failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken('');
    setUsers([]);
    setOtps([]);
    setSummary(null);
  };

  if (!token) {
    return (
      <main className="admin-page admin-login-page">
        <form className="admin-login-card" onSubmit={handleLogin}>
          <div className="admin-brand-icon"><LuShieldCheck /></div>
          <h1>Admin Login</h1>
          <p>Manage OTP activity and registered consumer users.</p>

          <label>
            Username
            <input
              value={credentials.username}
              onChange={(e) => setCredentials((prev) => ({ ...prev, username: e.target.value }))}
              autoComplete="username"
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials((prev) => ({ ...prev, password: e.target.value }))}
              autoComplete="current-password"
            />
          </label>

          {error && <div className="admin-error">{error}</div>}
          <button className="admin-primary-btn" disabled={loading}>
            <LuKeyRound /> {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <header className="admin-header">
        <div>
          <span className="admin-eyebrow">Trikonekt Console</span>
          <h1>Admin Dashboard</h1>
        </div>
        <div className="admin-header-actions">
          <button className="admin-icon-btn" onClick={loadAdminData} disabled={loading} title="Refresh">
            <LuRefreshCcw />
          </button>
          <button className="admin-secondary-btn" onClick={logout}>Logout</button>
        </div>
      </header>

      {error && <div className="admin-error admin-page-error">{error}</div>}

      <section className="admin-summary-grid">
        <Metric label="Users" value={summary?.totalUsers ?? users.length} icon={<LuUsers />} />
        <Metric label="Verified" value={summary?.verifiedUsers ?? 0} icon={<LuShieldCheck />} />
        <Metric label="OTP Requests" value={summary?.otpRequests ?? otps.length} icon={<LuKeyRound />} />
        <Metric label="Consumed OTPs" value={summary?.consumedOtps ?? 0} icon={<LuShieldCheck />} />
      </section>

      <nav className="admin-tabs">
        <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>
          Users
        </button>
        <button className={activeTab === 'otps' ? 'active' : ''} onClick={() => setActiveTab('otps')}>
          OTP Management
        </button>
      </nav>

      {activeTab === 'users' ? <UsersTable users={users} /> : <OtpTable otps={otps} />}
    </main>
  );
}

function Metric({ label, value, icon }) {
  return (
    <div className="admin-metric">
      <div className="admin-metric-icon">{icon}</div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function UsersTable({ users }) {
  return (
    <section className="admin-panel">
      <div className="admin-panel-head">
        <h2>User Management</h2>
        <span>{users.length} users</span>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Sponsor</th>
              <th>Name</th>
              <th>Mobile</th>
              <th>Pincode</th>
              <th>District</th>
              <th>State</th>
              <th>Email</th>
              <th>Status</th>
              <th>Verified</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>
                  <strong>{user.sponsorName || '-'}</strong>
                  {user.sponsorId && <small className="admin-cell-sub">{user.sponsorId}</small>}
                </td>
                <td>{user.fullName}</td>
                <td>{user.mobile}</td>
                <td>{user.pinCode || '-'}</td>
                <td>{user.district || '-'}</td>
                <td>{user.state || '-'}</td>
                <td>{user.email || '-'}</td>
                <td><span className="admin-pill">{user.status}</span></td>
                <td>{user.mobileVerified ? 'Yes' : 'No'}</td>
              </tr>
            ))}
            {!users.length && <EmptyRow colSpan={9} text="No registered users yet" />}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function OtpTable({ otps }) {
  return (
    <section className="admin-panel">
      <div className="admin-panel-head">
        <h2>OTP Management</h2>
        <span>{otps.length} latest requests</span>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Mobile</th>
              <th>Purpose</th>
              <th>Attempts</th>
              <th>Created</th>
              <th>Expires</th>
              <th>Consumed</th>
              <th>Provider Response</th>
            </tr>
          </thead>
          <tbody>
            {otps.map((otp) => (
              <tr key={otp.id}>
                <td>{otp.id}</td>
                <td>{otp.mobile}</td>
                <td><span className="admin-pill">{otp.purpose}</span></td>
                <td>{otp.attempts}</td>
                <td>{formatDate(otp.createdAt)}</td>
                <td>{formatDate(otp.expiresAt)}</td>
                <td>{otp.consumedAt ? formatDate(otp.consumedAt) : '-'}</td>
                <td className="admin-provider-response">{otp.providerResponse || '-'}</td>
              </tr>
            ))}
            {!otps.length && <EmptyRow colSpan={8} text="No OTP requests yet" />}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function EmptyRow({ colSpan, text }) {
  return (
    <tr>
      <td className="admin-empty" colSpan={colSpan}>{text}</td>
    </tr>
  );
}

function formatDate(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export default AdminDashboard;
