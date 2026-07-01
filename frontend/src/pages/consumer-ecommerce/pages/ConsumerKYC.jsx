import React, { useEffect, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  Chip,
  IconButton,
  InputAdornment
} from "@mui/material";
import {
  CheckCircle,
  Pending,
  Cancel,
  ArrowForward,
  AccountBalance,
  Person,
  Settings,
  Group,
  CalendarToday,
  ContactPage,
  CreditCard,
  Shield,
  Lock
} from "@mui/icons-material";
import { LuChevronLeft } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getAccessToken, clearAuth } from "../../../services/authStorage";
import TriAppShell from "../../../components/ui/TriAppShell";
import TriHeader from "../../../components/ui/TriHeader";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "";
const PRIMARY = "#f97316"; // Active orange theme color for Tri Consumer
const PRIMARY_DARK = "#ea580c";
const SURFACE = "#ffffff";
const TEXT = "#0f172a";
const TEXT_SECONDARY = "#475569";
const BORDER = "#e2e8f0";

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ConsumerKYC() {
  const navigate = useNavigate();
  const [tabIndex, setTabIndex] = useState(0);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // DigiLocker KYC state
  const [dlStatus, setDlStatus] = useState("NOT_STARTED");
  const [dlProfile, setDlProfile] = useState(null);

  // Bank Form State
  const [bankForm, setBankForm] = useState({
    bankName: "",
    accountNumber: "",
    ifscCode: ""
  });

  // Nominees list
  const [nominees, setNominees] = useState([]);

  const getHeaders = () => ({
    Authorization: `Bearer ${getAccessToken()}`
  });

  const clearAlerts = () => {
    setError("");
    setMessage("");
  };

  const fetchDlStatus = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/kyc/status`, { headers: getHeaders() });
      if (res?.data?.data?.status) {
        const status = res.data.data.status;
        setDlStatus(status);
        if (status === "PENDING" || status === "VERIFIED" || status === "REJECTED") {
          const profileRes = await axios.get(`${API_BASE_URL}/api/kyc/profile`, { headers: getHeaders() });
          if (profileRes?.data?.data) {
            setDlProfile(profileRes.data.data);
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch DigiLocker status", err);
      if (err.response?.status === 401) {
        clearAuth();
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchLegacyKycData = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/users/kyc/`, { headers: getHeaders() });
      if (res?.data) {
        setBankForm({
          bankName: res.data.bank_name || "",
          accountNumber: res.data.bank_account_number || "",
          ifscCode: res.data.ifsc_code || ""
        });
      }
    } catch (err) {
      if (err.response?.status !== 404) {
        console.error("Failed to fetch legacy KYC data", err);
      }
      if (err.response?.status === 401) {
        clearAuth();
        navigate('/login');
      }
    }
  };

  const fetchNominees = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/users/nominees/`, { headers: getHeaders() });
      if (Array.isArray(res.data)) {
        setNominees(res.data);
      } else if (res.data?.results) {
        setNominees(res.data.results);
      }
    } catch (err) {
      if (err.response?.status !== 404) {
        console.error("Failed to fetch nominees", err);
      }
      if (err.response?.status === 401) {
        clearAuth();
        navigate('/login');
      }
    }
  };

  const startDigiLockerKyc = async () => {
    try {
      setSaving(true);
      clearAlerts();
      const res = await axios.post(`${API_BASE_URL}/api/kyc/start`, {}, { headers: getHeaders() });
      const url = res?.data?.data?.authorization_url || res?.data?.authorization_url;
      if (url) {
        window.location.href = url;
      } else {
        setError("Failed to generate DigiLocker verification link.");
      }
    } catch (err) {
      setError("Failed to initiate DigiLocker KYC: " + (err.response?.data?.message || err.message));
      if (err.response?.status === 401) {
        clearAuth();
        navigate('/login');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleBankSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      clearAlerts();
      await axios.post(
        `${API_BASE_URL}/api/users/kyc/`,
        {
          bank_name: bankForm.bankName,
          bank_account_number: bankForm.accountNumber,
          ifsc_code: bankForm.ifscCode
        },
        { headers: getHeaders() }
      );
      setMessage("Bank details saved successfully!");
      setTabIndex(1);
    } catch (err) {
      setError("Failed to save bank details: " + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const callback = params.get("kyc_callback");
    if (callback === "success") {
      setMessage("DigiLocker verification completed! Your identity is verified and withdrawals are unlocked.");
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (callback === "error") {
      const errorMsg = params.get("error") || "Unknown error";
      setError("DigiLocker verification failed: " + decodeURIComponent(errorMsg));
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    fetchDlStatus();
    fetchLegacyKycData();
    fetchNominees();
  }, []);

  const renderStatusHeader = () => {
    const statusConfig = {
      NOT_STARTED: {
        label: "Aadhaar Identity Unverified",
        color: "error",
        icon: <Cancel />,
        desc: "Please verify your identity using DigiLocker to secure your account and unlock wallet withdrawals."
      },
      IN_PROGRESS: {
        label: "Verification In Progress",
        color: "warning",
        icon: <Pending />,
        desc: "You have started the DigiLocker verification flow. Please complete authentication."
      },
      PENDING: {
        label: "Pending Admin Approval",
        color: "warning",
        icon: <Pending />,
        desc: "Aadhaar details retrieved successfully. Admin approval is pending."
      },
      VERIFIED: {
        label: "Identity Verified",
        color: "success",
        icon: <CheckCircle />,
        desc: "Congratulations! Your identity is verified. Wallet withdrawals and core transaction limits are fully unlocked."
      },
      REJECTED: {
        label: "Verification Rejected",
        color: "error",
        icon: <Cancel />,
        desc: `Verification rejected. Remarks: ${dlProfile?.remarks || "Please re-verify."}`
      }
    };

    const cfg = statusConfig[dlStatus] || statusConfig.NOT_STARTED;

    return (
      <Card sx={{ mb: 3, borderLeft: 6, borderColor: `${cfg.color}.main`, bgcolor: SURFACE }}>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" flexWrap="wrap">
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <Chip icon={cfg.icon} label={cfg.label} color={cfg.color} variant="filled" sx={{ fontWeight: 800 }} />
                {dlStatus === "VERIFIED" && <Chip label="Withdrawals Unlocked" color="success" size="small" variant="outlined" />}
              </Stack>
              <Typography variant="body2" sx={{ color: TEXT_SECONDARY }}>
                {cfg.desc}
              </Typography>
            </Box>
            {dlStatus === "VERIFIED" && dlProfile?.verified_at && (
              <Box sx={{ textAlign: "right" }}>
                <Typography variant="caption" sx={{ color: TEXT_SECONDARY }} display="block">
                  Verified On: {new Date(dlProfile.verified_at).toLocaleDateString()}
                </Typography>
              </Box>
            )}
          </Stack>
        </CardContent>
      </Card>
    );
  };

  return (
    <TriAppShell bottomNavIndex={2} bg="background">
      <TriHeader 
        title="KYC Verification" 
        onBack={() => navigate(-1)} 
        rightElement={
          <Box sx={{ color: '#fff', display: 'flex', alignItems: 'center', pr: 1 }}>
            <Shield sx={{ fontSize: 24 }} />
          </Box>
        }
      />

      <Container maxWidth="xs" sx={{ py: 3, pb: 8 }}>
        {/* Custom Progress Stepper */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 4, px: 1 }}>
          <Stack direction="row" alignItems="center" spacing={0} sx={{ width: '100%', maxWidth: '380px', position: 'relative' }}>
            
            {/* Step 1: Identity */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative', zIndex: 2 }}>
              <Box 
                onClick={() => setTabIndex(0)}
                sx={{ 
                  width: 44, 
                  height: 44, 
                  borderRadius: '50%', 
                  bgcolor: '#fff', 
                  border: '2.5px solid #FF7A00', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  boxShadow: '0 4px 10px rgba(255, 122, 0, 0.15)',
                  color: '#FF7A00',
                  cursor: 'pointer'
                }}
              >
                <Person sx={{ fontSize: 22 }} />
              </Box>
              <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: '#FF7A00', color: '#fff', fontSize: '9px', fontWeight: 900, display: 'grid', placeItems: 'center' }}>1</Box>
                  <Typography sx={{ fontSize: '11px', fontWeight: 800, color: '#FF7A00' }}>Identity</Typography>
                </Stack>
                <Typography sx={{ fontSize: '9px', color: '#94a3b8', fontWeight: 600 }}>DigiLocker</Typography>
              </Box>
            </Box>

            {/* Line 1 -> 2 */}
            <Box sx={{ 
              height: '2.5px', 
              bgcolor: '#FF7A00', 
              flex: 1, 
              position: 'absolute', 
              left: 'calc(16.6% + 22px)', 
              right: 'calc(50% + 22px)', 
              top: 22, 
              transform: 'translateY(-50%)',
              zIndex: 1 
            }} />

            {/* Step 2: Bank Details */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative', zIndex: 2 }}>
              <Box 
                onClick={() => {
                  if (dlStatus === 'VERIFIED' || dlStatus === 'PENDING') {
                    setTabIndex(0);
                  }
                }}
                sx={{ 
                  width: 44, 
                  height: 44, 
                  borderRadius: '50%', 
                  bgcolor: '#fff', 
                  border: tabIndex === 1 ? '2.5px solid #FF7A00' : '2px solid #cbd5e1', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: tabIndex === 1 ? '#FF7A00' : '#64748b',
                  cursor: (dlStatus === 'VERIFIED' || dlStatus === 'PENDING') ? 'pointer' : 'default',
                  boxShadow: tabIndex === 1 ? '0 4px 10px rgba(255, 122, 0, 0.15)' : 'none'
                }}
              >
                <AccountBalance sx={{ fontSize: 20 }} />
              </Box>
              <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: tabIndex === 1 ? '#FF7A00' : '#64748b', color: '#fff', fontSize: '9px', fontWeight: 900, display: 'grid', placeItems: 'center' }}>2</Box>
                  <Typography sx={{ fontSize: '11px', fontWeight: 800, color: tabIndex === 1 ? '#FF7A00' : '#334155' }}>Bank Details</Typography>
                </Stack>
              </Box>
            </Box>

            {/* Line 2 -> 3 */}
            <Box sx={{ 
              height: '2.5px', 
              bgcolor: tabIndex === 1 ? '#FF7A00' : '#cbd5e1', 
              flex: 1, 
              position: 'absolute', 
              left: 'calc(50% + 22px)', 
              right: 'calc(16.6% + 22px)', 
              top: 22, 
              transform: 'translateY(-50%)',
              zIndex: 1 
            }} />

            {/* Step 3: Nominees */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative', zIndex: 2 }}>
              <Box 
                onClick={() => {
                  if (dlStatus === 'VERIFIED' || dlStatus === 'PENDING') {
                    setTabIndex(1);
                  }
                }}
                sx={{ 
                  width: 44, 
                  height: 44, 
                  borderRadius: '50%', 
                  bgcolor: '#fff', 
                  border: tabIndex === 1 ? '2.5px solid #FF7A00' : '2px solid #cbd5e1', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: tabIndex === 1 ? '#FF7A00' : '#64748b',
                  cursor: (dlStatus === 'VERIFIED' || dlStatus === 'PENDING') ? 'pointer' : 'default',
                  boxShadow: tabIndex === 1 ? '0 4px 10px rgba(255, 122, 0, 0.15)' : 'none'
                }}
              >
                <Group sx={{ fontSize: 22 }} />
              </Box>
              <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: tabIndex === 1 ? '#FF7A00' : '#64748b', color: '#fff', fontSize: '9px', fontWeight: 900, display: 'grid', placeItems: 'center' }}>3</Box>
                  <Typography sx={{ fontSize: '11px', fontWeight: 800, color: tabIndex === 1 ? '#FF7A00' : '#334155' }}>Nominees</Typography>
                </Stack>
              </Box>
            </Box>

          </Stack>
        </Box>

        {message && <Alert severity="success" sx={{ mb: 3 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress color="warning" />
          </Box>
        ) : (
          <Box>
            {/* STEP 1 & 2: IDENTITY + BANK DETAILS */}
            {tabIndex === 0 && (
              <Box>
                {/* If DigiLocker is NOT verified */}
                {(dlStatus === "NOT_STARTED" || dlStatus === "REJECTED" || dlStatus === "IN_PROGRESS") && (
                  <Paper variant="outlined" sx={{ p: 4, borderRadius: 4, textAlign: "center", bgcolor: "rgba(249, 115, 22, 0.02)", borderStyle: "dashed", borderColor: '#f97316' }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, color: PRIMARY_DARK }}>
                      Aadhaar KYC Verification
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 4, maxW: 550, mx: "auto", color: TEXT_SECONDARY, lineHeight: 1.6 }}>
                      Authenticate using DigiLocker to automatically verify your identity. Your digital records are securely fetched from government source registers.
                    </Typography>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={startDigiLockerKyc}
                      disabled={saving}
                      endIcon={<ArrowForward />}
                      sx={{
                        borderRadius: '30px',
                        px: 4,
                        py: 1.5,
                        fontWeight: 800,
                        bgcolor: PRIMARY,
                        textTransform: "none",
                        color: "#fff",
                        boxShadow: '0 4px 12px rgba(249, 115, 22, 0.2)',
                        "&:hover": { bgcolor: PRIMARY_DARK }
                      }}
                    >
                      {saving ? "Redirecting..." : "Start DigiLocker Verification"}
                    </Button>
                  </Paper>
                )}

                {/* If DigiLocker IS verified */}
                {(dlStatus === "PENDING" || dlStatus === "VERIFIED") && (
                  <Box>
                    {/* Aadhaar Details Card */}
                    <Card sx={{ 
                      mb: 4, 
                      borderRadius: '16px', 
                      border: '1px solid #d1fae5', 
                      bgcolor: '#f0fdf4',
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.04)'
                    }}>
                      <CardContent sx={{ p: 2.5 }}>
                        <Stack direction="row" spacing={2} alignItems="flex-start">
                          <Box sx={{ display: 'grid', placeItems: 'center', width: 36, height: 36, borderRadius: '50%', bgcolor: '#d1fae5', color: '#10b981', flexShrink: 0 }}>
                            <CheckCircle sx={{ fontSize: 24 }} />
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography sx={{ fontSize: '15px', fontWeight: 800, color: '#065f46', mb: 0.5 }}>
                              DigiLocker Verification Completed
                            </Typography>
                            <Typography sx={{ fontSize: '11.5px', color: '#0f172a', fontWeight: 500, lineHeight: 1.4 }}>
                              Your Aadhaar has been verified successfully. Core transaction limits and wallet withdrawals are fully unlocked.
                            </Typography>
                          </Box>
                        </Stack>

                        {dlProfile && (
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2, pt: 2, borderTop: '1px solid #d1fae5' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box sx={{ display: 'grid', placeItems: 'center', width: 28, height: 28, borderRadius: '8px', bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                                <Person sx={{ fontSize: 16 }} />
                              </Box>
                              <Box>
                                <Typography sx={{ color: '#64748b', fontSize: '8.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', lineHeight: 1.1 }}>Name</Typography>
                                <Typography sx={{ fontSize: '11px', fontWeight: 800, color: '#0f172a' }}>{dlProfile.name}</Typography>
                              </Box>
                            </Box>
                            <Box sx={{ width: '1px', height: '24px', bgcolor: '#d1fae5' }} />
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box sx={{ display: 'grid', placeItems: 'center', width: 28, height: 28, borderRadius: '8px', bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                                <CalendarToday sx={{ fontSize: 16 }} />
                              </Box>
                              <Box>
                                <Typography sx={{ color: '#64748b', fontSize: '8.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', lineHeight: 1.1 }}>DOB</Typography>
                                <Typography sx={{ fontSize: '11px', fontWeight: 800, color: '#0f172a' }}>{dlProfile.dob}</Typography>
                              </Box>
                            </Box>
                            <Box sx={{ width: '1px', height: '24px', bgcolor: '#d1fae5' }} />
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box sx={{ display: 'grid', placeItems: 'center', width: 28, height: 28, borderRadius: '8px', bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                                <ContactPage sx={{ fontSize: 16 }} />
                              </Box>
                              <Box>
                                <Typography sx={{ color: '#64748b', fontSize: '8.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', lineHeight: 1.1 }}>Aadhaar</Typography>
                                <Typography sx={{ fontSize: '11px', fontWeight: 800, color: '#0f172a' }}>XXXX XXXX {dlProfile.aadhaarLast4 || '8095'}</Typography>
                              </Box>
                            </Box>
                          </Box>
                        )}
                      </CardContent>
                    </Card>

                    {/* Payout Bank Details Form */}
                    <Box sx={{ px: 0.5 }}>
                      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                        <Box sx={{ width: 44, height: 44, borderRadius: '50%', bgcolor: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ea580c', border: '1px solid #ffedd5', flexShrink: 0 }}>
                          <AccountBalance sx={{ fontSize: 22 }} />
                        </Box>
                        <Box>
                          <Typography sx={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                            Payout Bank Details
                          </Typography>
                          <Typography sx={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>
                            Please provide your bank details for withdrawals.
                          </Typography>
                        </Box>
                      </Stack>

                      <form onSubmit={handleBankSubmit}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                            <Typography sx={{ fontSize: '12.5px', fontWeight: 700, color: '#334155' }}>
                              Bank Name <span style={{ color: '#ef4444' }}>*</span>
                            </Typography>
                            <TextField
                              placeholder="Enter bank name"
                              fullWidth
                              required
                              disabled={dlStatus === "VERIFIED" || saving}
                              value={bankForm.bankName}
                              onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                              InputProps={{
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <AccountBalance sx={{ color: '#94a3b8', fontSize: 20 }} />
                                  </InputAdornment>
                                ),
                                sx: {
                                  borderRadius: '12px',
                                  bgcolor: '#fff',
                                  height: '48px',
                                  '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#e2e8f0',
                                  },
                                  '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#cbd5e1',
                                  },
                                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#ff7a00',
                                    borderWidth: '1.5px'
                                  }
                                }
                              }}
                            />
                          </Box>

                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                            <Typography sx={{ fontSize: '12.5px', fontWeight: 700, color: '#334155' }}>
                              Bank Account Number <span style={{ color: '#ef4444' }}>*</span>
                            </Typography>
                            <TextField
                              placeholder="Enter account number"
                              fullWidth
                              required
                              disabled={dlStatus === "VERIFIED" || saving}
                              value={bankForm.accountNumber}
                              onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                              InputProps={{
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <CreditCard sx={{ color: '#94a3b8', fontSize: 20 }} />
                                  </InputAdornment>
                                ),
                                sx: {
                                  borderRadius: '12px',
                                  bgcolor: '#fff',
                                  height: '48px',
                                  '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#e2e8f0',
                                  },
                                  '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#cbd5e1',
                                  },
                                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#ff7a00',
                                    borderWidth: '1.5px'
                                  }
                                }
                              }}
                            />
                          </Box>

                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                            <Typography sx={{ fontSize: '12.5px', fontWeight: 700, color: '#334155' }}>
                              IFSC Code <span style={{ color: '#ef4444' }}>*</span>
                            </Typography>
                            <TextField
                              placeholder="Enter IFSC code"
                              fullWidth
                              required
                              disabled={dlStatus === "VERIFIED" || saving}
                              value={bankForm.ifscCode}
                              onChange={(e) => setBankForm({ ...bankForm, ifscCode: e.target.value })}
                              InputProps={{
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <Shield sx={{ color: '#94a3b8', fontSize: 20 }} />
                                  </InputAdornment>
                                ),
                                sx: {
                                  borderRadius: '12px',
                                  bgcolor: '#fff',
                                  height: '48px',
                                  '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#e2e8f0',
                                  },
                                  '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#cbd5e1',
                                  },
                                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#ff7a00',
                                    borderWidth: '1.5px'
                                  }
                                }
                              }}
                            />
                          </Box>

                          {/* Security Message */}
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'flex-start', 
                            gap: 1.5, 
                            p: 1.75, 
                            borderRadius: '12px', 
                            bgcolor: '#fff7ed', 
                            border: '1px solid #ffedd5',
                            mt: 1.5,
                            mb: 2.5
                          }}>
                            <Lock sx={{ color: '#ea580c', fontSize: 18, mt: 0.25 }} />
                            <Box>
                              <Typography sx={{ fontSize: '13px', fontWeight: 800, color: '#c2410c', lineHeight: 1.2 }}>
                                Your information is secure
                              </Typography>
                              <Typography sx={{ fontSize: '11px', color: '#9a3412', fontWeight: 500, mt: 0.5, lineHeight: 1.3 }}>
                                We use bank-grade encryption to protect your data.
                              </Typography>
                            </Box>
                          </Box>

                          {dlStatus !== "VERIFIED" ? (
                            <Button
                              variant="contained"
                              type="submit"
                              fullWidth
                              disabled={saving}
                              endIcon={<ArrowForward />}
                              sx={{
                                borderRadius: '30px',
                                height: '52px',
                                fontSize: '15px',
                                fontWeight: 800,
                                bgcolor: '#ff6a00',
                                color: '#fff',
                                textTransform: 'none',
                                boxShadow: '0 4px 12px rgba(255, 106, 0, 0.2)',
                                '&:hover': {
                                  bgcolor: '#e05d00',
                                  boxShadow: '0 6px 16px rgba(255, 106, 0, 0.3)',
                                }
                              }}
                            >
                              {saving ? "Saving..." : "Continue"}
                            </Button>
                          ) : (
                            <Button
                              variant="contained"
                              onClick={() => setTabIndex(1)}
                              fullWidth
                              endIcon={<ArrowForward />}
                              sx={{
                                borderRadius: '30px',
                                height: '52px',
                                fontSize: '15px',
                                fontWeight: 800,
                                bgcolor: '#ff6a00',
                                color: '#fff',
                                textTransform: 'none',
                                boxShadow: '0 4px 12px rgba(255, 106, 0, 0.2)',
                                '&:hover': {
                                  bgcolor: '#e05d00',
                                  boxShadow: '0 6px 16px rgba(255, 106, 0, 0.3)',
                                }
                              }}
                            >
                              Continue
                            </Button>
                          )}
                        </Box>
                      </form>
                    </Box>
                  </Box>
                )}
              </Box>
            )}

            {/* STEP 3: NOMINEES */}
            {tabIndex === 1 && (
              <Paper elevation={1} sx={{ p: 4, borderRadius: 3, bgcolor: SURFACE }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: TEXT }}>
                    Nominee Details
                  </Typography>
                </Stack>
                {nominees.length === 0 ? (
                  <Typography variant="body2" sx={{ color: TEXT_SECONDARY, textAlign: "center", py: 4 }}>
                    No nominee allocations configured. Please update in your account profile.
                  </Typography>
                ) : (
                  <List>
                    {nominees.map((nom, idx) => (
                      <ListItem key={idx} divider={idx < nominees.length - 1}>
                        <ListItemText
                          primary={nom.name}
                          secondary={`Relationship: ${nom.relationship} | Share Allocation: ${nom.share_percent}%`}
                          primaryTypographyProps={{ fontWeight: 700, color: TEXT }}
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
                
                <Button
                  variant="outlined"
                  onClick={() => setTabIndex(0)}
                  fullWidth
                  sx={{
                    mt: 4,
                    borderRadius: '30px',
                    height: '48px',
                    fontSize: '14px',
                    fontWeight: 700,
                    borderColor: '#cbd5e1',
                    color: '#64748b',
                    textTransform: 'none',
                    '&:hover': {
                      borderColor: '#94a3b8',
                      bgcolor: '#f8fafc'
                    }
                  }}
                >
                  Back to Payout Details
                </Button>
              </Paper>
            )}
          </Box>
        )}
      </Container>
    </TriAppShell>
  );
}
