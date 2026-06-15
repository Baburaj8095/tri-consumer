import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { DataGrid } from "@mui/x-data-grid";

/**
 * Reusable client-side DataGrid wrapper.
 * Props:
 *  - columns: MUI DataGrid columns
 *  - fetcher: ({ page, pageSize, search, ordering }) => Promise<{ results, count }>
 *  - onRowEdit: (row) => void
 *  - density: "compact" | "standard" | "comfortable"
 *  - toolbar: ReactNode (rendered next to search)
 *  - checkboxSelection: boolean (default true to allow bulk actions)
 */
export default function DataTable({
  columns,
  fetcher,
  onRowEdit,
  density = "standard",
  toolbar,
  checkboxSelection = true,
  onSelectionChange,
  columnVisibilityModel,
  onColumnVisibilityModelChange,
  instanceKey,
  extraKey,
}) {
  const [rows, setRows] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 50 });
  const [sortModel, setSortModel] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [selection, setSelection] = useState([]);
  const searchRef = useRef("");
  const reqSeq = useRef(0);
  const inflightKeyRef = useRef(null);

  useEffect(() => {
    searchRef.current = search;
  }, [search]);

  // Debounce user typing before applying the search that triggers fetch
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchText), 300);
    return () => clearTimeout(t);
  }, [searchText]);

  const load = useCallback(async () => {
    if (loading) return;
    const mySeq = (reqSeq.current += 1);
    const ordering = sortModel[0]
      ? `${sortModel[0].sort === "desc" ? "-" : ""}${sortModel[0].field}`
      : undefined;
    const key = JSON.stringify({
      p: paginationModel.page,
      ps: paginationModel.pageSize,
      s: searchRef.current || "",
      o: ordering || "",
      x: extraKey || "",
    });
    if (inflightKeyRef.current === key) return;
    inflightKeyRef.current = key;
    setLoading(true);
    try {
      const { results, count } = await fetcher({
        page: paginationModel.page + 1,
        pageSize: paginationModel.pageSize,
        search: searchRef.current,
        ordering,
      });
      const normalized = (results || []).map((r) => {
        const fallbackId = r.id ?? r.pk ?? r.uuid ?? r._id ?? r.key ?? `${Math.random()}`;
        const fieldsObj = r && typeof r === "object" && r.fields && typeof r.fields === "object" ? r.fields : {};
        const dataObj = r && typeof r === "object" && r.data && typeof r.data === "object" ? r.data : {};
        return { ...fieldsObj, ...dataObj, ...r, id: fallbackId };
      });
      if (mySeq === reqSeq.current) {
        const baseIndex = (paginationModel.page || 0) * (paginationModel.pageSize || 0);
        const withIndex = normalized.map((row, i) => ({
          ...row,
          __slno: baseIndex + i + 1,
          __slnoPage: i + 1,
        }));
        setRows(withIndex);
        setRowCount(count || 0);
      }
    } catch (e) {
      // no-op
    } finally {
      if (mySeq === reqSeq.current) {
        setLoading(false);
        if (inflightKeyRef.current === key) {
          inflightKeyRef.current = null;
        }
      }
    }
  }, [fetcher, paginationModel, sortModel, search, extraKey]);

  useEffect(() => {
    setPaginationModel((m) => (m.page !== 0 ? { ...m, page: 0 } : m));
  }, [search, fetcher]);

  useEffect(() => {
    load();
  }, [load, instanceKey]);

  const deepGet = (obj, path) => {
    if (!obj || !path) return undefined;
    const parts = String(path).replace(/\[(\d+)\]/g, ".$1").split(".");
    let cur = obj;
    for (const p of parts) {
      if (cur == null) return undefined;
      cur = cur[p];
    }
    return cur;
  };

  const getFieldValue = (row, field) => {
    if (!row) return "";
    if (field === "__str__") return row.repr ?? row.__str__ ?? row.name ?? "";
    if (field === "id") return row.id ?? row.pk ?? row.uuid ?? row._id ?? row.key ?? "";
    let v = deepGet(row, field);
    if (v == null) v = deepGet(row.fields, field);
    if (v == null) v = deepGet(row.data, field);
    if (v == null) return "";
    if (typeof v === "object") return v.username || v.name || v.id || String(v);
    return v;
  };

  const safeColumns = useMemo(() => {
    return (columns || []).map((col) => {
      const base = { ...col };
      if (base && typeof base === "object") {
        if (!base.headerName) {
          base.headerName = String(base.field || "")
            .replace(/_/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase());
        }
        if (!base.valueGetter) {
          const f = String(base.field || "");
          if (f.startsWith("__")) {
            base.valueGetter = () => "";
          } else {
            base.valueGetter = (...args) => {
              try {
                if (args.length >= 2 && args[1] && typeof args[1] === "object" && !("row" in (args[0] || {}))) {
                  const [, row] = args;
                  return getFieldValue(row, base.field);
                }
                const params = args[0] || {};
                const row = params?.row || {};
                return getFieldValue(row, base.field);
              } catch {
                return args && args.length ? args[0] : "";
              }
            };
          }
        }
        if (!base.renderCell) {
          base.renderCell = (params) => {
            const row = params?.row || {};
            const v = getFieldValue(row, base.field);
            if (v == null || v === "") return "";
            return String(v);
          };
        }
        if (!base.valueFormatter) {
          base.valueFormatter = (...args) => {
            try {
              const v = args && args.length ? args[0] : undefined;
              if (v == null) return "";
              return typeof v === "object" ? (v?.username || v?.name || v?.id || JSON.stringify(v)) : String(v);
            } catch {
              return "";
            }
          };
        }
        if (base.flex == null && base.width == null && base.minWidth == null) {
          base.minWidth = 140;
          base.flex = 1;
        }
      }
      return base;
    });
  }, [columns]);

  const handlePaginationChange = useCallback((model) => {
    setPaginationModel((prev) => {
      if (prev.page === model.page && prev.pageSize === model.pageSize) return prev;
      return model;
    });
  }, []);

  const handleSortChange = useCallback((m) => {
    setSortModel((prev) => {
      const a = Array.isArray(prev) ? prev : [];
      const b = Array.isArray(m) ? m : [];
      const same =
        a.length === b.length &&
        ((a[0] && b[0] && a[0].field === b[0].field && a[0].sort === b[0].sort) || (!a[0] && !b[0]));
      return same ? prev : m;
    });
  }, []);

  return (
    <div className="tk-card tk-grid" style={{ width: "100%", background: "#ffffff", borderRadius: 12, border: "1px solid var(--admin-border)", overflowX: "auto", overflowY: "hidden", position: "relative", isolation: "isolate" }}>
      <div style={{ padding: "12px 16px", display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap", justifyContent: "space-between", borderBottom: "1px solid var(--admin-border)" }}>
        {toolbar}
        <input
          placeholder="Quick search..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="admin-search-input"
          style={{ padding: "8px 14px", width: "min(280px, 100%)", borderRadius: 8, border: "1px solid var(--admin-border)", backgroundColor: "#ffffff", outline: "none", fontSize: "13px" }}
        />
      </div>
      <DataGrid
        autoHeight
        rows={rows}
        columns={safeColumns}
        rowCount={rowCount}
        loading={loading}
        paginationMode="server"
        sortingMode="server"
        initialState={{ pagination: { paginationModel: { page: 0, pageSize: 50 } } }}
        pagination
        pageSizeOptions={[100, 50, 25, 10]}
        paginationModel={paginationModel}
        onPaginationModelChange={handlePaginationChange}
        onSortModelChange={handleSortChange}
        onRowDoubleClick={(p) => onRowEdit?.(p.row)}
        disableRowSelectionOnClick
        density={density}
        checkboxSelection={checkboxSelection}
        onRowSelectionModelChange={(m) => {
          setSelection(m);
          onSelectionChange?.(m);
        }}
        getRowId={(row) => row.id ?? row.pk ?? row.uuid ?? row._id ?? row.key}
        rowHeight={52}
        columnHeaderHeight={44}
        disableVirtualization
        columnVisibilityModel={columnVisibilityModel}
        onColumnVisibilityModelChange={onColumnVisibilityModelChange}
        sx={{
          fontFamily: "var(--admin-font)",
          border: "none",
          "& .MuiDataGrid-cell": {
            outline: "none !important",
            color: "var(--admin-text) !important",
            backgroundColor: "transparent",
            borderRight: "1px solid var(--admin-border)",
            display: "flex",
            alignItems: "center",
            fontSize: "13px",
          },
          "& .MuiDataGrid-cell--textCenter": { justifyContent: "center" },
          "& .MuiDataGrid-cellContent": { color: "var(--admin-text) !important" },
          "& .MuiDataGrid-columnHeaderTitle": { color: "var(--admin-text) !important", fontWeight: 600, fontSize: "13px" },
          "& .MuiDataGrid-columnHeaderTitleContainerContent": { color: "var(--admin-text) !important" },
          "&.MuiDataGrid-root": { backgroundColor: "#ffffff" },
          "& .MuiDataGrid-main": { backgroundColor: "#ffffff" },
          "& .MuiDataGrid-columnHeaders": { backgroundColor: "var(--admin-soft) !important", borderBottom: "1px solid var(--admin-border)" },
          "& .MuiDataGrid-virtualScroller": { backgroundColor: "#ffffff" },
          "& .MuiDataGrid-virtualScrollerContent": { backgroundColor: "#ffffff" },
          "& .MuiDataGrid-virtualScrollerRenderZone": { backgroundColor: "#ffffff" },
          "& .MuiDataGrid-row": { backgroundColor: "#ffffff" },
          "& .MuiDataGrid-footerContainer": { backgroundColor: "#ffffff", borderTop: "1px solid var(--admin-border)" },
          "& .MuiDataGrid-row:hover": { backgroundColor: "rgba(249, 115, 22, 0.04) !important" },
          "& .MuiDataGrid-row.Mui-hover": { backgroundColor: "rgba(249, 115, 22, 0.04) !important" },
          "& .MuiDataGrid-row.Mui-selected": { backgroundColor: "var(--admin-primary-light) !important", opacity: 0.95 },
          "& .MuiDataGrid-row.Mui-selected:hover": { backgroundColor: "var(--admin-primary-light) !important" },
          "& .MuiDataGrid-overlay": { backgroundColor: "#ffffff" },
          "& .MuiDataGrid-filler": { backgroundColor: "#ffffff" },
          "& .MuiDataGrid-row:nth-of-type(odd)": { backgroundColor: "#ffffff" },
          "& .MuiDataGrid-row:nth-of-type(even)": { backgroundColor: "rgba(249, 115, 22, 0.01)" },
          "& .MuiDataGrid-row": { borderBottom: "1px solid var(--admin-border)" },
          "& .MuiDataGrid-columnHeader": { borderRight: "1px solid var(--admin-border)", backgroundColor: "var(--admin-soft)" },
          "& .MuiDataGrid-columnHeader:last-of-type": { borderRight: "none" },
          "& .MuiDataGrid-cell:last-of-type": { borderRight: "none" }
        }}
      />
    </div>
  );
}
