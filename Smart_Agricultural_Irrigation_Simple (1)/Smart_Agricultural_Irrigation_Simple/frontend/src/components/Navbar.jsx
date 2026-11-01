import React from 'react';

export function Navbar({ user, onToggleSidebar, onLogout }) {
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Operator';
  const email = user?.email || 'operator@agriflow.org';

  return (
    <header className="app-navbar d-flex align-items-center justify-content-between px-3 px-lg-4">
      <div className="d-flex align-items-center gap-3">
        {/* Working Sidebar Toggle Button (Desktop & Mobile) */}
        <button
          id="sidebar-toggle-btn"
          className="btn btn-outline-secondary btn-sm d-flex align-items-center justify-content-center p-2"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
          title="Toggle sidebar"
        >
          <i className="bi bi-list fs-5 lh-1"></i>
        </button>
        <div>
          <span className="fw-semibold text-dark">AgriFlow Management Console</span>
        </div>
      </div>

      <div className="d-flex align-items-center gap-3">
        {/* Reservoir Telemetry Quick Badge */}
        <div className="d-none d-sm-flex align-items-center gap-2 px-3 py-1 bg-light rounded border">
          <i className="bi bi-droplet-fill text-success"></i>
          <span className="small text-muted">Reservoir Level:</span>
          <span className="small fw-semibold text-dark">18,000 L</span>
          <span className="badge bg-success-subtle text-success ms-1">45%</span>
        </div>

        {/* User Profile Badge */}
        <div className="dropdown">
          <button
            className="btn btn-outline-success btn-sm dropdown-toggle d-flex align-items-center gap-2"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <i className="bi bi-person-circle"></i>
            <span className="d-none d-md-inline">{displayName}</span>
          </button>
          <ul className="dropdown-menu dropdown-menu-end shadow-sm">
            <li><h6 className="dropdown-header">Firebase User Profile</h6></li>
            <li><span className="dropdown-item-text fw-semibold small">{displayName}</span></li>
            <li><span className="dropdown-item-text text-muted small">{email}</span></li>
            <li><hr className="dropdown-divider" /></li>
            <li>
              <button className="dropdown-item text-danger d-flex align-items-center gap-2" onClick={onLogout}>
                <i className="bi bi-box-arrow-right"></i>
                <span>Logout</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
