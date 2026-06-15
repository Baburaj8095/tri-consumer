import React, { useCallback, useMemo, useState } from "react";
import axios from "axios";
import { LuCheck, LuX, LuEye, LuRefreshCcw } from "react-icons/lu";
import DataTable from "./DataTable";

function TextInput({ label, value, onChange, placeholder, type = "text", style }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 12, color: "var(--admin-text-light)", fontWeight: 500 }}>{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        type={type}
        className="admin-search-input"
        style={{
          padding: "10px 12px",
          borderRadius: 10,
          border: "1px solid var(--admin-border)",
          outline: "none",
          background: "#fff",
          fontSize: "13px",
          fontFamily: "var(--admin-font)",
          ...style,
        }}
      />
    </div>
  );
}

function Select({ label, value, onChange, options, style }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 12, color: "var(--admin-text-light)", fontWeight: 500 }}>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          padding: "10px 12px",
          borderRadius: 10,
          border: "1px solid var(--admin-border)",
          outline: "none",
          background: "#fff",
          fontSize: "13px",
          fontFamily: "var(--admin-font)",
          color: "var(--admin-text)",
          cursor: "pointer",
          ...style,
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function Badge({ children, color = "#ea580c", bg = "#fff7ed" }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2px 8px",
        lineHeight: 1,
        fontSize: "11px",
        borderRadius: "999px",
        color,
        background: bg,
        fontWeight: 600,
        border: `1px solid ${color}1a`,
      }}
    >
      {children}
    </span>
  );
}

export default function AdminKYC({
  users = [],
  onViewKyc,
  isMobile,
  headers,
  loadAdminData,
  API_BASE_URL = "",
}) {
  const [viewMode, setViewMode] = useState("kyc"); // 'kyc' | 'nominee'
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [actionError, setActionError] = useState("");

  // KYC filters
  const [kycFilters, setKycFilters] = useState({
    status: "SUBMITTED", // Default tab matches original behavior
    user: "",
    state: "",
    pincode: "",
  });

  const [density, setDensity] = useState("standard");
  const [reloadKeyKyc, setReloadKeyKyc] = useState(0);

  function setKycF(key, val) {
    setKycFilters((f) => ({ ...f, [key]: val }));
  }

  const statusOptions = useMemo(
    () => [
      { value: "", label: "Any Status" },
      { value: "UNSUBMITTED", label: "Unsubmitted" },
      { value: "PENDING", label: "Pending" },
      { value: "SUBMITTED", label: "Submitted" },
      { value: "VERIFIED", label: "Verified" },
      { value: "REOPENED", label: "Rejected/Reopened" },
    ],
    []
  );

  const handleUpdateKycStatus = async (user, status) => {
    const actionName = status === "VERIFIED" ? "Verify" : "Reject";
    if (!window.confirm(`${actionName} KYC request for ${user.fullName || user.username}?`)) return;

    setActionLoadingId(user.id);
    setActionError("");
    try {
      await axios.put(
        `${API_BASE_URL}/api/admin/users/${user.id}`,
        {
          email: user.email,
          mobile: user.mobile,
          pinCode: user.pinCode,
          district: user.district,
          state: user.state,
          status: user.status,
          fullName: user.fullName,
          address: user.address,
          accountActive: user.accountActive,
          kycStatus: status,
        },
        { headers }
      );
      loadAdminData();
    } catch (err) {
      setActionError(err?.response?.data?.message || err?.message || "Failed to update KYC status");
    } finally {
      setActionLoadingId(null);
    }
  };

  // KYC DataGrid columns
  const columnsKyc = useMemo(
    () => [
      { field: "id", headerName: "User ID", minWidth: 100, flex: 0.5 },
      { field: "username", headerName: "Username", minWidth: 140, flex: 1 },
      { field: "fullName", headerName: "Full Name", minWidth: 180, flex: 1.2 },
      { field: "mobile", headerName: "Mobile", minWidth: 130, flex: 0.8 },
      { field: "pinCode", headerName: "Pincode", minWidth: 110, flex: 0.6 },
      {
        field: "bankName",
        headerName: "Bank Details",
        minWidth: 220,
        flex: 1.5,
        renderCell: (params) => {
          const r = params?.row || {};
          return r.bankName ? `${r.bankName} (${r.ifscCode || ""})` : <span style={{ color: "var(--admin-muted)", fontStyle: "italic" }}>Not Provided</span>;
        },
      },
      {
        field: "bankAccountNumber",
        headerName: "Account No.",
        minWidth: 160,
        flex: 1,
        renderCell: (params) => {
          return params?.row?.bankAccountNumber || <span style={{ color: "var(--admin-muted)", fontStyle: "italic" }}>Not Provided</span>;
        },
      },
      {
        field: "kycStatus",
        headerName: "KYC Status",
        minWidth: 140,
        flex: 1,
        align: "center",
        headerAlign: "center",
        renderCell: (params) => {
          const status = params?.row?.kycStatus || "UNSUBMITTED";
          let color = "var(--admin-muted)";
          let bg = "var(--admin-soft)";
          if (status === "VERIFIED") {
            color = "var(--admin-success)";
            bg = "rgba(16, 185, 129, 0.08)";
          } else if (status === "SUBMITTED" || status === "PENDING") {
            color = "var(--admin-warning)";
            bg = "rgba(245, 158, 11, 0.08)";
          } else if (status === "REOPENED") {
            color = "var(--admin-danger)";
            bg = "rgba(239, 110, 110, 0.08)";
          }
          return <Badge color={color} bg={bg}>{status}</Badge>;
        },
      },
      {
        field: "__actions",
        headerName: "Actions",
        sortable: false,
        filterable: false,
        minWidth: 220,
        flex: 1.5,
        align: "center",
        headerAlign: "center",
        renderCell: (params) => {
          const r = params?.row || {};
          const status = r.kycStatus || "UNSUBMITTED";
          const isLoading = actionLoadingId === r.id;

          return (
            <div style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "center", height: "100%" }}>
              <button
                onClick={() => onViewKyc(r)}
                title="View KYC Details"
                className="admin-secondary-btn"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "6px 10px",
                  borderRadius: 8,
                  fontSize: 12,
                  minHeight: "30px",
                  cursor: "pointer",
                }}
              >
                <LuEye style={{ marginRight: 4 }} /> Details
              </button>

              {status !== "VERIFIED" && (
                <button
                  onClick={() => handleUpdateKycStatus(r, "VERIFIED")}
                  disabled={isLoading}
                  title="Approve KYC"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "6px 10px",
                    borderRadius: 8,
                    fontSize: 12,
                    background: "var(--admin-success)",
                    color: "#fff",
                    border: "none",
                    minHeight: "30px",
                    fontWeight: 600,
                    cursor: "pointer",
                    boxShadow: "0 2px 6px rgba(16, 185, 129, 0.15)",
                  }}
                >
                  <LuCheck style={{ marginRight: 4 }} /> Verify
                </button>
              )}

              {status !== "REOPENED" && status !== "UNSUBMITTED" && (
                <button
                  onClick={() => handleUpdateKycStatus(r, "REOPENED")}
                  disabled={isLoading}
                  title="Reject/Reopen KYC"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "6px 10px",
                    borderRadius: 8,
                    fontSize: 12,
                    background: "var(--admin-danger)",
                    color: "#fff",
                    border: "none",
                    minHeight: "30px",
                    fontWeight: 600,
                    cursor: "pointer",
                    boxShadow: "0 2px 6px rgba(239, 68, 68, 0.15)",
                  }}
                >
                  <LuX style={{ marginRight: 4 }} /> Reject
                </button>
              )}
            </div>
          );
        },
      },
    ],
    [onViewKyc, actionLoadingId]
  );

  // Client-side local data grid fetcher
  const fetcherKyc = useCallback(
    async ({ page, pageSize, search, ordering }) => {
      // 1. Filter local user records client side
      let filtered = (users || []).map((u) => ({
        ...u,
        kycStatus: u.kycStatus || "UNSUBMITTED",
      }));

      // Apply tab filters
      if (kycFilters.status) {
        filtered = filtered.filter((u) => u.kycStatus === kycFilters.status);
      }

      // Apply quick search and input search filter
      const textFilter = (search || kycFilters.user || "").trim().toLowerCase();
      if (textFilter) {
        filtered = filtered.filter(
          (u) =>
            String(u.id).toLowerCase().includes(textFilter) ||
            String(u.username || "").toLowerCase().includes(textFilter) ||
            String(u.fullName || "").toLowerCase().includes(textFilter) ||
            String(u.mobile || "").toLowerCase().includes(textFilter) ||
            String(u.email || "").toLowerCase().includes(textFilter)
        );
      }

      // Apply state filter
      if (kycFilters.state) {
        const sf = kycFilters.state.toLowerCase();
        filtered = filtered.filter((u) => String(u.state || "").toLowerCase().includes(sf));
      }

      // Apply pincode filter
      if (kycFilters.pincode) {
        const pf = kycFilters.pincode.toLowerCase();
        filtered = filtered.filter((u) => String(u.pinCode || "").toLowerCase().includes(pf));
      }

      // Apply sorting ordering
      if (ordering) {
        const desc = ordering.startsWith("-");
        const field = desc ? ordering.slice(1) : ordering;
        filtered.sort((a, b) => {
          let valA = a[field] ?? "";
          let valB = b[field] ?? "";
          if (typeof valA === "string") valA = valA.toLowerCase();
          if (typeof valB === "string") valB = valB.toLowerCase();

          if (valA < valB) return desc ? 1 : -1;
          if (valA > valB) return desc ? -1 : 1;
          return 0;
        });
      }

      // Calculate pagination slice
      const count = filtered.length;
      const start = (page - 1) * pageSize;
      const results = filtered.slice(start, start + pageSize);

      return { results, count };
    },
    [users, kycFilters, reloadKeyKyc]
  );

  const toolbar = (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: "13px", color: "var(--admin-text-light)", fontWeight: 500 }}>Density:</span>
        <div style={{ display: "inline-flex", border: "1px solid var(--admin-border)", borderRadius: 8, overflow: "hidden", background: "#fff" }}>
          {["comfortable", "standard", "compact"].map((d) => (
            <button
              key={d}
              onClick={() => setDensity(d)}
              style={{
                padding: "6px 12px",
                fontSize: 12,
                background: density === d ? "var(--admin-primary)" : "#fff",
                color: density === d ? "#fff" : "var(--admin-text)",
                border: 0,
                cursor: "pointer",
                fontWeight: 500,
                borderLeft: d !== "comfortable" ? "1px solid var(--admin-border)" : "none",
                textTransform: "capitalize",
              }}
            >
              {d}
            </button>
          ))}
        </div>
      </div>
      <button
        onClick={() => {
          loadAdminData();
          setReloadKeyKyc((k) => k + 1);
        }}
        className="admin-secondary-btn"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "8px 12px",
          borderRadius: 8,
          fontSize: 13,
          cursor: "pointer",
          fontWeight: 600,
        }}
      >
        <LuRefreshCcw size={14} /> Refresh
      </button>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Top Banner and Tabs */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", borderBottom: "1px solid var(--admin-border)", paddingBottom: "16px" }}>
        <div>
          <h2 style={{ margin: 0, color: "var(--admin-text)", fontSize: "20px", fontWeight: 700 }}>
            {viewMode === "kyc" ? "KYC Verification List" : "Nominee Management"}
          </h2>
          <div style={{ color: "var(--admin-muted)", fontSize: 13, marginTop: 4 }}>
            {viewMode === "kyc"
              ? "Review and verify customer bank information, ID documents, and account status."
              : "Review consumer nominee profiles and share allocations."}
          </div>
        </div>
        <div style={{ display: "inline-flex", border: "1px solid var(--admin-border)", borderRadius: 10, overflow: "hidden", background: "#fff", padding: "3px" }}>
          <button
            onClick={() => setViewMode("kyc")}
            style={{
              padding: "8px 16px",
              fontSize: 13,
              background: viewMode === "kyc" ? "var(--admin-primary)" : "#fff",
              color: viewMode === "kyc" ? "#fff" : "var(--admin-text)",
              border: 0,
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            KYC Lists
          </button>
          <button
            onClick={() => setViewMode("nominee")}
            style={{
              padding: "8px 16px",
              fontSize: 13,
              background: viewMode === "nominee" ? "var(--admin-primary)" : "#fff",
              color: viewMode === "nominee" ? "#fff" : "var(--admin-text)",
              border: 0,
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Nominees
          </button>
        </div>
      </div>

      {actionError && (
        <div className="admin-error" style={{ padding: "10px 14px", borderRadius: 8 }}>
          {actionError}
        </div>
      )}

      {/* View Content */}
      {viewMode === "kyc" ? (
        <>
          {/* KYC Filter Bar */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: 16,
              background: "var(--admin-bg)",
              padding: 16,
              borderRadius: 12,
              border: "1px solid var(--admin-border)",
            }}
          >
            <Select
              label="KYC Status"
              value={kycFilters.status}
              onChange={(v) => setKycF("status", v)}
              options={statusOptions}
            />
            <TextInput
              label="User Search"
              value={kycFilters.user}
              onChange={(v) => setKycF("user", v)}
              placeholder="ID / Name / Mobile"
            />
            <TextInput
              label="State"
              value={kycFilters.state}
              onChange={(v) => setKycF("state", v)}
              placeholder="Filter by state"
            />
            <TextInput
              label="Pincode"
              value={kycFilters.pincode}
              onChange={(v) => setKycF("pincode", v)}
              placeholder="Filter by pincode"
            />
          </div>

          {/* KYC DataTable */}
          <DataTable
            columns={columnsKyc}
            fetcher={fetcherKyc}
            density={density}
            toolbar={toolbar}
            checkboxSelection={false}
            instanceKey="kyc"
            extraKey={String(reloadKeyKyc) + "_" + String(users.length) + "_" + JSON.stringify(kycFilters)}
          />
        </>
      ) : (
        /* Nominee Placeholder matching standard theme */
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "60px 20px",
            background: "var(--admin-bg)",
            borderRadius: 12,
            border: "1px dashed var(--admin-border)",
            textAlign: "center",
          }}
        >
          <span style={{ fontSize: "40px", marginBottom: "12px" }}>📋</span>
          <h3 style={{ margin: "0 0 6px 0", color: "var(--admin-text)", fontSize: "16px", fontWeight: 600 }}>
            Nominee details are not active
          </h3>
          <p style={{ margin: 0, color: "var(--admin-muted)", fontSize: "13px", maxWidth: "360px" }}>
            Nominee management and registration records are not configured in the tri-consumer workspace.
          </p>
        </div>
      )}
    </div>
  );
}
