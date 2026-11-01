import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

// ── Fulfillment badge ─────────────────────────────────────────────────────────
function FulfillmentBadge({ status }) {
  const cfg = {
    'Satisfied':           'bg-success text-white',
    'Partially Satisfied': 'bg-warning text-dark',
    'Not Satisfied':       'bg-danger text-white',
    'Pending':             'bg-info text-dark',
  };
  const cls = cfg[status] ?? 'bg-secondary text-white';
  return <span className={`badge ${cls}`}>{status ?? 'Pending'}</span>;
}

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = {
    'Approved':      'bg-success-subtle text-success border border-success-subtle',
    'Rejected':      'bg-danger-subtle text-danger border border-danger-subtle',
    'Completed':     'bg-primary-subtle text-primary border border-primary-subtle',
    'Pending Review':'bg-info-subtle text-info border border-info-subtle',
  };
  const cls = cfg[status] ?? 'bg-secondary-subtle text-secondary';
  return <span className={`badge ${cls}`}>{status ?? '—'}</span>;
}

// ── Format Firestore Timestamp ────────────────────────────────────────────────
function formatDate(ts) {
  if (!ts) return '—';
  try { return ts.toDate().toLocaleString(); }
  catch { return String(ts); }
}

export function History({ user }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Live listener so history auto-updates when admin changes a request
  useEffect(() => {
    const uid = user?.uid || auth.currentUser?.uid;
    if (!uid) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'irrigationRequests'),
      where('userId', '==', uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        // Newest first
        docs.sort((a, b) => {
          const ta = a.createdAt?.toMillis?.() ?? 0;
          const tb = b.createdAt?.toMillis?.() ?? 0;
          return tb - ta;
        });
        setRequests(docs);
        setLoading(false);
        setErrorMsg('');
      },
      (err) => {
        console.error('History listener error:', err);
        setErrorMsg('Failed to load history. Please try refreshing the page.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-2">
        <div>
          <h2 className="mb-1">Irrigation Request History</h2>
          <p className="text-muted small mb-0">
            Your personal irrigation request log — updated live from Firestore
          </p>
        </div>
        <span className="badge bg-light text-secondary border px-3 py-2">
          <i className="bi bi-clock-history me-1"></i>
          {loading ? '…' : requests.length} Records
        </span>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="alert alert-danger d-flex align-items-center gap-2 mb-4" role="alert">
          <i className="bi bi-exclamation-triangle-fill fs-5"></i>
          <div>{errorMsg}</div>
        </div>
      )}

      {/* History Table Card */}
      <div className="custom-card">
        <div className="card-header-clean">
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-journal-text text-success fs-5"></i>
            <span className="fw-semibold">Your Irrigation Requests</span>
          </div>
          <span className="badge bg-secondary-subtle text-secondary">
            Live from Firestore
          </span>
        </div>
        <div className="table-responsive">
          {loading ? (
            <div className="d-flex align-items-center justify-content-center py-5 gap-2 text-muted">
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              <span>Loading history…</span>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-inbox fs-2 d-block mb-2"></i>
              <p className="mb-1 fw-semibold">No history yet.</p>
              <p className="small mb-0">Submit your first irrigation request to see it here.</p>
            </div>
          ) : (
            <table className="table table-custom table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th scope="col">Request ID</th>
                  <th scope="col">Field</th>
                  <th scope="col">Crop</th>
                  <th scope="col">Request Type</th>
                  <th scope="col">Water Requested</th>
                  <th scope="col">Water Approved</th>
                  <th scope="col">Water Delivered</th>
                  <th scope="col">Date</th>
                  <th scope="col">Status</th>
                  <th scope="col">Fulfillment</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <span className="badge bg-dark-subtle text-dark fw-bold px-2 py-1">
                        {item.id.slice(0, 8)}…
                      </span>
                    </td>
                    <td>
                      <span className="fw-semibold text-dark">{item.fieldId ?? '—'}</span>
                      {item.farmerName && (
                        <div className="text-muted small">{item.farmerName}</div>
                      )}
                    </td>
                    <td>
                      <span className="text-dark">{item.cropName ?? '—'}</span>
                    </td>
                    <td>
                      {item.requestType?.toLowerCase().includes('drought') ? (
                        <span className="badge bg-danger text-white">{item.requestType}</span>
                      ) : (
                        <span className="badge bg-primary-subtle text-primary border border-primary-subtle">
                          {item.requestType ?? '—'}
                        </span>
                      )}
                    </td>
                    <td>
                      <span className="fw-bold">{item.waterRequired?.toLocaleString() ?? '—'}</span>
                      <span className="text-muted small"> L</span>
                    </td>
                    <td>
                      {/* approvedWater may be absent on older docs */}
                      <span className={`fw-bold ${(item.approvedWater ?? 0) > 0 ? 'text-primary' : 'text-muted'}`}>
                        {(item.approvedWater ?? 0).toLocaleString()}
                      </span>
                      <span className="text-muted small"> L</span>
                    </td>
                    <td>
                      {/* waterDelivered may be missing on older docs — default 0 */}
                      <span className={`fw-bold ${(item.waterDelivered ?? 0) > 0 ? 'text-success' : 'text-muted'}`}>
                        {(item.waterDelivered ?? 0).toLocaleString()}
                      </span>
                      <span className="text-muted small"> L</span>
                    </td>
                    <td>
                      <div className="small fw-semibold text-dark">{formatDate(item.createdAt)}</div>
                      {item.completedAt && (
                        <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                          Completed: {formatDate(item.completedAt)}
                        </div>
                      )}
                    </td>
                    <td>
                      <StatusBadge status={item.status} />
                    </td>
                    <td>
                      <FulfillmentBadge status={item.fulfillmentStatus} />
                      {/* Contextual note for the farmer */}
                      {item.fulfillmentStatus === 'Partially Satisfied' && item.waterDelivered > 0 && (
                        <div className="text-warning small mt-1" style={{ fontSize: '0.72rem' }}>
                          {item.waterDelivered?.toLocaleString()} / {item.waterRequired?.toLocaleString()} L
                        </div>
                      )}
                      {item.status === 'Rejected' && (
                        <div className="text-danger small mt-1" style={{ fontSize: '0.72rem' }}>Request rejected</div>
                      )}
                      {item.status === 'Approved' && item.fulfillmentStatus === 'Pending' && (
                        <div className="text-success small mt-1" style={{ fontSize: '0.72rem' }}>Awaiting delivery</div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default History;
