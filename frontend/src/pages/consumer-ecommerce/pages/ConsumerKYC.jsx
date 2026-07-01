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
  IconButton
} from "@mui/material";
import {
  CheckCircle,
  Pending,
  Cancel,
  ArrowForward,
  AccountBalance,
  Person,
  Settings,
  Group
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
      if (res?.data?.status) {
        const status = res.data.status;
        setDlStatus(status);
        if (status === "PENDING" || status === "VERIFIED" || status === "REJECTED") {
          const profileRes = await axios.get(`${API_BASE_URL}/api/kyc/profile`, { headers: getHeaders() });
          if (profileRes?.data) {
            setDlProfile(profileRes.data);
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
      setMessage("DigiLocker verification completed! Your profile is pending admin approval.");
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
      <TriHeader title="KYC Verification" onBack={() => navigate(-1)} />

      <Container maxWidth="xs" sx={{ py: 3, pb: 8 }}>
        {renderStatusHeader()}

        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 4 }}>
          <Tabs
            value={tabIndex}
            onChange={(e, newVal) => setTabIndex(newVal)}
            textColor="inherit"
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            TabIndicatorProps={{ sx: { bgcolor: PRIMARY } }}
          >
            <Tab label="Identity (DigiLocker)" icon={<Person />} iconPosition="start" sx={{ textTransform: "none", fontWeight: 700, "&.Mui-selected": { color: PRIMARY } }} />
            <Tab label="Bank Details" icon={<AccountBalance />} iconPosition="start" sx={{ textTransform: "none", fontWeight: 700, "&.Mui-selected": { color: PRIMARY } }} />
            <Tab label="Nominees" icon={<Group />} iconPosition="start" sx={{ textTransform: "none", fontWeight: 700, "&.Mui-selected": { color: PRIMARY } }} />
          </Tabs>
        </Box>

        {message && <Alert severity="success" sx={{ mb: 3 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress color="warning" />
          </Box>
        ) : (
          <Box>
            {/* TAB 1: DIGILOCKER IDENTITY */}
            <TabPanel value={tabIndex} index={0}>
              <Paper elevation={1} sx={{ p: 4, borderRadius: 3, bgcolor: SURFACE }}>
                {(dlStatus === "NOT_STARTED" || dlStatus === "REJECTED" || dlStatus === "IN_PROGRESS") && (
                  <Paper variant="outlined" sx={{ p: 4, borderRadius: 2, textAlign: "center", bgcolor: "rgba(249, 115, 22, 0.04)", borderStyle: "dashed" }}>
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
                        borderRadius: 2,
                        px: 4,
                        py: 1.5,
                        fontWeight: 800,
                        bgcolor: PRIMARY,
                        textTransform: "none",
                        color: "#fff",
                        "&:hover": { bgcolor: PRIMARY_DARK }
                      }}
                    >
                      {saving ? "Redirecting..." : "Start DigiLocker Verification"}
                    </Button>
                  </Paper>
                )}

                {(dlStatus === "PENDING" || dlStatus === "VERIFIED" || dlStatus === "REJECTED") && dlProfile && (
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2, color: TEXT }}>
                      Aadhaar Identity Details
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, border: `1px solid ${BORDER}` }}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
                          {dlProfile.photo ? (
                            <Avatar
                              src={`data:image/jpeg;base64,${dlProfile.photo}`}
                              variant="rounded"
                              sx={{ width: 110, height: 130, border: "2px solid #ccc", boxShadow: 1 }}
                            />
                          ) : (
                            <Avatar variant="rounded" sx={{ width: 110, height: 130, bgcolor: PRIMARY }}>
                              {dlProfile.name ? dlProfile.name.charAt(0) : "U"}
                            </Avatar>
                          )}
                        </Grid>
                        <Grid item xs={12}>
                          <Grid container spacing={2}>
                            <Grid item xs={12}>
                              <Typography variant="caption" sx={{ color: TEXT_SECONDARY }}>Name (as per Aadhaar)</Typography>
                              <Typography sx={{ fontWeight: 700, color: TEXT }}>{dlProfile.name}</Typography>
                            </Grid>
                            <Grid item xs={12}>
                              <Typography variant="caption" sx={{ color: TEXT_SECONDARY }}>Date of Birth</Typography>
                              <Typography sx={{ fontWeight: 600, color: TEXT }}>{dlProfile.dob}</Typography>
                            </Grid>
                            <Grid item xs={12}>
                              <Typography variant="caption" sx={{ color: TEXT_SECONDARY }}>Gender</Typography>
                              <Typography sx={{ fontWeight: 600, color: TEXT }}>{dlProfile.gender === "M" ? "Male" : dlProfile.gender === "F" ? "Female" : dlProfile.gender}</Typography>
                            </Grid>
                            <Grid item xs={12}>
                              <Typography variant="caption" sx={{ color: TEXT_SECONDARY }}>Aadhaar Last 4</Typography>
                              <Typography sx={{ fontWeight: 600, color: TEXT }}>xxxx-xxxx-{dlProfile.aadhaarLast4 || "8095"}</Typography>
                            </Grid>
                            <Grid item xs={12}>
                              <Typography variant="caption" sx={{ color: TEXT_SECONDARY }}>Address</Typography>
                              <Typography variant="body2" sx={{ fontWeight: 500, color: TEXT }}>{dlProfile.address}</Typography>
                            </Grid>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Paper>

                    {/* Linked Issued Documents list */}
                    {dlProfile.issuedDocumentsJson && (
                      <Box sx={{ mt: 4 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: TEXT }}>
                          Linked Issued Documents
                        </Typography>
                        <Paper variant="outlined" sx={{ borderRadius: 2, border: `1px solid ${BORDER}` }}>
                          <List dense>
                            {(() => {
                              try {
                                const docs = JSON.parse(dlProfile.issuedDocumentsJson);
                                const items = docs?.items || [];
                                if (items.length === 0) return <ListItem><ListItemText primary="No issued documents linked." /></ListItem>;
                                return items.map((doc, idx) => (
                                  <ListItem key={idx} divider={idx < items.length - 1}>
                                    <ListItemText
                                      primary={doc.name}
                                      secondary={`URI: ${doc.uri} | Type: ${doc.type || "Document"}`}
                                      primaryTypographyProps={{ fontWeight: 700, color: TEXT }}
                                    />
                                  </ListItem>
                                ));
                              } catch {
                                return <ListItem><ListItemText primary="Could not parse linked documents." /></ListItem>;
                              }
                            })()}
                          </List>
                        </Paper>
                      </Box>
                    )}
                  </Box>
                )}
              </Paper>
            </TabPanel>

            {/* TAB 2: BANK DETAILS */}
            <TabPanel value={tabIndex} index={1}>
              <Paper elevation={1} sx={{ p: 4, borderRadius: 3, bgcolor: SURFACE }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 3, color: TEXT }}>
                  Payout Bank Details
                </Typography>
                <form onSubmit={handleBankSubmit}>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        label="Bank Name"
                        fullWidth
                        required
                        disabled={dlStatus === "VERIFIED" || saving}
                        value={bankForm.bankName}
                        onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="Bank Account Number"
                        fullWidth
                        required
                        disabled={dlStatus === "VERIFIED" || saving}
                        value={bankForm.accountNumber}
                        onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="IFSC Code"
                        fullWidth
                        required
                        disabled={dlStatus === "VERIFIED" || saving}
                        value={bankForm.ifscCode}
                        onChange={(e) => setBankForm({ ...bankForm, ifscCode: e.target.value })}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    {dlStatus !== "VERIFIED" && (
                      <Grid item xs={12}>
                        <Button
                          variant="contained"
                          type="submit"
                          disabled={saving}
                          sx={{
                            borderRadius: 2,
                            px: 4,
                            py: 1.2,
                            fontWeight: 800,
                            bgcolor: PRIMARY,
                            color: "#fff",
                            textTransform: "none",
                            "&:hover": { bgcolor: PRIMARY_DARK }
                          }}
                        >
                          {saving ? "Saving..." : "Save Bank Details"}
                        </Button>
                      </Grid>
                    )}
                  </Grid>
                </form>
              </Paper>
            </TabPanel>

            {/* TAB 3: NOMINEES */}
            <TabPanel value={tabIndex} index={2}>
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
              </Paper>
            </TabPanel>
          </Box>
        )}
      </Container>
    </TriAppShell>
  );
}
