
const fs = require("fs");
const path = "C:\\\\Users\\\\Baburaj\\\\Desktop\\\\Trikonekt\\\\trikonekt-marketing\\\\tri-consumer\\\\frontend\\\\src\\\\pages\\\\admin\\\\AdminDashboard.jsx";

const content = fs.readFileSync(path, "utf-8");

const startComment = "      {/* Table wrapping */}";
const endComment = "  );\n}\n\nfunction AdminsTable";

const startIndex = content.indexOf(startComment);
const endIndex = content.indexOf(endComment);

if (startIndex === -1 || endIndex === -1) {
  console.log("Failed to find boundaries.", startIndex, endIndex);
  process.exit(1);
}

// capture everything from table wrapping to the end of UsersTable
const oldChunk = content.substring(startIndex, endIndex);

const tableWrapStart = oldChunk.indexOf("<div className=\"admin-card-table-wrap\">");
const paginationStart = oldChunk.indexOf("{/* Pagination controls */}");

const tableCode = oldChunk.substring(tableWrapStart, paginationStart).trim();

const replacement = `      {/* Table wrapping */}
      {!isMobile ? (
        ${tableCode.replace(/\n/g, "\n        ")}
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
                  <span className={\`admin-kyc-badge kyc-\${(user.kycStatus || "UNSUBMITTED").toLowerCase()}\`}>
                    KYC: {user.kycStatus || "UNSUBMITTED"}
                  </span>
                  <span className={\`admin-active-toggle-btn \${user.accountActive ? "active" : "inactive"}\`}>
                    Account: {user.accountActive ? "Active" : "Inactive"}
                  </span>
                  <span className={\`admin-block-toggle-btn \${user.status === "ACTIVE" ? "unblocked" : "blocked"}\`}>
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
                      <span>{user.bankAccountNumber ? \`\${user.bankName} - \${user.bankAccountNumber}\` : "None"}</span>
                    </div>
                    <div className="mobile-detail-row">
                      <span className="mobile-detail-label">Address</span>
                      <span>{user.address ? \`\${user.address}, \` : ""}{user.district || ""}, {user.state || ""} {user.pinCode || ""}</span>
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
                  className={\`admin-pagination-btn \${currentPage === pageNum ? "active" : ""}\`}
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

function AdminsTable`;

const newContent = content.substring(0, startIndex) + replacement + content.substring(endIndex + endComment.length);

fs.writeFileSync(path, newContent, "utf-8");
console.log("Successfully replaced UsersTable logic");
