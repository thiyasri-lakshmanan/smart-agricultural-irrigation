import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../firebase';

export function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Maps Firebase Auth error codes to user-friendly messages
  const getAuthErrorMessage = (err) => {
    switch (err.code) {
      case 'auth/email-already-in-use':
        return 'This email address is already registered. Please log in or use a different email.';
      case 'auth/weak-password':
        return 'Password is too weak. Please use at least 6 characters.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/operation-not-allowed':
        return 'Email/Password sign-in is not enabled in Firebase Console. Please enable Email/Password provider under Authentication -> Sign-in method in project smart-agricultural-eb686.';
      case 'auth/network-request-failed':
        return 'Network connection error. Please check your internet connection.';
      default:
        return err.message || 'Failed to create account. Please try again.';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { fullName, email, password, confirmPassword } = formData;

    // Frontend validations
    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      setError('Please fill out all required fields.');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password should be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      // 1. Create user with Firebase Auth in smart-agricultural-eb686
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);

      // 2. Save full name as displayName
      await updateProfile(userCredential.user, {
        displayName: fullName.trim(),
      });

      // Successful signup redirects to dashboard
      navigate('/');
    } catch (err) {
      console.error('Firebase registration error details:', err);
      setError(getAuthErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-logo">
          <i className="bi bi-person-plus-fill"></i>
        </div>
        <h3 className="text-center mb-1 fw-bold">Create AgriFlow Account</h3>
        <p className="text-center text-muted small mb-4">
          Register to monitor and schedule irrigation allocation
        </p>

        {error && (
          <div className="alert alert-danger py-2 px-3 small d-flex align-items-center gap-2 mb-3" role="alert">
            <i className="bi bi-exclamation-triangle-fill"></i>
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary">Full Name</label>
            <div className="input-group">
              <span className="input-group-text bg-light text-muted"><i className="bi bi-person"></i></span>
              <input
                type="text"
                name="fullName"
                className="form-control"
                placeholder="e.g. Ramesh Kumar"
                value={formData.fullName}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary">Email Address</label>
            <div className="input-group">
              <span className="input-group-text bg-light text-muted"><i className="bi bi-envelope"></i></span>
              <input
                type="email"
                name="email"
                className="form-control"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
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
                name="password"
                className="form-control"
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary">Confirm Password</label>
            <div className="input-group">
              <span className="input-group-text bg-light text-muted"><i className="bi bi-shield-check"></i></span>
              <input
                type="password"
                name="confirmPassword"
                className="form-control"
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={handleChange}
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
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <i className="bi bi-check2-circle"></i>
                <span>Register Account</span>
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-3 border-top small text-muted">
          Already registered?{' '}
          <Link to="/login" className="text-success text-decoration-none fw-semibold">
            Sign in to console
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Signup;
