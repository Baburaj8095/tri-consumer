
const fs = require("fs");
const path = "C:\\\\Users\\\\Baburaj\\\\Desktop\\\\Trikonekt\\\\trikonekt-marketing\\\\tri-consumer\\\\frontend\\\\src\\\\pages\\\\admin\\\\admin.css";
let content = fs.readFileSync(path, "utf8");

// Change orange to blue
content = content.replace(/#f97316/g, "#2563eb");
content = content.replace(/#ea580c/g, "#1d4ed8");
content = content.replace(/#fff7ed/g, "#eff6ff");
content = content.replace(/#ffedd5/g, "#dbeafe");
content = content.replace(/#c2410c/g, "#1e40af");

// Change specific instances of old classes
content = content.replace(
  "background: #ea580c;",
  "background: #2563eb;"
);

// Append missing responsive utilities and bottom nav
const appendStr = `

/* ==========================================================================
   Admin Mobile Responsive UI
   ========================================================================= */

.md\\:hidden {
  display: none !important;
}

@media (max-width: 768px) {
  .md\\:hidden {
    display: flex !important;
  }
}

/* Bottom Navigation Bar for Mobile */
.admin-bottom-nav {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #ffffff;
  border-top: 1px solid #e2e8f0;
  padding: 8px 16px;
  padding-bottom: calc(8px + env(safe-area-inset-bottom, 0px));
  z-index: 50;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.05);
}

.admin-bottom-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  color: #64748b;
  font-size: 10px;
  font-weight: 600;
  padding: 4px 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.admin-bottom-nav-item.active {
  color: #2563eb;
}

@media (max-width: 768px) {
  /* Ensure no horizontal page overflow */
  body, html {
    overflow-x: hidden;
  }
  
  .admin-main-content-inner {
    padding: 16px 12px;
    padding-bottom: 80px; /* Space for bottom nav */
  }

  .admin-bottom-nav {
    display: flex;
  }

  /* Header icons reduction */
  .admin-header-icons {
    gap: 8px;
  }
  .admin-header-icon-btn {
    width: 32px;
    height: 32px;
  }
  
  .admin-header-icon-btn svg {
    width: 16px;
    height: 16px;
  }

  .admin-main-title {
    font-size: 20px;
  }

  /* Convert statistics cards to horizontally scrollable compact cards */
  .admin-summary-grid {
    display: flex !important;
    flex-wrap: nowrap;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    gap: 12px;
    padding-bottom: 8px;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }
  
  .admin-summary-grid::-webkit-scrollbar {
    display: none;
  }
  
  .admin-metric {
    min-width: 220px;
    flex-shrink: 0;
    scroll-snap-align: start;
  }

  /* Make data table horizontally scrollable */
  .admin-card-table-wrap {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  
  .admin-modern-table {
    min-width: 800px; /* Forces scroll on small devices */
  }

  /* Reduce space in search bar */
  .admin-search-filter-bar {
    padding: 12px;
    gap: 12px;
  }
  
  .admin-search-filter-bar > div:last-child {
    flex-wrap: wrap;
    justify-content: flex-start;
  }
  
  /* Pagination responsiveness */
  .admin-pagination-bar {
    flex-direction: column;
    gap: 12px;
    align-items: center;
  }

  /* Hide sidebar on mobile in favor of drawer overlay */
  .admin-sidebar {
    position: fixed;
    z-index: 100;
    transform: translateX(-100%);
    transition: transform 0.3s ease-in-out;
  }
  
  .admin-sidebar.open {
    transform: translateX(0);
  }

  .admin-sidebar-overlay {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.4);
    z-index: 90;
    backdrop-filter: blur(4px);
  }
}

@media (max-width: 768px) {
  /* Mobile card layout for the table */
  .admin-card-table-wrap { overflow-x: visible; }
  .admin-modern-table { min-width: 100%; display: block; }
  .admin-modern-table thead { display: none; }
  .admin-modern-table tbody, .admin-modern-table tr, .admin-modern-table td { display: block; width: 100%; }
  .admin-modern-table tr { margin-bottom: 16px; border: 1px solid #e2e8f0; border-radius: 8px; background: #fff; padding: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
  .admin-modern-table td { border: none; border-bottom: 1px solid #f1f5f9; padding: 8px 0; position: relative; padding-left: 45%; text-align: right; min-height: 38px; display: flex; justify-content: flex-end; align-items: center; }
  .admin-modern-table td:last-child { border-bottom: none; }
  .admin-modern-table td::before { content: attr(data-label); position: absolute; left: 0; top: 50%; transform: translateY(-50%); width: 40%; text-align: left; font-weight: 600; font-size: 13px; color: #64748b; }
  .admin-modern-table td > div { max-width: 100%; text-align: right; }
}

`;

fs.writeFileSync(path, content + appendStr, "utf8");
console.log("admin.css updated successfully.");
