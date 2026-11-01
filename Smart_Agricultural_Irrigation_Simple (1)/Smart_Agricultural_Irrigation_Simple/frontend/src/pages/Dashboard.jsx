import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SAMPLE_RESERVOIR, SAMPLE_FIELDS, SAMPLE_CANALS } from '../data/sampleData';
import { auth, db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export function Dashboard({ user }) {
  const userName = user?.displayName || user?.email?.split('@')[0] || 'Operator';

  // ── Static data (reservoir, fields, canals) ──────────────────────────────
  const totalFields = SAMPLE_FIELDS.length; // 8
  const availableWater = SAMPLE_RESERVOIR.availableLitres; // 18000
  const totalCapacity = SAMPLE_RESERVOIR.capacityLitres; // 40000
  const waterPercentage = Math.round((availableWater / totalCapacity) * 100); // 45%
  const blockedCanalsCount = SAMPLE_CANALS.filter((c) => !c.working).length; // 1

  // ── Live Firestore request stats ─────────────────────────────────────────
  const [firestoreRequests, setFirestoreRequests] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const uid = user?.uid || auth.currentUser?.uid;
    if (!uid) {
      setStatsLoading(false);
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
        // Sort newest first
        docs.sort((a, b) => {
          const ta = a.createdAt?.toMillis?.() ?? 0;
          const tb = b.createdAt?.toMillis?.() ?? 0;
          return tb - ta;
        });
        setFirestoreRequests(docs);
        setStatsLoading(false);
      },
      (err) => {
        console.error('Dashboard Firestore error:', err);
        setStatsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const pendingRequestsCount = firestoreRequests.filter(
    (r) => r.status === 'Pending Review'
  ).length;

  const approvedRequestsCount = firestoreRequests.filter(
    (r) => r.status === 'Approved'
  ).length;

  const completedRequestsCount = firestoreRequests.filter(
    (r) => r.status === 'Completed'
  ).length;

  const unsatisfiedCount = firestoreRequests.filter(
    (r) => r.fulfillmentStatus === 'Not Satisfied' || r.fulfillmentStatus === 'Partially Satisfied'
  ).length;

  const totalRequestsCount = firestoreRequests.length;

  // ── Helper: format Firestore Timestamp ───────────────────────────────────
  const formatShortDate = (ts) => {
    if (!ts) return '—';
    try {
      const d = ts.toDate();
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return '—';
    }
  };

  return (
    <div className="page-container">
      {/* Page Title & Status Banner */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-2">
        <div>
          <h2 className="mb-1">Irrigation Management Dashboard</h2>
          <p className="text-muted small mb-0">
            Welcome back, <strong className="text-success">{userName}</strong> ({user?.email || 'operator@agriflow.org'}). Real-time status of Bhavanisagar Reservoir and canal network.
          </p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/requests" className="btn btn-emerald btn-sm d-flex align-items-center gap-1">
            <i className="bi bi-plus-circle"></i>
            <span>New Request</span>
          </Link>
          <Link to="/allocation" className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1">
            <i className="bi bi-droplet"></i>
            <span>Allocation View</span>
          </Link>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="row g-3 mb-4">
        {/* Card 1: Total Fields */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="stat-card">
            <div>
              <div className="text-muted small fw-semibold text-uppercase" style={{ fontSize: '0.75rem' }}>
                Total Fields
              </div>
              <h3 className="mb-0 mt-1 fw-bold">{totalFields}</h3>
              <small className="text-success fw-medium">
                <i className="bi bi-check-circle-fill me-1"></i>Active Farmlands
              </small>
            </div>
            <div className="stat-icon-wrapper stat-icon-green">
              <i className="bi bi-flower1"></i>
            </div>
          </div>
        </div>

        {/* Card 2: Available Reservoir Water */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="stat-card">
            <div>
              <div className="text-muted small fw-semibold text-uppercase" style={{ fontSize: '0.75rem' }}>
                Available Reservoir
              </div>
              <h3 className="mb-0 mt-1 fw-bold">{availableWater.toLocaleString()} L</h3>
              <small className="text-muted">
                Cap: {totalCapacity.toLocaleString()} L ({waterPercentage}%)
              </small>
            </div>
            <div className="stat-icon-wrapper stat-icon-blue">
              <i className="bi bi-droplet-half"></i>
            </div>
          </div>
        </div>

        {/* Card 3: Pending Irrigation Requests (live from Firestore) */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="stat-card">
            <div>
              <div className="text-muted small fw-semibold text-uppercase" style={{ fontSize: '0.75rem' }}>
                Pending Requests
              </div>
              <h3 className="mb-0 mt-1 fw-bold">
                {statsLoading ? (
                  <span className="spinner-border spinner-border-sm text-warning" role="status" aria-hidden="true"></span>
                ) : (
                  pendingRequestsCount
                )}
              </h3>
              <small className="text-warning fw-medium">
                <i className="bi bi-clock-history me-1"></i>
                {statsLoading ? 'Loading…' : `${totalRequestsCount} total submitted`}
              </small>
            </div>
            <div className="stat-icon-wrapper stat-icon-amber">
              <i className="bi bi-hourglass-split"></i>
            </div>
          </div>
        </div>

        {/* Card 4: Blocked Canals */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="stat-card">
            <div>
              <div className="text-muted small fw-semibold text-uppercase" style={{ fontSize: '0.75rem' }}>
                Blocked Canals
              </div>
              <h3 className="mb-0 mt-1 fw-bold">{blockedCanalsCount}</h3>
              <small className="text-danger fw-medium">
                <i className="bi bi-exclamation-octagon-fill me-1"></i>Link L12 Offline
              </small>
            </div>
            <div className="stat-icon-wrapper stat-icon-red">
              <i className="bi bi-slash-circle"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Fulfillment summary row (live Firestore, shown only when there are requests) */}
      {!statsLoading && totalRequestsCount > 0 && (
        <div className="row g-3 mb-4">
          {[
            { label: 'Approved',    val: approvedRequestsCount,  cls: 'stat-icon-green', icon: 'bi-check-circle',       color: 'text-success' },
            { label: 'Completed',   val: completedRequestsCount, cls: 'stat-icon-blue',  icon: 'bi-check2-all',         color: 'text-primary' },
            { label: 'Unsatisfied', val: unsatisfiedCount,       cls: 'stat-icon-red',   icon: 'bi-exclamation-circle', color: 'text-danger'  },
            { label: 'My Total',    val: totalRequestsCount,     cls: 'stat-icon-amber', icon: 'bi-stack',              color: 'text-dark'    },
          ].map(({ label, val, cls, icon, color }) => (
            <div key={label} className="col-6 col-sm-3">
              <div className="stat-card py-3">
                <div>
                  <div className="text-muted small fw-semibold text-uppercase" style={{ fontSize: '0.72rem' }}>{label}</div>
                  <h4 className={`mb-0 mt-1 fw-bold ${color}`}>{val}</h4>
                </div>
                <div className={`stat-icon-wrapper ${cls}`}><i className={`bi ${icon}`}></i></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reservoir Level Progress Bar */}
      <div className="custom-card mb-4">
        <div className="card-header-clean">
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-water text-primary fs-5"></i>
            <span className="fw-semibold">Reservoir Water Level Status</span>
          </div>
          <span className="badge bg-primary-subtle text-primary border border-primary-subtle">
            {availableWater.toLocaleString()} L / {totalCapacity.toLocaleString()} L
          </span>
        </div>
        <div className="p-3 p-md-4">
          <div className="d-flex justify-content-between small text-muted mb-2">
            <span>Water Reserves: <strong>{waterPercentage}%</strong></span>
            <span>Unused Capacity: <strong>{totalCapacity - availableWater} L</strong></span>
          </div>
          <div className="progress" style={{ height: '22px' }}>
            <div
              className="progress-bar progress-bar-striped progress-bar-animated bg-success"
              role="progressbar"
              style={{ width: `${waterPercentage}%` }}
              aria-valuenow={waterPercentage}
              aria-valuemin="0"
              aria-valuemax="100"
            >
              {waterPercentage}% Available
            </div>
          </div>
          <div className="row text-center mt-3 g-2 small">
            <div className="col-4 border-end">
              <div className="text-muted">Total Capacity</div>
              <div className="fw-bold">{totalCapacity.toLocaleString()} Litres</div>
            </div>
            <div className="col-4 border-end">
              <div className="text-muted">Available Now</div>
              <div className="fw-bold text-success">{availableWater.toLocaleString()} Litres</div>
            </div>
            <div className="col-4">
              <div className="text-muted">Operating State</div>
              <div className="fw-bold text-primary">Regulated Supply</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Soil Moisture Overview + Recent Activities */}
      <div className="row g-4">
        {/* Soil Moisture Overview */}
        <div className="col-12 col-lg-7">
          <div className="custom-card h-100">
            <div className="card-header-clean">
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-moisture text-success fs-5"></i>
                <span className="fw-semibold">Soil Moisture Telemetry Overview</span>
              </div>
              <Link to="/fields" className="text-success small text-decoration-none fw-semibold">
                View All Fields &rarr;
              </Link>
            </div>
            <div className="table-responsive">
              <table className="table table-custom mb-0">
                <thead>
                  <tr>
                    <th>Field</th>
                    <th>Crop</th>
                    <th>Moisture %</th>
                    <th>Moisture Level</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {SAMPLE_FIELDS.slice(0, 5).map((field) => {
                    const isLow = field.soilMoisture < 20;
                    const isMed = field.soilMoisture >= 20 && field.soilMoisture < 35;
                    return (
                      <tr key={field.fieldId}>
                        <td>
                          <span className="fw-semibold text-dark">{field.fieldId}</span>
                          <span className="text-muted small ms-1">({field.farmerName})</span>
                        </td>
                        <td>{field.cropName}</td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <span className="fw-semibold">{field.soilMoisture}%</span>
                            <div className="progress flex-grow-1" style={{ height: '6px', minWidth: '50px' }}>
                              <div
                                className={`progress-bar ${isLow ? 'bg-danger' : isMed ? 'bg-warning' : 'bg-success'}`}
                                style={{ width: `${field.soilMoisture}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td>
                          {isLow ? (
                            <span className="badge bg-danger-subtle text-danger">Critically Dry</span>
                          ) : isMed ? (
                            <span className="badge bg-warning-subtle text-warning">Moderate</span>
                          ) : (
                            <span className="badge bg-success-subtle text-success">Adequate</span>
                          )}
                        </td>
                        <td>
                          <span className={`badge ${field.status === 'Irrigated' ? 'bg-success' : 'bg-secondary'}`}>
                            {field.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recent Activities — live from Firestore */}
        <div className="col-12 col-lg-5">
          <div className="custom-card h-100">
            <div className="card-header-clean">
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-clock-history text-secondary fs-5"></i>
                <span className="fw-semibold">Recent Irrigation Requests</span>
              </div>
              <Link to="/history" className="text-success small text-decoration-none fw-semibold">
                History &rarr;
              </Link>
            </div>
            <div className="p-3">
              {statsLoading ? (
                <div className="d-flex align-items-center gap-2 text-muted py-3">
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  <span>Loading requests…</span>
                </div>
              ) : firestoreRequests.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  <i className="bi bi-inbox d-block mb-2 fs-4"></i>
                  <p className="small mb-0">No requests yet. <Link to="/requests" className="text-success">Submit one</Link>.</p>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {firestoreRequests.slice(0, 4).map((req) => {
                    const isEmergency = req.requestType?.toLowerCase().includes('drought');
                    return (
                      <div key={req.id} className="list-group-item px-0 py-2 border-bottom">
                        <div className="d-flex w-100 justify-content-between align-items-center mb-1">
                          <span className="fw-semibold small text-dark">
                            {isEmergency ? '🚨' : '💧'} {req.fieldId} — {req.cropName}
                          </span>
                          <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                            {formatShortDate(req.createdAt)}
                          </small>
                        </div>
                        <p className="mb-1 text-muted small" style={{ fontSize: '0.82rem' }}>
                          {req.requestType} · {req.waterRequired?.toLocaleString()} L · {req.priority}
                        </p>
                        <span className={`badge ${
                          req.status === 'Fulfilled' ? 'bg-success-subtle text-success' :
                          req.status === 'Blocked Canal' ? 'bg-danger-subtle text-danger' :
                          req.status?.includes('Partial') ? 'bg-warning-subtle text-warning' :
                          'bg-info-subtle text-info'
                        }`} style={{ fontSize: '0.7rem' }}>
                          {req.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
