import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { formatErrorMessage } from '../../utils/errorFormatter';
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
  LuCheck,
  LuChevronDown,
  LuChevronRight,
  LuSearch,
  LuMail,
  LuBell,
  LuGift,
  LuMenu,
  LuCalendar,
  LuMapPin,
  LuMap,
  LuTrash2,
  LuPencil,
  LuLogOut
} from 'react-icons/lu';
import './admin.css';

// Mock positions and departments for visual alignment with user's mockup
const MOCK_POSITIONS = [
  'Graphics Designer',
  'Joomla Developer',
  'Human Resource',
  'PHP Developer',
  'Graphics Designer',
  'UI UX Designer',
  'Ux Architect',
  'Python Developer',
  'Freshers',
  'Product Manager'
];

const MOCK_DEPARTMENTS = [
  'Sales Team',
  'Finances',
  'Management',
  'Engineering',
  'Sales',
  'Human Resources',
  'Customer Success',
  'Marketing',
  'Product',
  'Operations'
];

const AVATAR_COLORS = [
  '#f43f5e', // rose
  '#ec4899', // pink
  '#d946ef', // fuchsia
  '#8b5cf6', // violet
  '#6366f1', // indigo
  '#3b82f6', // blue
  '#0ea5e9', // sky
  '#14b8a6', // teal
  '#10b981', // emerald
  '#f59e0b', // amber
];

function getInitials(name) {
  if (!name) return 'U';
  return name.trim().split(/\s+/).map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

function getAvatarColor(userId) {
  const code = (userId || '').toString().split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return AVATAR_COLORS[code % AVATAR_COLORS.length];
}

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';
const TOKEN_KEY = 'triAdminToken';

function AdminDashboard() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || '');
  const [credentials, setCredentials] = useState({ username: 'admin', password: '' });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const selectTab = (tab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };
  const [editingUser, setEditingUser] = useState(null);
  const [selectedKycUser, setSelectedKycUser] = useState(null);
  const [summary, setSummary] = useState(null);
  const [users, setUsers] = useState([]);
  const [otps, setOtps] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [webhooks, setWebhooks] = useState([]);
  const [hubbleTransactions, setHubbleTransactions] = useState([]);
  const [hubbleConfig, setHubbleConfig] = useState(null);
  const [selectedWebhook, setSelectedWebhook] = useState(null);
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
      const [summaryRes, usersRes, otpsRes, adminsRes, webhooksRes, hubbleTxRes, hubbleConfigRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/admin/summary`, { headers }),
        axios.get(`${API_BASE_URL}/api/admin/users`, { headers }),
        axios.get(`${API_BASE_URL}/api/admin/otps`, { headers }),
        axios.get(`${API_BASE_URL}/api/admin/admins`, { headers }),
        axios.get(`${API_BASE_URL}/api/admin/hubble/webhooks`, { headers }),
        axios.get(`${API_BASE_URL}/api/admin/hubble/transactions`, { headers }),
        axios.get(`${API_BASE_URL}/api/admin/hubble/config`, { headers }),
      ]);
      setSummary(summaryRes.data?.data || null);
      setUsers(usersRes.data?.data || []);
      setOtps(otpsRes.data?.data || []);
      setAdmins(adminsRes.data?.data || []);
      setWebhooks(webhooksRes.data?.data || []);
      setHubbleTransactions(hubbleTxRes.data?.data || []);
      setHubbleConfig(hubbleConfigRes.data?.data || null);
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
      setError(formatErrorMessage(err));
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
      setNewAdminError(formatErrorMessage(err));
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
    setWebhooks([]);
    setHubbleTransactions([]);
    setHubbleConfig(null);
    setSelectedWebhook(null);
    setSummary(null);
  };

  const handleToggleBlock = async (user) => {
    const isBlocked = user.status === 'INACTIVE';
    const confirmMsg = isBlocked 
      ? `Are you sure you want to UNBLOCK user ${user.fullName} and restore access to the apps?`
      : `Are you sure you want to BLOCK user ${user.fullName} and restrict access to the apps?`;
      
    if (!window.confirm(confirmMsg)) return;
    
    setLoading(true);
    try {
      const nextStatus = isBlocked ? 'ACTIVE' : 'INACTIVE';
      await axios.put(`${API_BASE_URL}/api/admin/users/${user.id}`, {
        email: user.email,
        mobile: user.mobile,
        pinCode: user.pinCode,
        district: user.district,
        state: user.state,
        status: nextStatus,
        fullName: user.fullName
      }, { headers });
      setSuccess(`User ${user.fullName} has been ${isBlocked ? 'unblocked' : 'blocked'} successfully.`);
      loadAdminData();
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(formatErrorMessage(err));
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAccountActive = async (user) => {
    const nextActive = !user.accountActive;
    const confirmMsg = nextActive 
      ? `Are you sure you want to ACTIVATE user account ${user.fullName} for MLM & rewards?`
      : `Are you sure you want to DEACTIVATE user account ${user.fullName}?`;
      
    if (!window.confirm(confirmMsg)) return;

    setLoading(true);
    try {
      await axios.put(`${API_BASE_URL}/api/admin/users/${user.id}`, {
        email: user.email,
        mobile: user.mobile,
        pinCode: user.pinCode,
        district: user.district,
        state: user.state,
        status: user.status,
        fullName: user.fullName,
        address: user.address,
        accountActive: nextActive,
        kycStatus: user.kycStatus
      }, { headers });
      setSuccess(`User account status updated successfully.`);
      loadAdminData();
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(formatErrorMessage(err));
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const tabTitle = useMemo(() => {
    switch (activeTab) {
      case 'users':
        return 'Team List';
      case 'admins':
        return 'Admin Accounts';
      case 'otps':
        return 'OTP Management';
      case 'webhooks':
        return 'Webhook Logs';
      case 'hubble':
        return 'Hubble Panel';
      default:
        return 'Admin Dashboard';
    }
  }, [activeTab]);

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
    <div className="admin-layout">
      {/* Sidebar Overlay for mobile drawer */}
      {mobileMenuOpen && (
        <div 
          className="admin-sidebar-overlay md:hidden" 
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Left Sidebar Layout */}
      <aside className={`admin-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-logo">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="admin-sidebar-logo-icon">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span className="admin-sidebar-logo-text">Trikonekt</span>
          </div>
          <button 
            type="button"
            className="admin-sidebar-close-btn md:hidden"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              fontSize: '18px',
              padding: '4px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <LuX />
          </button>
        </div>
        
        <nav className="admin-sidebar-menu">
          <button 
            type="button"
            className={`admin-sidebar-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => selectTab('dashboard')}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span>Home</span>
          </button>
          <button 
            type="button"
            className={`admin-sidebar-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => selectTab('users')}
          >
            <LuUsers size={18} />
            <span>User</span>
          </button>
          <button 
            type="button"
            className={`admin-sidebar-item ${activeTab === 'hubble' ? 'active' : ''}`}
            onClick={() => selectTab('hubble')}
          >
            <LuGift size={18} />
            <span>Gift Card</span>
          </button>
          <button 
            type="button"
            className={`admin-sidebar-item ${activeTab === 'otps' ? 'active' : ''}`}
            onClick={() => selectTab('otps')}
          >
            <LuShieldCheck size={18} />
            <span>OTP</span>
          </button>
        </nav>
        
        <div className="admin-sidebar-footer">
          <button type="button" className="admin-sidebar-logout-btn" onClick={logout}>
            <LuLogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content pane */}
      <div className="admin-main-content">
        <div className="admin-main-content-inner">
          
          {/* Breadcrumbs Header */}
          <div className="admin-breadcrumb-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button 
                type="button"
                className="admin-hamburger-btn md:hidden" 
                onClick={() => setMobileMenuOpen(true)}
                title="Open Sidebar"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#475569',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '20px'
                }}
              >
                <LuMenu />
              </button>
              <div>
                <div className="admin-breadcrumbs">
                  <span className="clickable" onClick={() => selectTab('users')}>Admin Dashboard</span>
                  <span>&gt;</span>
                  <span className="active">{tabTitle}</span>
                </div>
                <h1 className="admin-main-title">{tabTitle}</h1>
              </div>
            </div>
            
            <div className="admin-header-icons">
              <button className="admin-header-icon-btn" onClick={loadAdminData} disabled={loading} title="Refresh">
                <LuRefreshCcw />
              </button>
              
              <div className="admin-header-icon-btn" title="Notifications">
                <LuBell size={18} />
                <span className="admin-header-badge">3</span>
              </div>
              
              <div className="admin-header-icon-btn" title="Messages">
                <LuMail size={18} />
              </div>
              
              <img 
                src="https://flagcdn.com/w40/us.png" 
                alt="US Flag" 
                className="admin-header-flag"
                title="English (US)"
              />
            </div>
          </div>

          {error && <div className="admin-error admin-page-error">{error}</div>}
          {success && <div className="admin-success admin-page-success">{success}</div>}

          {/* Metric Overview section */}
          <section className="admin-summary-grid" style={{ marginBottom: '24px' }}>
            <Metric label="Users" value={summary?.totalUsers ?? users.length} icon={<LuUsers />} />
            <Metric label="Verified" value={summary?.verifiedUsers ?? 0} icon={<LuShieldCheck />} />
            <Metric label="Administrators" value={admins.length} icon={<LuLock />} />
            <Metric label="OTP Requests" value={summary?.otpRequests ?? otps.length} icon={<LuKeyRound />} />
          </section>

          {/* Active view component */}
          {activeTab === 'users' && (
            <UsersTable 
              users={users} 
              onCreateClick={() => setShowUserModal(true)} 
              onEditClick={(user) => setEditingUser(user)}
              onToggleBlock={handleToggleBlock}
              onViewKyc={(user) => setSelectedKycUser(user)}
              onToggleAccountActive={handleToggleAccountActive}
              isMobile={isMobile}
            />
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
                      onChange={(e) => setNewAdmin((prev) => ({ ...prev, username: e.target.value }))}
                    />
                  </label>

                  <label className="admin-password-label">
                    Password
                    <div className="admin-password-input-wrap">
                      <input
                        required
                        type={showAdminPassword ? 'text' : 'password'}
                        placeholder="Password"
                        value={newAdmin.password}
                        onChange={(e) => setNewAdmin((prev) => ({ ...prev, password: e.target.value }))}
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

                  <button className="admin-blue-btn" disabled={adminLoading}>
                    {adminLoading ? 'Creating...' : 'Create Admin'}
                  </button>
                </form>
              </section>
            </div>
          )}

          {activeTab === 'otps' && <OtpTable otps={otps} isMobile={isMobile} />}

          {activeTab === 'webhooks' && (
            <WebhooksTable webhooks={webhooks} onViewPayload={(w) => setSelectedWebhook(w)} />
          )}

          {activeTab === 'hubble' && (
            <HubblePanel transactions={hubbleTransactions} config={hubbleConfig} />
          )}
        </div>
      </div>
      
      {selectedWebhook && (
        <WebhookPayloadModal webhook={selectedWebhook} onClose={() => setSelectedWebhook(null)} />
      )}

      {/* User Provisioning Modal */}
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

       {/* User Editing Modal */}
      {editingUser && (
        <EditUserModal
          isOpen={true}
          user={editingUser}
          onClose={() => setEditingUser(null)}
          headers={headers}
          onSuccess={(msg) => {
            setSuccess(msg);
            loadAdminData();
            setTimeout(() => setSuccess(''), 5000);
          }}
        />
      )}

      {/* KYC Verification Details Modal */}
      {selectedKycUser && (
        <KycDetailsModal
          isOpen={true}
          user={selectedKycUser}
          onClose={() => setSelectedKycUser(null)}
          headers={headers}
          onSuccess={(msg) => {
            setSuccess(msg);
            loadAdminData();
            setTimeout(() => setSuccess(''), 5000);
          }}
        />
      )}

      {/* Fixed Bottom Navigation Bar for Mobile */}
      <nav className="admin-bottom-nav md:hidden">
        <button 
          type="button"
          className={`admin-bottom-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => selectTab('dashboard')}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span>Home</span>
        </button>

        <button 
          type="button"
          className={`admin-bottom-nav-item ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => selectTab('users')}
        >
          <LuUsers size={20} />
          <span>User</span>
        </button>

        <button 
          type="button"
          className={`admin-bottom-nav-item ${activeTab === 'hubble' ? 'active' : ''}`}
          onClick={() => selectTab('hubble')}
        >
          <LuGift size={20} />
          <span>Gift Card</span>
        </button>

        <button 
          type="button"
          className={`admin-bottom-nav-item ${activeTab === 'otps' ? 'active' : ''}`}
          onClick={() => selectTab('otps')}
        >
          <LuShieldCheck size={20} />
          <span>OTP</span>
        </button>
      </nav>
    </div>
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

function UsersTable({ users, onCreateClick, onEditClick, onToggleBlock, onViewKyc, onToggleAccountActive, isMobile }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [expandedUserId, setExpandedUserId] = useState(null);
  const [selectedUserIds, setSelectedUserIds] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // Filter users based on search term and status
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch = 
        (user.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.mobile || '').includes(searchTerm) ||
        (user.sponsorId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.sponsorName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.id || '').toString().includes(searchTerm);
      
      const matchesStatus = 
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && user.status === 'ACTIVE') ||
        (statusFilter === 'INACTIVE' && user.status === 'INACTIVE');

      return matchesSearch && matchesStatus;
    });
  }, [users, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage]);

  const toggleExpand = (userId) => {
    setExpandedUserId(expandedUserId === userId ? null : userId);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const next = new Set(selectedUserIds);
      paginatedUsers.forEach(u => next.add(u.id));
      setSelectedUserIds(next);
    } else {
      const next = new Set(selectedUserIds);
      paginatedUsers.forEach(u => next.delete(u.id));
      setSelectedUserIds(next);
    }
  };

  const handleSelectRow = (userId) => {
    const next = new Set(selectedUserIds);
    if (next.has(userId)) {
      next.delete(userId);
    } else {
      next.add(userId);
    }
    setSelectedUserIds(next);
  };

  const isAllSelected = paginatedUsers.length > 0 && paginatedUsers.every(u => selectedUserIds.has(u.id));

  return (
    <div>
      {/* Search & Actions Bar */}
      <div className={`admin-search-filter-bar ${isMobile ? 'mobile-search-bar' : ''}`}>
        <div className="admin-search-input-wrapper" style={isMobile ? { width: '100%', marginBottom: '12px' } : {}}>
          <span className="admin-search-icon"><LuSearch /></span>
          <input
            placeholder="Search User (Name, ID, Phone, Sponsor...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className={isMobile ? 'mobile-filter-actions' : ''} style={!isMobile ? { display: 'flex', alignItems: 'center', gap: '16px' } : {}}>
          {selectedUserIds.size > 0 && (
            <div className="admin-selection-pill">
              <input
                type="checkbox"
                checked={true}
                readOnly
                className="admin-selection-checkbox"
                onClick={() => setSelectedUserIds(new Set())}
              />
              <span>{selectedUserIds.size} Selected</span>
            </div>
          )}

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              fontWeight: 700,
              fontSize: '13px',
              color: '#475569',
              background: '#ffffff',
              outline: 'none',
              cursor: 'pointer',
              flex: isMobile ? 1 : 'unset'
            }}
          >
            <option value="ALL">All Login Status</option>
            <option value="ACTIVE">Unblocked</option>
            <option value="INACTIVE">Blocked</option>
          </select>

          <button className="admin-blue-btn" onClick={onCreateClick} style={isMobile ? { whiteSpace: 'nowrap' } : {}}>
            <LuPlus /> ADD USER
          </button>
        </div>
      </div>

      {/* Table wrapping */}
      {!isMobile ? (
        <div className="admin-card-table-wrap">
          <table className="admin-modern-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    className="admin-selection-checkbox"
                  />
                </th>
                <th>Name</th>
                <th>Sponsor ID & Name</th>
                <th>Address & Pincode</th>
                <th>KYC Status</th>
                <th>Active/Inactive</th>
                <th>Block/Unblock</th>
                <th>Edit</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((user) => {
                const isSelected = selectedUserIds.has(user.id);
                const isExpanded = expandedUserId === user.id;
                const initials = getInitials(user.fullName);
                const avatarColor = getAvatarColor(user.id);

                return (
                  <React.Fragment key={user.id}>
                    <tr className={`${isSelected ? 'row-selected' : ''} ${isExpanded ? 'row-expanded-parent' : ''}`}>
                      <td data-label="Select">
                        <div className="admin-cell-checkbox-chevron">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectRow(user.id)}
                            className="admin-selection-checkbox"
                          />
                          <button 
                            type="button"
                            className="admin-chevron-btn"
                            onClick={() => toggleExpand(user.id)}
                            title="Toggle details"
                          >
                            {isExpanded ? <LuChevronDown size={14} /> : <LuChevronRight size={14} />}
                          </button>
                        </div>
                      </td>
                      <td data-label="Name">
                        <div className="admin-cell-name-avatar">
                          <div 
                            className="admin-user-avatar" 
                            style={{ backgroundColor: avatarColor }}
                          >
                            {initials}
                          </div>
                          <div className="admin-cell-name-info">
                            <strong>{user.fullName}</strong>
                            <span style={{ fontSize: '11px', color: '#64748b' }}>
                              ID: {user.id} | {user.email || 'No email'} | {user.mobile}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td data-label="Sponsor ID & Name">
                        <div>
                          <strong>{user.sponsorId || '-'}</strong>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>{user.sponsorName || 'Direct'}</div>
                        </div>
                      </td>
                      <td data-label="Address & Pincode">
                        <div>
                          <div style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={user.address}>
                            {user.address || '-'}
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>
                            {user.pinCode || '-'}, {user.district || '-'}, {user.state || '-'}
                          </div>
                        </div>
                      </td>
                      <td data-label="KYC Status">
                        <span 
                          className={`admin-kyc-badge kyc-${(user.kycStatus || 'UNSUBMITTED').toLowerCase()}`}
                          onClick={() => onViewKyc(user)}
                          style={{ cursor: 'pointer' }}
                          title="Click to manage KYC"
                        >
                          {user.kycStatus || 'UNSUBMITTED'}
                        </span>
                      </td>
                      <td data-label="Active/Inactive">
                        <button
                          type="button"
                          className={`admin-active-toggle-btn ${user.accountActive ? 'active' : 'inactive'}`}
                          onClick={() => onToggleAccountActive(user)}
                          title={user.accountActive ? 'Click to set inactive' : 'Click to set active'}
                        >
                          {user.accountActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td data-label="Block/Unblock">
                        <button
                          type="button"
                          className={`admin-block-toggle-btn ${user.status === 'ACTIVE' ? 'unblocked' : 'blocked'}`}
                          onClick={() => onToggleBlock(user)}
                          title={user.status === 'ACTIVE' ? 'Click to block user' : 'Click to unblock user'}
                        >
                          {user.status === 'ACTIVE' ? 'Unblocked' : 'Blocked'}
                        </button>
                      </td>
                      <td data-label="Edit">
                        <div className="admin-action-buttons">
                          <button 
                            type="button" 
                            className="admin-action-btn" 
                            title="Edit user details"
                            onClick={() => onEditClick(user)}
                          >
                            <LuPencil size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr className="admin-row-expanded-details-row">
                        <td colSpan={8}>
                          <div className="admin-row-expanded-details-container">
                            <div className="admin-expanded-grid">
                              <div className="admin-expanded-col">
                                <span className="admin-expanded-label">Sponsor Details</span>
                                <div className="admin-expanded-value">
                                  <LuUsers />
                                  <span>{user.sponsorName || 'Direct'} ({user.sponsorId || 'None'})</span>
                                </div>
                              </div>
                              
                              <div className="admin-expanded-col">
                                <span className="admin-expanded-label">Identity / KYC Info</span>
                                <div className="admin-expanded-value">
                                  <LuShieldCheck />
                                  <div>
                                    <div>KYC: <strong>{user.kycStatus || 'UNSUBMITTED'}</strong></div>
                                    {user.bankAccountNumber && (
                                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                                        {user.bankName} - Account: {user.bankAccountNumber}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="admin-expanded-col">
                                <span className="admin-expanded-label">Mobile Verified</span>
                                <div className="admin-expanded-value">
                                  <LuShieldCheck />
                                  <span>{user.mobileVerified ? 'Verified' : 'Unverified'}</span>
                                </div>
                              </div>

                              <div className="admin-expanded-col">
                                <span className="admin-expanded-label">MLM Eligibility</span>
                                <div className="admin-expanded-value">
                                  <LuShieldCheck />
                                  <span>{user.accountActive ? 'Eligible (Active)' : 'Ineligible (Inactive)'}</span>
                                </div>
                              </div>

                              <div className="admin-expanded-col" style={{ gridColumn: 'span 2' }}>
                                <span className="admin-expanded-label">Full Address & Location</span>
                                <div className="admin-expanded-value">
                                  <LuMapPin />
                                  <span>
                                    {user.address ? `${user.address}, ` : ''} 
                                    {user.district || ''}, {user.state || ''} {user.pinCode ? `- ${user.pinCode}` : ''}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              {!paginatedUsers.length && <EmptyRow colSpan={8} text="No registered users found matching the filter" />}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="admin-mobile-user-cards-container">
          {paginatedUsers.map((user) => {
            const isExpanded = expandedUserId === user.id;
            const initials = getInitials(user.fullName);
            const avatarColor = getAvatarColor(user.id);
            return (
              <div key={user.id} className="mobile-user-card">
                <div className="mobile-user-card-header">
                  <div className="admin-user-avatar" style={{ backgroundColor: avatarColor }}>{initials}</div>
                  <div className="mobile-user-card-title">
                    <strong>{user.fullName}</strong>
                    <span>ID: {user.id}</span>
                  </div>
                </div>
                <div className="mobile-user-card-contact">
                  <div><LuMail size={14} /> {user.email || "No email"}</div>
                  <div><LuMapPin size={14} /> {user.mobile}</div>
                </div>
                <div className="mobile-user-card-status">
                  <span className={`admin-kyc-badge kyc-${(user.kycStatus || "UNSUBMITTED").toLowerCase()}`}>
                    KYC: {user.kycStatus || "UNSUBMITTED"}
                  </span>
                  <span className={`admin-active-toggle-btn ${user.accountActive ? "active" : "inactive"}`}>
                    Account: {user.accountActive ? "Active" : "Inactive"}
                  </span>
                  <span className={`admin-block-toggle-btn ${user.status === "ACTIVE" ? "unblocked" : "blocked"}`}>
                    Login: {user.status === "ACTIVE" ? "Unblocked" : "Blocked"}
                  </span>
                </div>
                <div className="mobile-user-card-actions">
                  <button className="admin-action-btn" onClick={() => onEditClick(user)}><LuPencil size={14} /> Edit</button>
                  <button className="admin-action-btn" onClick={() => toggleExpand(user.id)}>
                    {isExpanded ? <LuChevronDown size={14} /> : <LuChevronRight size={14} />} Details
                  </button>
                </div>
                {isExpanded && (
                  <div className="mobile-user-card-details">
                    <div className="mobile-detail-row">
                      <span className="mobile-detail-label">Sponsor</span>
                      <span>{user.sponsorName || "Direct"} ({user.sponsorId || "None"})</span>
                    </div>
                    <div className="mobile-detail-row">
                      <span className="mobile-detail-label">Bank</span>
                      <span>{user.bankAccountNumber ? `${user.bankName} - ${user.bankAccountNumber}` : "None"}</span>
                    </div>
                    <div className="mobile-detail-row">
                      <span className="mobile-detail-label">Address</span>
                      <span>{user.address ? `${user.address}, ` : ""}{user.district || ""}, {user.state || ""} {user.pinCode || ""}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {!paginatedUsers.length && <div className="admin-empty-card">No registered users found matching the filter</div>}
        </div>
      )}

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="admin-pagination-bar">
          {!isMobile && (
            <span className="admin-pagination-info">
              Showing <strong>{(currentPage - 1) * itemsPerPage + 1}</strong> to <strong>{Math.min(currentPage * itemsPerPage, filteredUsers.length)}</strong> of <strong>{filteredUsers.length}</strong> entries
            </span>
          )}
          <div className="admin-pagination-buttons" style={isMobile ? { width: "100%", justifyContent: "space-between" } : {}}>
            <button 
              type="button" 
              className="admin-pagination-btn" 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            >
              Previous
            </button>
            {isMobile ? (
              <span className="admin-mobile-page-info" style={{ fontWeight: 600, color: "#475569" }}>
                Page {currentPage} of {totalPages}
              </span>
            ) : (() => {
              const maxPagesToShow = 5;
              let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
              let endPage = startPage + maxPagesToShow - 1;
              if (endPage > totalPages) {
                endPage = totalPages;
                startPage = Math.max(1, endPage - maxPagesToShow + 1);
              }
              const pages = [];
              for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
              }
              return pages.map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  className={`admin-pagination-btn ${currentPage === pageNum ? "active" : ""}`}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </button>
              ));
            })()}
            <button 
              type="button" 
              className="admin-pagination-btn" 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
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

function OtpTable({ otps, isMobile }) {
  return (
    <section className="admin-panel">
      <div className="admin-panel-head">
        <h2>OTP Management</h2>
        <span>{otps.length} latest requests</span>
      </div>
      {!isMobile ? (
        <div className="admin-card-table-wrap">
          <table className="admin-modern-table">
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
                  <td data-label="ID">{otp.id}</td>
                  <td data-label="Mobile">{otp.mobile}</td>
                  <td data-label="Purpose"><span className="admin-pill">{otp.purpose}</span></td>
                  <td data-label="Attempts">{otp.attempts}</td>
                  <td data-label="Created">{formatDate(otp.createdAt)}</td>
                  <td data-label="Expires">{formatDate(otp.expiresAt)}</td>
                  <td data-label="Consumed">{otp.consumedAt ? formatDate(otp.consumedAt) : '-'}</td>
                  <td data-label="Response" className="admin-provider-response">{otp.providerResponse || '-'}</td>
                </tr>
              ))}
              {!otps.length && <EmptyRow colSpan={8} text="No OTP requests yet" />}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="admin-mobile-user-cards-container">
          {otps.map((otp) => (
            <div key={otp.id} className="mobile-user-card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <strong style={{ color: '#0f172a' }}>{otp.mobile}</strong>
                <span className="admin-pill">{otp.purpose}</span>
              </div>
              <div style={{ fontSize: '13px', color: '#64748b', display: 'grid', gap: '4px' }}>
                <div>ID: {otp.id}</div>
                <div>Created: {formatDate(otp.createdAt)}</div>
                <div>Expires: {formatDate(otp.expiresAt)}</div>
                {otp.consumedAt && <div style={{ color: '#16a34a', fontWeight: 600 }}>Consumed: {formatDate(otp.consumedAt)}</div>}
              </div>
            </div>
          ))}
          {!otps.length && <div className="admin-empty-card">No OTP requests yet</div>}
        </div>
      )}
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
  const [sponsorLoading, setSponsorLoading] = useState(false);
  const [sponsorError, setSponsorError] = useState('');

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
      setSponsorError('');
    }
  }, [isOpen]);

  useEffect(() => {
    const sId = formData.sponsorId.trim();
    if (!sId) {
      setFormData((prev) => ({ ...prev, sponsorName: '' }));
      setSponsorError('');
      return;
    }

    const fetchSponsor = async () => {
      setSponsorLoading(true);
      setSponsorError('');
      try {
        const response = await axios.get(`${API_BASE_URL}/api/auth/sponsor/validate`, {
          params: { sponsorId: sId }
        });
        if (response.data?.success && response.data?.data?.sponsorName) {
          setFormData((prev) => ({ ...prev, sponsorName: response.data.data.sponsorName }));
        } else {
          setFormData((prev) => ({ ...prev, sponsorName: '' }));
          setSponsorError('Sponsor not recognized');
        }
      } catch (err) {
        setFormData((prev) => ({ ...prev, sponsorName: '' }));
        setSponsorError('Sponsor not recognized');
      } finally {
        setSponsorLoading(false);
      }
    };

    const timer = setTimeout(fetchSponsor, 600);
    return () => clearTimeout(timer);
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
      setError(formatErrorMessage(err));
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
              Sponsor ID {sponsorLoading && <span className="admin-sub-loader">Lookup...</span>} {sponsorError && <span style={{ color: '#ef4444', fontSize: '11px', marginLeft: '6px' }}>{sponsorError}</span>}
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

function WebhooksTable({ webhooks, onViewPayload }) {
  return (
    <section className="admin-panel">
      <div className="admin-panel-head">
        <div>
          <h2>Hubble Webhook Logs</h2>
          <span>{webhooks.length} events logged</span>
        </div>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Idempotency Key</th>
              <th>Event Type</th>
              <th>Transaction Ref</th>
              <th>Status</th>
              <th>Process Status</th>
              <th>Received At</th>
              <th>Payload</th>
            </tr>
          </thead>
          <tbody>
            {webhooks.map((w) => (
              <tr key={w.id}>
                <td>{w.id}</td>
                <td><code style={{ fontSize: '11px', background: '#f3f4f6', padding: '3px 5px', borderRadius: '4px' }}>{w.idempotency_key}</code></td>
                <td><span className="admin-pill">{w.event_type}</span></td>
                <td>{w.transaction_reference_id || '-'}</td>
                <td><span className="admin-pill">{w.status || 'NA'}</span></td>
                <td><span className="admin-pill">{w.process_status}</span></td>
                <td>{formatDate(w.received_at)}</td>
                <td>
                  <button className="admin-secondary-btn" style={{ minHeight: '30px', fontSize: '12px', padding: '0 8px', borderRadius: '8px' }} onClick={() => onViewPayload(w)}>
                    View Payload
                  </button>
                </td>
              </tr>
            ))}
            {!webhooks.length && <EmptyRow colSpan={8} text="No webhook events recorded yet" />}
          </tbody>
        </table>
      </div>
    </section>
  );
}
 
function HubblePanel({ transactions, config }) {
  return (
    <div className="admin-two-col" style={{ gridTemplateColumns: '3fr 1.2fr' }}>
      <section className="admin-panel">
        <div className="admin-panel-head">
          <div>
            <h2>Hubble Purchase Flow (Transactions)</h2>
            <span>{transactions.length} total orders</span>
          </div>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Transaction Ref</th>
                <th>User Details</th>
                <th>Status</th>
                <th>Amount</th>
                <th>Discount</th>
                <th>Currency</th>
                <th>Last Event ID</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id}>
                  <td><strong>{tx.transaction_reference_id}</strong></td>
                  <td>
                    {tx.user_full_name ? (
                      <>
                        <strong>{tx.user_full_name}</strong>
                        <small className="admin-cell-sub">User ID: {tx.user_id} \| {tx.user_mobile}</small>
                      </>
                    ) : (
                      <span className="admin-cell-sub">Subject: {tx.hubble_user_id}</span>
                    )}
                  </td>
                  <td>
                    <span className="admin-pill" style={{
                      background: tx.status === 'COMPLETED' ? '#dcfce7' : tx.status === 'FAILED' ? '#fee2e2' : '#fef3c7',
                      color: tx.status === 'COMPLETED' ? '#166534' : tx.status === 'FAILED' ? '#991b1b' : '#92400e'
                    }}>
                      {tx.status}
                    </span>
                  </td>
                  <td>₹{tx.amount}</td>
                  <td>₹{tx.discount_amount || '0.00'}</td>
                  <td>{tx.currency}</td>
                  <td>{tx.last_event_id}</td>
                  <td>{formatDate(tx.updated_at)}</td>
                </tr>
              ))}
              {!transactions.length && <EmptyRow colSpan={8} text="No gift card transactions yet" />}
            </tbody>
          </table>
        </div>
      </section>
 
      <section className="admin-panel" style={{ padding: '20px' }}>
        <div className="admin-panel-head" style={{ padding: '0 0 14px', borderBottom: '1px solid #e5e7eb', marginBottom: '16px' }}>
          <h2>Hubble Config Status</h2>
        </div>
        <div className="admin-form" style={{ gap: '14px', marginTop: 0 }}>
          <div>
            <span className="admin-cell-sub" style={{ fontSize: '11px', textTransform: 'uppercase' }}>Configuration Status</span>
            <strong style={{ display: 'block', fontSize: '14px', color: config?.isConfigured ? '#15803d' : '#b91c1c' }}>
              {config?.isConfigured ? '✓ Configured & Active' : '✗ Unconfigured'}
            </strong>
          </div>
          <div>
            <span className="admin-cell-sub" style={{ fontSize: '11px', textTransform: 'uppercase' }}>Client ID</span>
            <code style={{ display: 'block', padding: '6px 8px', background: '#f3f4f6', borderRadius: '6px', fontSize: '12px', wordBreak: 'break-all' }}>
              {config?.clientId || 'Not configured'}
            </code>
          </div>
          <div>
            <span className="admin-cell-sub" style={{ fontSize: '11px', textTransform: 'uppercase' }}>SDK Base URL</span>
            <code style={{ display: 'block', padding: '6px 8px', background: '#f3f4f6', borderRadius: '6px', fontSize: '12px', wordBreak: 'break-all' }}>
              {config?.sdkBaseUrl || 'Not configured'}
            </code>
          </div>
          <div>
            <span className="admin-cell-sub" style={{ fontSize: '11px', textTransform: 'uppercase' }}>Webhook Secret (Masked)</span>
            <code style={{ display: 'block', padding: '6px 8px', background: '#f3f4f6', borderRadius: '6px', fontSize: '12px', wordBreak: 'break-all' }}>
              {config?.webhookSecret || 'Not configured'}
            </code>
          </div>
        </div>
      </section>
    </div>
  );
}
 
function WebhookPayloadModal({ webhook, onClose }) {
  let formattedJson = '';
  try {
    formattedJson = JSON.stringify(JSON.parse(webhook.raw_body), null, 2);
  } catch (e) {
    formattedJson = webhook.raw_body || '';
  }
 
  return (
    <div className="admin-modal-backdrop">
      <div className="admin-modal-card" style={{ width: 'min(100%, 720px)' }}>
        <header className="admin-modal-header">
          <h2>Webhook Event Payload (ID: {webhook.id})</h2>
          <button className="admin-modal-close" onClick={onClose}>
            <LuX />
          </button>
        </header>
        <div className="admin-modal-form" style={{ padding: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
            <div><strong>Idempotency Key:</strong> <code style={{ fontSize: '11px', background: '#f3f4f6', padding: '2px 4px', borderRadius: '4px' }}>{webhook.idempotency_key}</code></div>
            <div><strong>Event Type:</strong> {webhook.event_type}</div>
            <div><strong>Received At:</strong> {formatDate(webhook.received_at)}</div>
            <div><strong>Verification Signature:</strong> <code style={{ fontSize: '11px', wordBreak: 'break-all' }}>{webhook.x_verify}</code></div>
          </div>
          <pre style={{
            background: '#0f172a',
            color: '#38bdf8',
            padding: '14px',
            borderRadius: '10px',
            fontFamily: 'monospace',
            fontSize: '12px',
            overflow: 'auto',
            maxHeight: '400px',
            marginTop: '12px',
            margin: 0
          }}>
            {formattedJson}
          </pre>
        </div>
        <footer className="admin-modal-footer" style={{ padding: '12px 16px', margin: 0 }}>
          <button className="admin-primary-btn" style={{ minHeight: '36px', padding: '0 16px' }} onClick={onClose}>
            Close
          </button>
        </footer>
      </div>
    </div>
  );
}

function EditUserModal({ isOpen, user, onClose, headers, onSuccess }) {
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    mobile: user?.mobile || '',
    email: user?.email || '',
    address: user?.address || '',
    pinCode: user?.pinCode || '',
    district: user?.district || '',
    state: user?.state || '',
    status: user?.status || 'ACTIVE',
    accountActive: user?.accountActive ?? false,
    kycStatus: user?.kycStatus || 'UNSUBMITTED'
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pinLoading, setPinLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        mobile: user.mobile || '',
        email: user.email || '',
        address: user.address || '',
        pinCode: user.pinCode || '',
        district: user.district || '',
        state: user.state || '',
        status: user.status || 'ACTIVE',
        accountActive: user.accountActive ?? false,
        kycStatus: user.kycStatus || 'UNSUBMITTED'
      });
      setError('');
    }
  }, [user]);

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
        // ignore
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

    if (formData.mobile.length !== 10) {
      setError('Mobile number must be exactly 10 digits.');
      setLoading(false);
      return;
    }

    try {
      await axios.put(`${API_BASE_URL}/api/admin/users/${user.id}`, formData, { headers });
      onSuccess(`User '${formData.fullName}' updated successfully.`);
      onClose();
    } catch (err) {
      setError(formatErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="admin-modal-backdrop">
      <div className="admin-modal-card">
        <header className="admin-modal-header">
          <h2>Edit Customer Account</h2>
          <button className="admin-modal-close" onClick={onClose}>
            <LuX />
          </button>
        </header>
        <form className="admin-modal-form" onSubmit={handleSubmit}>
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
            <label>
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
            <label>
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
            <label className="span-2">
              Address
              <textarea
                placeholder="Full street address details"
                value={formData.address}
                onChange={(e) => setFormData((p) => ({ ...p, address: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  minHeight: '80px',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  fontSize: '13px'
                }}
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

          <div className="admin-form-row" style={{ gridTemplateColumns: '1fr 1fr', alignItems: 'center' }}>
            <label style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none' }}>
              <input
                type="checkbox"
                checked={formData.accountActive}
                onChange={(e) => setFormData((p) => ({ ...p, accountActive: e.target.checked }))}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>Genealogy MLM Active</span>
            </label>

            <label>
              Login Block Status
              <select
                value={formData.status}
                onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  background: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 600
                }}
              >
                <option value="ACTIVE">Active (Unblocked)</option>
                <option value="INACTIVE">Blocked</option>
              </select>
            </label>
          </div>

          {error && <div className="admin-error">{error}</div>}

          <footer className="admin-modal-footer">
            <button type="button" className="admin-secondary-btn" onClick={onClose}>
              Cancel
            </button>
            <button className="admin-primary-btn" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}

function KycDetailsModal({ isOpen, user, onClose, headers, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUpdateKyc = async (status) => {
    setLoading(true);
    setError('');
    try {
      await axios.put(`${API_BASE_URL}/api/admin/users/${user.id}`, {
        email: user.email,
        mobile: user.mobile,
        pinCode: user.pinCode,
        district: user.district,
        state: user.state,
        status: user.status,
        fullName: user.fullName,
        address: user.address,
        accountActive: user.accountActive,
        kycStatus: status
      }, { headers });
      onSuccess(`KYC status for ${user.fullName} updated to ${status}.`);
      onClose();
    } catch (err) {
      setError(formatErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="admin-modal-backdrop">
      <div className="admin-modal-card" style={{ width: 'min(100%, 540px)' }}>
        <header className="admin-modal-header">
          <h2>KYC Verification Details</h2>
          <button className="admin-modal-close" onClick={onClose}>
            <LuX />
          </button>
        </header>
        <div className="admin-modal-form" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
              <div>
                <strong style={{ fontSize: '15px', color: '#0f172a' }}>{user.fullName}</strong>
                <div style={{ fontSize: '12px', color: '#64748b' }}>User ID: {user.id}</div>
              </div>
              <span className={`admin-kyc-badge kyc-${(user.kycStatus || 'UNSUBMITTED').toLowerCase()}`}>
                {user.kycStatus || 'UNSUBMITTED'}
              </span>
            </div>

            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '13px', margin: '0 0 10px', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bank Account Details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '13px' }}>
                <div>
                  <span style={{ color: '#64748b', display: 'block' }}>Bank Name</span>
                  <strong style={{ color: '#0f172a' }}>{user.bankName || 'Not Provided'}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block' }}>Account Number</span>
                  <strong style={{ color: '#0f172a' }}>{user.bankAccountNumber || 'Not Provided'}</strong>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <span style={{ color: '#64748b', display: 'block' }}>IFSC Code</span>
                  <strong style={{ color: '#0f172a' }}>{user.ifscCode || 'Not Provided'}</strong>
                </div>
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '13px', margin: '0 0 10px', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Identity Verification</h3>
              <div style={{ fontSize: '13px' }}>
                <span style={{ color: '#64748b', display: 'block', marginBottom: '4px' }}>Aadhaar DigiLocker Link</span>
                {user.aadhaarDigilockerUrl ? (
                  <a 
                    href={user.aadhaarDigilockerUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ color: '#3b82f6', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'underline' }}
                  >
                    View Aadhaar Document (DigiLocker)
                  </a>
                ) : (
                  <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>No document linked</span>
                )}
              </div>
            </div>
          </div>
          
          {error && <div className="admin-error" style={{ marginTop: '12px' }}>{error}</div>}
        </div>
        <footer className="admin-modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '16px 24px', borderTop: '1px solid #f1f5f9', background: '#fafafa' }}>
          <button 
            type="button" 
            className="admin-secondary-btn" 
            onClick={onClose} 
            disabled={loading}
            style={{ minHeight: '38px', padding: '0 16px' }}
          >
            Close
          </button>
          
          <button 
            type="button" 
            onClick={() => handleUpdateKyc('REOPENED')} 
            disabled={loading}
            style={{ 
              minHeight: '38px', 
              padding: '0 16px', 
              background: '#ef4444', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '10px', 
              fontWeight: 600,
              cursor: 'pointer' 
            }}
          >
            Reject/Reopen
          </button>
          
          <button 
            type="button" 
            onClick={() => handleUpdateKyc('VERIFIED')} 
            disabled={loading}
            style={{ 
              minHeight: '38px', 
              padding: '0 16px', 
              background: '#10b981', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '10px', 
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Approve KYC
          </button>
        </footer>
      </div>
    </div>
  );
}

export default AdminDashboard;
