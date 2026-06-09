import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  LuKeyRound,
  LuRefreshCcw,
  LuShieldCheck,
  LuUsers,
  LuUserPlus,
  LuPlus,
  LuX,
  LuLock,
  LuEye,
  LuEyeOff,
  LuCheck
} from 'react-icons/lu';
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
  const [admins, setAdmins] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Modals / forms state
  const [showUserModal, setShowUserModal] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ username: '', password: '' });
  const [newAdminError, setNewAdminError] = useState('');
  const [newAdminSuccess, setNewAdminSuccess] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  const loadAdminData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [summaryRes, usersRes, otpsRes, adminsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/admin/summary`, { headers }),
        axios.get(`${API_BASE_URL}/api/admin/users`, { headers }),
        axios.get(`${API_BASE_URL}/api/admin/otps`, { headers }),
        axios.get(`${API_BASE_URL}/api/admin/admins`, { headers }),
      ]);
      setSummary(summaryRes.data?.data || null);
      setUsers(usersRes.data?.data || []);
      setOtps(otpsRes.data?.data || []);
      setAdmins(adminsRes.data?.data || []);
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

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setAdminLoading(true);
    setNewAdminError('');
    setNewAdminSuccess('');
    try {
      await axios.post(`${API_BASE_URL}/api/admin/admins`, newAdmin, { headers });
      setNewAdminSuccess(`Admin '${newAdmin.username}' created successfully.`);
      setNewAdmin({ username: '', password: '' });
      // Reload admin list
      const adminsRes = await axios.get(`${API_BASE_URL}/api/admin/admins`, { headers });
      setAdmins(adminsRes.data?.data || []);
    } catch (err) {
      setNewAdminError(err.response?.data?.message || err.message || 'Failed to create admin');
    } finally {
      setAdminLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken('');
    setUsers([]);
    setOtps([]);
    setAdmins([]);
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
      {success && <div className="admin-success admin-page-success">{success}</div>}

      <section className="admin-summary-grid">
        <Metric label="Users" value={summary?.totalUsers ?? users.length} icon={<LuUsers />} />
        <Metric label="Verified" value={summary?.verifiedUsers ?? 0} icon={<LuShieldCheck />} />
        <Metric label="Administrators" value={admins.length} icon={<LuLock />} />
        <Metric label="OTP Requests" value={summary?.otpRequests ?? otps.length} icon={<LuKeyRound />} />
      </section>

      <nav className="admin-tabs">
        <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>
          Users
        </button>
        <button className={activeTab === 'admins' ? 'active' : ''} onClick={() => setActiveTab('admins')}>
          Admin Accounts
        </button>
        <button className={activeTab === 'otps' ? 'active' : ''} onClick={() => setActiveTab('otps')}>
          OTP Management
        </button>
      </nav>

      {activeTab === 'users' && (
        <UsersTable users={users} onCreateClick={() => setShowUserModal(true)} />
      )}

      {activeTab === 'admins' && (
        <div className="admin-two-col">
          <AdminsTable admins={admins} />
          <section className="admin-panel admin-create-panel">
            <div className="admin-panel-head">
              <h2>Create Administrator</h2>
            </div>
            <form className="admin-form" onSubmit={handleCreateAdmin}>
              <label>
                Username
                <input
                  required
                  placeholder="e.g. support_admin"
                  value={newAdmin.username}
                  onChange={(e) => setNewAdmin((p) => ({ ...p, username: e.target.value }))}
                />
              </label>

              <label className="admin-password-label">
                Password
                <div className="admin-password-input-wrap">
                  <input
                    required
                    type={showAdminPassword ? 'text' : 'password'}
                    placeholder="Min 6 characters"
                    value={newAdmin.password}
                    onChange={(e) => setNewAdmin((p) => ({ ...p, password: e.target.value }))}
                  />
                  <button
                    type="button"
                    className="admin-password-toggle-btn"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                  >
                    {showAdminPassword ? <LuEyeOff /> : <LuEye />}
                  </button>
                </div>
              </label>

              {newAdminError && <div className="admin-error">{newAdminError}</div>}
              {newAdminSuccess && <div className="admin-success">{newAdminSuccess}</div>}

              <button className="admin-primary-btn" disabled={adminLoading}>
                <LuPlus /> {adminLoading ? 'Creating...' : 'Create Admin'}
              </button>
            </form>
          </section>
        </div>
      )}

      {activeTab === 'otps' && <OtpTable otps={otps} />}

      {/* User Creation Modal */}
      <CreateUserModal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        headers={headers}
        onSuccess={(msg) => {
          setSuccess(msg);
          loadAdminData();
          setTimeout(() => setSuccess(''), 5000);
        }}
      />
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

function UsersTable({ users, onCreateClick }) {
  return (
    <section className="admin-panel">
      <div className="admin-panel-head admin-split-head">
        <div>
          <h2>User Management</h2>
          <span>{users.length} users</span>
        </div>
        <button className="admin-primary-btn" onClick={onCreateClick}>
          <LuUserPlus /> Create User
        </button>
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
            {!users.length && <EmptyRow colSpan={10} text="No registered users yet" />}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function AdminsTable({ admins }) {
  return (
    <section className="admin-panel admin-list-panel">
      <div className="admin-panel-head">
        <h2>Administrator Accounts</h2>
        <span>{admins.length} active admins</span>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((username) => (
              <tr key={username}>
                <td><strong>{username}</strong></td>
                <td><span className="admin-pill">ACTIVE</span></td>
              </tr>
            ))}
            {!admins.length && <EmptyRow colSpan={2} text="No administrators found" />}
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

function CreateUserModal({ isOpen, onClose, headers, onSuccess }) {
  const [formData, setFormData] = useState({
    sponsorId: '',
    sponsorName: '',
    fullName: '',
    countryCode: '+91',
    mobile: '',
    email: '',
    pinCode: '',
    district: '',
    state: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pinLoading, setPinLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Autocomplete sponsor name mapping
  const sponsorLookup = {
    TRI001: 'Trikonekt Partner',
    VIP100: 'Luxe Sponsor',
    GROW20: 'Growth Circle',
  };

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        sponsorId: '',
        sponsorName: '',
        fullName: '',
        countryCode: '+91',
        mobile: '',
        email: '',
        pinCode: '',
        district: '',
        state: '',
        password: '',
      });
      setError('');
    }
  }, [isOpen]);

  useEffect(() => {
    const sId = formData.sponsorId.trim().toUpperCase();
    if (sponsorLookup[sId]) {
      setFormData((prev) => ({ ...prev, sponsorName: sponsorLookup[sId] }));
    } else if (sId.length > 0) {
      setFormData((prev) => ({ ...prev, sponsorName: 'Custom Sponsor' }));
    } else {
      setFormData((prev) => ({ ...prev, sponsorName: '' }));
    }
  }, [formData.sponsorId]);

  useEffect(() => {
    const pin = formData.pinCode.trim();
    if (pin.length !== 6) return;

    const fetchLocation = async () => {
      setPinLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/api/location/pincode/${pin}`);
        const location = response.data?.data;
        if (response.data?.success && location) {
          setFormData((prev) => ({
            ...prev,
            district: location.district || '',
            state: location.state || '',
          }));
        }
      } catch (err) {
        // Silently ignore or logs
      } finally {
        setPinLoading(false);
      }
    };

    const timer = setTimeout(fetchLocation, 600);
    return () => clearTimeout(timer);
  }, [formData.pinCode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Field normalization & validation
    if (formData.mobile.length !== 10) {
      setError('Mobile number must be exactly 10 digits.');
      setLoading(false);
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/api/admin/users`, formData, { headers });
      onSuccess(`User '${formData.fullName}' created successfully.`);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="admin-modal-backdrop">
      <div className="admin-modal-card">
        <header className="admin-modal-header">
          <h2>Create Customer Account</h2>
          <button className="admin-modal-close" onClick={onClose}>
            <LuX />
          </button>
        </header>
        <form className="admin-modal-form" onSubmit={handleSubmit}>
          <div className="admin-form-row">
            <label>
              Sponsor ID
              <input
                placeholder="e.g. TRI001"
                value={formData.sponsorId}
                onChange={(e) => setFormData((p) => ({ ...p, sponsorId: e.target.value }))}
              />
            </label>
            <label>
              Sponsor Name
              <input
                readOnly
                placeholder="Auto-filled sponsor"
                value={formData.sponsorName}
              />
            </label>
          </div>

          <div className="admin-form-row">
            <label className="span-2">
              Full Name
              <input
                required
                placeholder="Enter client's full name"
                value={formData.fullName}
                onChange={(e) => setFormData((p) => ({ ...p, fullName: e.target.value }))}
              />
            </label>
          </div>

          <div className="admin-form-row">
            <label className="country-code-col">
              Code
              <input
                required
                value={formData.countryCode}
                onChange={(e) => setFormData((p) => ({ ...p, countryCode: e.target.value }))}
              />
            </label>
            <label className="mobile-col">
              Mobile Number
              <input
                required
                type="tel"
                placeholder="10-digit number"
                value={formData.mobile}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, mobile: e.target.value.replace(/[^0-9]/g, '').slice(0, 10) }))
                }
              />
            </label>
          </div>

          <div className="admin-form-row">
            <label className="span-2">
              Email Address
              <input
                type="email"
                placeholder="client@example.com (optional)"
                value={formData.email}
                onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
              />
            </label>
          </div>

          <div className="admin-form-row">
            <label>
              Pincode {pinLoading && <span className="admin-sub-loader">Lookup...</span>}
              <input
                required
                placeholder="6-digit pincode"
                value={formData.pinCode}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, pinCode: e.target.value.replace(/[^0-9]/g, '').slice(0, 6) }))
                }
              />
            </label>
            <label>
              District
              <input
                required
                placeholder="District name"
                value={formData.district}
                onChange={(e) => setFormData((p) => ({ ...p, district: e.target.value }))}
              />
            </label>
          </div>

          <div className="admin-form-row">
            <label className="span-2">
              State
              <input
                required
                placeholder="State name"
                value={formData.state}
                onChange={(e) => setFormData((p) => ({ ...p, state: e.target.value }))}
              />
            </label>
          </div>

          <div className="admin-form-row">
            <label className="span-2 admin-password-label">
              Account Password
              <div className="admin-password-input-wrap">
                <input
                  required
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min 6 characters"
                  value={formData.password}
                  onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
                />
                <button
                  type="button"
                  className="admin-password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <LuEyeOff /> : <LuEye />}
                </button>
              </div>
            </label>
          </div>

          {error && <div className="admin-error">{error}</div>}

          <footer className="admin-modal-footer">
            <button type="button" className="admin-secondary-btn" onClick={onClose}>
              Cancel
            </button>
            <button className="admin-primary-btn" disabled={loading}>
              {loading ? 'Creating...' : 'Provision User'}
            </button>
          </footer>
        </form>
      </div>
    </div>
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
