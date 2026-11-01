
import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
  query,
} from 'firebase/firestore';

const FULFILLMENT_OPTIONS = [
  'Satisfied',
  'Partially Satisfied',
  'Not Satisfied',
];

function FulfillmentBadge({ status }) {
  const cfg = {
    'Satisfied': 'bg-success text-white',
    'Partially Satisfied': 'bg-warning text-dark',
    'Not Satisfied': 'bg-danger text-white',
    'Pending': 'bg-info text-dark',
  };

  return (
    <span className={`badge ${cfg[status] ?? 'bg-secondary text-white'}`}>
      {status ?? 'Pending'}
    </span>
  );
}

function StatusBadge({ status }) {
  const cfg = {
    'Pending': 'bg-info text-dark',
    'Pending Review': 'bg-info text-dark',
    'Approved': 'bg-success',
    'Rejected': 'bg-danger',
    'Completed': 'bg-primary',
  };

  return (
    <span className={`badge ${cfg[status] ?? 'bg-secondary'}`}>
      {status ?? '—'}
    </span>
  );
}

function formatDate(ts) {
  if (!ts) return '—';

  try {
    return ts.toDate().toLocaleString();
  } catch {
    return '—';
  }
}

export function AdminRequests({ user, isAdmin }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');
  const [savingId, setSavingId] = useState(null);
  const [edits, setEdits] = useState({});

  const currentEmail = user?.email || auth.currentUser?.email || '';

  // Listen to live farmer requests
  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'irrigationRequests'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        docs.sort(
          (a, b) =>
            (b.createdAt?.toMillis?.() ?? 0) -
            (a.createdAt?.toMillis?.() ?? 0)
        );

        setRequests(docs);
        setLoading(false);

        setEdits((prev) => {
          const next = { ...prev };

          docs.forEach((d) => {
            if (!next[d.id]) {
              next[d.id] = {
                approvedWater: String(
                  d.approvedWater ?? d.waterRequired ?? 0
                ),
                waterDelivered: String(d.waterDelivered ?? 0),
                fulfillmentChoice:
                  d.fulfillmentStatus &&
                  d.fulfillmentStatus !== 'Pending'
                    ? d.fulfillmentStatus
                    : 'Satisfied',
              };
            }
          });

          return next;
        });
      },
      (err) => {
        console.error('Admin Firestore error:', err);
        setErrorMsg(
          'Failed to load requests. Check Firestore rules and admin access.'
        );
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [isAdmin]);

  const setEdit = (docId, field, value) => {
    setEdits((prev) => ({
      ...prev,
      [docId]: {
        ...prev[docId],
        [field]: value,
      },
    }));
  };

  // APPROVE
  const handleApprove = async (req) => {
    const edit = edits[req.id] ?? {};
    const approvedWater = Number(
      edit.approvedWater ?? req.waterRequired ?? 0
    );
    const waterRequired = Number(req.waterRequired ?? 0);

    if (
      !Number.isFinite(approvedWater) ||
      approvedWater <= 0
    ) {
      setErrorMsg('Enter a valid approved water quantity greater than 0.');
      return;
    }

    if (approvedWater > waterRequired) {
      setErrorMsg('Approved water cannot exceed requested water.');
      return;
    }

    setSavingId(req.id);
    setErrorMsg('');
    setSaveSuccess('');

    try {
      await updateDoc(doc(db, 'irrigationRequests', req.id), {
        status: 'Approved',
        approvedWater,
        fulfillmentStatus: 'Pending',
        completedAt: null,
      });

      setSaveSuccess(
        `Request approved for ${approvedWater.toLocaleString()} L.`
      );
    } catch (err) {
      console.error(err);
      setErrorMsg(`Approve failed: ${err.message}`);
    } finally {
      setSavingId(null);
    }
  };

  // REJECT
  const handleReject = async (req) => {
    if (
      !window.confirm(
        'Are you sure you want to reject this farmer request?'
      )
    ) {
      return;
    }

    setSavingId(req.id);
    setErrorMsg('');
    setSaveSuccess('');

    try {
      await updateDoc(doc(db, 'irrigationRequests', req.id), {
        status: 'Rejected',
        fulfillmentStatus: 'Not Satisfied',
        waterDelivered: 0,
        approvedWater: 0,
        completedAt: serverTimestamp(),
        fulfilledBy: auth.currentUser?.uid ?? null,
      });

      setSaveSuccess('Farmer request rejected.');
    } catch (err) {
      console.error(err);
      setErrorMsg(`Reject failed: ${err.message}`);
    } finally {
      setSavingId(null);
    }
  };

  // FINALIZE FULFILLMENT
  const handleFinalize = async (req) => {
    const edit = edits[req.id] ?? {};
    const choice = edit.fulfillmentChoice ?? 'Satisfied';

    const waterRequired = Number(req.waterRequired ?? 0);
    const approvedWater = Number(
      req.approvedWater ?? edit.approvedWater ?? 0
    );

    const waterDelivered =
      choice === 'Not Satisfied'
        ? 0
        : Number(edit.waterDelivered ?? 0);

    if (
      !Number.isFinite(waterDelivered) ||
      waterDelivered < 0
    ) {
      setErrorMsg('Enter a valid delivered water quantity.');
      return;
    }

    if (waterDelivered > waterRequired) {
      setErrorMsg('Delivered water cannot exceed requested water.');
      return;
    }

    if (
      choice === 'Satisfied' &&
      waterDelivered !== waterRequired
    ) {
      setErrorMsg(
        `For Satisfied, enter the full requested quantity: ${waterRequired.toLocaleString()} L.`
      );
      return;
    }

    if (
      choice === 'Partially Satisfied' &&
      (waterDelivered <= 0 || waterDelivered >= waterRequired)
    ) {
      setErrorMsg(
        'For Partially Satisfied, delivered water must be greater than 0 and less than requested water.'
      );
      return;
    }

    if (
      !window.confirm(
        `Finalize as ${choice} with ${waterDelivered.toLocaleString()} L delivered?`
      )
    ) {
      return;
    }

    setSavingId(req.id);
    setErrorMsg('');
    setSaveSuccess('');

    try {
      await updateDoc(doc(db, 'irrigationRequests', req.id), {
        status: 'Completed',
        fulfillmentStatus: choice,
        waterDelivered,
        approvedWater: approvedWater || waterRequired,
        completedAt: serverTimestamp(),
        fulfilledBy: auth.currentUser?.uid ?? null,
      });

      setSaveSuccess(
        `Request finalized as ${choice}. ${waterDelivered.toLocaleString()} L delivered.`
      );
    } catch (err) {
      console.error(err);
      setErrorMsg(`Finalize failed: ${err.message}`);
    } finally {
      setSavingId(null);
    }
  };

  // ACCESS CHECK
  if (!isAdmin) {
    return (
      <div className="page-container">
        <div className="alert alert-danger mt-4">
          <strong>Access Denied.</strong>
          <div>Only the designated administrator can access this page.</div>
          <div className="small mt-1">
            Logged in as: {currentEmail || 'Not logged in'}
          </div>
        </div>
      </div>
    );
  }

  // STATISTICS
  const stats = {
    total: requests.length,
    pending: requests.filter(
      (r) =>
        r.status === 'Pending' ||
        r.status === 'Pending Review'
    ).length,
    approved: requests.filter(
      (r) => r.status === 'Approved'
    ).length,
    completed: requests.filter(
      (r) => r.status === 'Completed'
    ).length,
    rejected: requests.filter(
      (r) => r.status === 'Rejected'
    ).length,
  };

  return (
    <div className="page-container">

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-2">
        <div>
          <h2 className="mb-1">Admin — Request Fulfilment Management</h2>
          <p className="text-muted small mb-0">
            Approve, reject and record water delivery for farmer requests.
          </p>
        </div>

        <span className="badge bg-danger px-3 py-2">
          <i className="bi bi-shield-lock-fill me-1"></i>
          Admin Access
        </span>
      </div>

      {saveSuccess && (
        <div className="alert alert-success alert-dismissible fade show">
          {saveSuccess}
          <button
            type="button"
            className="btn-close"
            onClick={() => setSaveSuccess('')}
          ></button>
        </div>
      )}

      {errorMsg && (
        <div className="alert alert-danger alert-dismissible fade show">
          {errorMsg}
          <button
            type="button"
            className="btn-close"
            onClick={() => setErrorMsg('')}
          ></button>
        </div>
      )}

      {!loading && (
        <div className="row g-3 mb-4">
          {[
            { label: 'Total', val: stats.total, cls: 'stat-icon-blue', icon: 'bi-stack' },
            { label: 'Pending', val: stats.pending, cls: 'stat-icon-amber', icon: 'bi-hourglass-split' },
            { label: 'Approved', val: stats.approved, cls: 'stat-icon-green', icon: 'bi-check-circle' },
            { label: 'Completed', val: stats.completed, cls: 'stat-icon-blue', icon: 'bi-check2-all' },
            { label: 'Rejected', val: stats.rejected, cls: 'stat-icon-red', icon: 'bi-x-circle' },
          ].map(({ label, val, cls, icon }) => (
            <div key={label} className="col-6 col-sm-4 col-lg-2">
              <div className="stat-card py-3">
                <div>
                  <div
                    className="text-muted small fw-semibold text-uppercase"
                    style={{ fontSize: '0.72rem' }}
                  >
                    {label}
                  </div>
                  <h4 className="mb-0 mt-1 fw-bold">{val}</h4>
                </div>
                <div className={`stat-icon-wrapper ${cls}`}>
                  <i className={`bi ${icon}`}></i>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="custom-card">
        <div className="card-header-clean">
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-clipboard-check text-success fs-5"></i>
            <span className="fw-semibold">All Irrigation Requests</span>
          </div>
          <span className="badge bg-secondary-subtle text-secondary">
            {requests.length} Records
          </span>
        </div>

        <div className="table-responsive">
          {loading ? (
            <div className="text-center py-5 text-muted">
              Loading requests...
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-inbox fs-2 d-block mb-2"></i>
              No irrigation requests submitted yet.
            </div>
          ) : (
            <table className="table table-custom table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Farmer / Land</th>
                  <th>Crop</th>
                  <th>Requested</th>
                  <th>Approved (L)</th>
                  <th>Submitted</th>
                  <th>Status</th>
                  <th>Fulfillment</th>
                  <th style={{ minWidth: '320px' }}>Fulfil / Actions</th>
                </tr>
              </thead>

              <tbody>
                {requests.map((req) => {
                  const edit = edits[req.id] ?? {
                    approvedWater: String(req.waterRequired ?? 0),
                    waterDelivered: '0',
                    fulfillmentChoice: 'Satisfied',
                  };

                  const isSaving = savingId === req.id;

                  const isPending =
                    req.status === 'Pending' ||
                    req.status === 'Pending Review';

                  const isApproved = req.status === 'Approved';

                  const isFinal =
                    req.status === 'Completed' ||
                    req.status === 'Rejected';

                  const choice =
                    edit.fulfillmentChoice ?? 'Satisfied';

                  return (
                    <tr key={req.id}>
                      <td>
                        <span className="badge bg-dark-subtle text-dark fw-bold px-2 py-1">
                          {req.id.slice(0, 8)}…
                        </span>
                      </td>

                      <td>
                        <div className="fw-semibold text-dark">
                          {req.farmerName || '—'}
                        </div>
                        <div className="text-muted small">
                          {req.acres ?? '—'} Acres
                        </div>
                      </td>

                      <td>
                        <span className="text-dark">
                          {req.crop || req.cropName || '—'}
                        </span>
                      </td>

                      <td>
                        <span className="fw-bold">
                          {Number(req.waterRequired ?? 0).toLocaleString()}
                        </span>
                        <span className="text-muted small"> L</span>
                      </td>

                      <td style={{ minWidth: '110px' }}>
                        {isFinal ? (
                          <span className="fw-bold text-muted">
                            {Number(req.approvedWater ?? 0).toLocaleString()} L
                          </span>
                        ) : (
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            min="0"
                            max={req.waterRequired}
                            step="500"
                            value={edit.approvedWater}
                            disabled={isSaving || isApproved}
                            onChange={(e) =>
                              setEdit(req.id, 'approvedWater', e.target.value)
                            }
                          />
                        )}
                      </td>

                      <td>
                        <div className="small text-muted">
                          {formatDate(req.createdAt)}
                        </div>
                      </td>

                      <td>
                        <StatusBadge status={req.status} />
                      </td>

                      <td>
                        <FulfillmentBadge status={req.fulfillmentStatus} />
                        {req.completedAt && (
                          <div
                            className="text-muted mt-1"
                            style={{ fontSize: '0.7rem' }}
                          >
                            {formatDate(req.completedAt)}
                          </div>
                        )}
                      </td>

                      <td>
                        {/* PENDING: APPROVE / REJECT */}
                        {isPending && (
                          <div className="d-flex flex-wrap gap-1">
                            <button
                              className="btn btn-success btn-sm"
                              disabled={isSaving}
                              onClick={() => handleApprove(req)}
                            >
                              {isSaving ? (
                                <span className="spinner-border spinner-border-sm"></span>
                              ) : (
                                <>
                                  <i className="bi bi-check-lg me-1"></i>
                                  Approve
                                </>
                              )}
                            </button>

                            <button
                              className="btn btn-danger btn-sm"
                              disabled={isSaving}
                              onClick={() => handleReject(req)}
                            >
                              <i className="bi bi-x-lg me-1"></i>
                              Reject
                            </button>
                          </div>
                        )}

                        {/* APPROVED: FULFILLMENT OPTIONS */}
                        {isApproved && (
                          <div
                            className="border rounded p-2 bg-light"
                            style={{ minWidth: '290px' }}
                          >
                            <div className="small fw-semibold text-dark mb-2">
                              <i className="bi bi-droplet-half text-primary me-1"></i>
                              Record Fulfilment Outcome
                            </div>

                            <div className="mb-2">
                              {FULFILLMENT_OPTIONS.map((opt) => {
                                const radioId =
                                  `${req.id}-${opt.replace(/\s/g, '-')}`;

                                return (
                                  <div
                                    key={opt}
                                    className="form-check mb-1"
                                  >
                                    <input
                                      className="form-check-input"
                                      type="radio"
                                      id={radioId}
                                      name={`fulfillment-${req.id}`}
                                      value={opt}
                                      checked={choice === opt}
                                      disabled={isSaving}
                                      onChange={() =>
                                        setEdit(
                                          req.id,
                                          'fulfillmentChoice',
                                          opt
                                        )
                                      }
                                    />

                                    <label
                                      className="form-check-label small"
                                      htmlFor={radioId}
                                    >
                                      {opt === 'Satisfied' && (
                                        <span className="badge bg-success me-1">✓</span>
                                      )}
                                      {opt === 'Partially Satisfied' && (
                                        <span className="badge bg-warning text-dark me-1">~</span>
                                      )}
                                      {opt === 'Not Satisfied' && (
                                        <span className="badge bg-danger me-1">✗</span>
                                      )}
                                      {opt}
                                    </label>
                                  </div>
                                );
                              })}
                            </div>

                            {choice !== 'Not Satisfied' && (
                              <div className="input-group input-group-sm mb-2">
                                <span className="input-group-text">
                                  <i className="bi bi-droplet"></i>
                                </span>

                                <input
                                  type="number"
                                  className="form-control"
                                  placeholder="Water delivered (L)"
                                  min="0"
                                  max={req.waterRequired}
                                  step="500"
                                  value={edit.waterDelivered}
                                  disabled={isSaving}
                                  onChange={(e) =>
                                    setEdit(
                                      req.id,
                                      'waterDelivered',
                                      e.target.value
                                    )
                                  }
                                />

                                <span className="input-group-text">L</span>
                              </div>
                            )}

                            <div className="text-muted mb-2" style={{ fontSize: '0.72rem' }}>
                              Requested: <strong>
                                {Number(req.waterRequired ?? 0).toLocaleString()} L
                              </strong>
                              {choice === 'Not Satisfied' && (
                                <span className="text-danger ms-2">
                                  → Delivered: 0 L
                                </span>
                              )}
                            </div>

                            <button
                              className="btn btn-primary btn-sm w-100"
                              disabled={isSaving}
                              onClick={() => handleFinalize(req)}
                            >
                              {isSaving ? (
                                <>
                                  <span className="spinner-border spinner-border-sm me-1"></span>
                                  Saving...
                                </>
                              ) : (
                                <>
                                  <i className="bi bi-check2-all me-1"></i>
                                  Finalize Fulfilment
                                </>
                              )}
                            </button>
                          </div>
                        )}

                        {/* COMPLETED / REJECTED */}
                        {isFinal && (
                          <div className="text-muted small fst-italic">
                            {req.status === 'Completed' ? (
                              <>
                                <i className="bi bi-check2-all text-primary me-1"></i>
                                Finalized · {Number(req.waterDelivered ?? 0).toLocaleString()} L delivered
                              </>
                            ) : (
                              <>
                                <i className="bi bi-x-circle text-danger me-1"></i>
                                Rejected
                              </>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="mt-3 small text-muted">
        <strong>Fulfilment rules:</strong>&nbsp;
        <span className="badge bg-success me-1">Satisfied</span>
        Full requested quantity delivered &nbsp;
        <span className="badge bg-warning text-dark me-1">Partially Satisfied</span>
        Some water delivered &nbsp;
        <span className="badge bg-danger me-1">Not Satisfied</span>
        No water delivered &nbsp;
        <span className="badge bg-info text-dark me-1">Pending</span>
        Awaiting admin action
      </div>
    </div>
  );
}

export default AdminRequests;
