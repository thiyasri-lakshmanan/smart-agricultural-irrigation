import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../firebase';

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Maps Firebase Auth error codes to user-friendly messages
  const getAuthErrorMessage = (err) => {
    switch (err.code) {
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Incorrect email or password. Please check your credentials.';
      case 'auth/too-many-requests':
        return 'Access to this account has been temporarily disabled due to many failed login attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network connection error. Please check your internet connection.';
      default:
        return err.message || 'Login failed. Please check your credentials.';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please fill in both email and password.');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      // Sign in with Firebase Auth
      await signInWithEmailAndPassword(auth, email.trim(), password);
      navigate('/');
    } catch (err) {
      console.error('Firebase login error details:', err);
      setError(getAuthErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Demo Login helper: attempts login, or creates the demo operator account if it doesn't exist yet
  const handleDemoLogin = async () => {
    const demoEmail = 'operator@agriflow.org';
    const demoPass = 'operator123';
    setError('');
    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, demoEmail, demoPass);
      navigate('/');
    } catch (err) {
      // If demo user does not exist in this Firebase project yet, create it automatically
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        try {
          const cred = await createUserWithEmailAndPassword(auth, demoEmail, demoPass);
          await updateProfile(cred.user, { displayName: 'Demo Operator' });
          navigate('/');
          return;
        } catch (createErr) {
          setError(getAuthErrorMessage(createErr));
        }
      } else {
        setError(getAuthErrorMessage(err));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-logo">
          <i className="bi bi-droplet-half"></i>
        </div>
        <h3 className="text-center mb-1 fw-bold">Welcome to AgriFlow</h3>
        <p className="text-center text-muted small mb-4">
          Smart Agricultural Irrigation & Water Allocation System
        </p>

        {error && (
          <div className="alert alert-danger py-2 px-3 small d-flex align-items-center gap-2 mb-3" role="alert">
            <i className="bi bi-exclamation-triangle-fill"></i>
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary">Email Address</label>
            <div className="input-group">
              <span className="input-group-text bg-light text-muted"><i className="bi bi-envelope"></i></span>
              <input
                type="email"
                className="form-control"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary">Password</label>
            <div className="input-group">
              <span className="input-group-text bg-light text-muted"><i className="bi bi-lock"></i></span>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-emerald w-100 py-2 fw-semibold mb-3 d-flex align-items-center justify-content-center gap-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <i className="bi bi-box-arrow-in-right"></i>
                <span>Sign In</span>
              </>
            )}
          </button>

          {/* Quick Demo Login Button */}
          <div className="text-center mb-3">
            <div className="text-muted small position-relative mb-3">
              <span className="bg-white px-2 text-uppercase fw-semibold" style={{ fontSize: '0.7rem' }}>College Review Demo</span>
              <hr className="my-0 position-absolute top-50 start-0 end-0 z-n1" />
            </div>
            <button
              type="button"
              onClick={handleDemoLogin}
              className="btn btn-outline-success w-100 py-2 small fw-semibold d-flex align-items-center justify-content-center gap-2"
              disabled={isLoading}
            >
              <i className="bi bi-play-circle-fill"></i>
              <span>Quick Demo Login (Operator Role)</span>
            </button>
            <small className="text-muted d-block mt-1">Instant Firebase Authentication</small>
          </div>
        </form>

        <div className="text-center pt-3 border-top small text-muted">
          Don't have an account?{' '}
          <Link to="/signup" className="text-success text-decoration-none fw-semibold">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
