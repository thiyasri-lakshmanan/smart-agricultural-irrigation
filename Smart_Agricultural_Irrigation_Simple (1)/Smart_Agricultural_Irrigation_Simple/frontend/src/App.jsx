import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';
import { useAdminStatus } from './hooks/useAdminStatus';

// Layout Components
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';

// Pages
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Dashboard } from './pages/Dashboard';
import { Fields } from './pages/Fields';
import { Requests } from './pages/Requests';
import { Allocation } from './pages/Allocation';
import { Canals } from './pages/Canals';
import { History } from './pages/History';
import { AdminRequests } from './pages/AdminRequests';

export function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Derive admin status from the `admins` Firestore collection (server-enforced).
  // isAdmin is false until the doc is confirmed to exist — safe default.
  const { isAdmin, adminLoading } = useAdminStatus(currentUser?.uid ?? null);

  // Auto-close mobile overlay if screen is resized to desktop width
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 992) {
        setMobileOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Monitor Firebase Authentication State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Handle Firebase Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Toggle sidebar on desktop (collapse/expand) and mobile (open/close overlay)
  const handleToggleSidebar = () => {
    if (window.innerWidth < 992) {
      setMobileOpen((prev) => !prev);
    } else {
      setSidebarCollapsed((prev) => !prev);
    }
  };

  // Simple loading state while Firebase checks authentication on startup / refresh
  if (loading || (currentUser && adminLoading)) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center vh-100 bg-light">
        <div className="spinner-border text-success mb-3" style={{ width: '3rem', height: '3rem' }} role="status">
          <span className="visually-hidden">Loading authentication...</span>
        </div>
        <h5 className="fw-semibold text-dark mb-1">AgriFlow Smart Irrigation</h5>
        <p className="text-muted small">Checking Firebase Authentication session...</p>
      </div>
    );
  }

  // Protected Layout Wrapper: redirects unauthenticated users to /login
  const ProtectedLayout = ({ children }) => {
    if (!currentUser) {
      return <Navigate to="/login" replace />;
    }

    return (
      <div className="main-wrapper">
        <Sidebar
          user={currentUser}
          isAdmin={isAdmin}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
          sidebarCollapsed={sidebarCollapsed}
          onLogout={handleLogout}
        />
        <div className="content-area">
          <Navbar
            user={currentUser}
            onToggleSidebar={handleToggleSidebar}
            onLogout={handleLogout}
          />
          <main className="flex-grow-1">
            {children}
          </main>
        </div>
      </div>
    );
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Authentication Routes */}
        <Route
          path="/login"
          element={
            currentUser ? (
              <Navigate to="/" replace />
            ) : (
              <Login />
            )
          }
        />
        <Route
          path="/signup"
          element={
            currentUser ? (
              <Navigate to="/" replace />
            ) : (
              <Signup />
            )
          }
        />

        {/* Protected Dashboard & Management Routes */}
        <Route
          path="/"
          element={
            <ProtectedLayout>
              <Dashboard user={currentUser} />
            </ProtectedLayout>
          }
        />
        <Route
          path="/fields"
          element={
            <ProtectedLayout>
              <Fields />
            </ProtectedLayout>
          }
        />
        <Route
          path="/requests"
          element={
            <ProtectedLayout>
              <Requests user={currentUser} />
            </ProtectedLayout>
          }
        />
        <Route
          path="/allocation"
          element={
            <ProtectedLayout>
              <Allocation />
            </ProtectedLayout>
          }
        />
        <Route
          path="/canals"
          element={
            <ProtectedLayout>
              <Canals />
            </ProtectedLayout>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedLayout>
              <History user={currentUser} />
            </ProtectedLayout>
          }
        />

        {/* Fallback wildcard route */}
        <Route path="*" element={<Navigate to="/" replace />} />

        {/* Admin: request fulfillment management */}
        <Route
          path="/admin"
          element={
            <ProtectedLayout>
              <AdminRequests user={currentUser} isAdmin={isAdmin} />
            </ProtectedLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
