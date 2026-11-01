import React from 'react';
import { NavLink } from 'react-router-dom';

// isAdmin is passed from App.jsx — derived from the `admins` Firestore collection.
// No email allowlist here; admin status is enforced server-side by Firestore rules.

export function Sidebar({ user, isAdmin, mobileOpen, setMobileOpen, sidebarCollapsed, onLogout }) {
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Operator';
  const email = user?.email || '';

  const navItems = [
    { to: '/', label: 'Dashboard', icon: 'bi-grid-1x2' },
    { to: '/fields', label: 'Field Management', icon: 'bi-flower1' },
    { to: '/requests', label: 'Irrigation Requests', icon: 'bi-water' },
    { to: '/allocation', label: 'Water Allocation', icon: 'bi-pie-chart' },
    { to: '/canals', label: 'Canal Network', icon: 'bi-diagram-3' },
    { to: '/history', label: 'Activity History', icon: 'bi-clock-history' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="mobile-backdrop d-lg-none"
          onClick={() => setMobileOpen(false)}
          aria-label="Close mobile sidebar backdrop"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        id="app-sidebar"
        className={`app-sidebar ${mobileOpen ? 'mobile-open' : ''} ${sidebarCollapsed ? 'collapsed' : ''}`}
      >
        <div className="sidebar-header d-flex align-items-center justify-content-between">
          <NavLink to="/" className="sidebar-brand">
            <i className="bi bi-droplet-half text-success fs-4"></i>
            <div>
              <span className="text-white">AgriFlow</span>
              <div className="text-white-50 small" style={{ fontSize: '0.72rem' }}>Smart Irrigation System</div>
            </div>
          </NavLink>
          <button
            id="sidebar-close-btn"
            className="btn btn-sm text-white d-lg-none"
            onClick={() => setMobileOpen(false)}
            aria-label="Close sidebar"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="px-3 pb-2 text-uppercase text-white-50" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>
            Main Navigation
          </div>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              <i className={`bi ${item.icon}`}></i>
              <span>{item.label}</span>
            </NavLink>
          ))}

          {/* Admin-only section */}
          {isAdmin && (
            <>
              <div className="px-3 pt-3 pb-2 text-uppercase text-white-50" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>
                Administration
              </div>
              <NavLink
                to="/admin"
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                <i className="bi bi-shield-lock"></i>
                <span>Request Fulfilment</span>
              </NavLink>
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="d-flex align-items-center justify-content-between text-white-50 mb-2">
            <span className="small">Logged in as:</span>
            <span className={`badge ${isAdmin ? 'bg-danger' : 'bg-success'} text-white`}>
              {isAdmin ? 'Admin' : 'Firebase Auth'}
            </span>
          </div>
          <div className="text-white small fw-semibold text-truncate mb-1">{displayName}</div>
          <div className="text-white-50 small text-truncate mb-3" style={{ fontSize: '0.78rem' }}>{email}</div>
          <button
            onClick={onLogout}
            className="btn btn-outline-light btn-sm w-100 d-flex align-items-center justify-content-center gap-2"
          >
            <i className="bi bi-box-arrow-right"></i>
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
