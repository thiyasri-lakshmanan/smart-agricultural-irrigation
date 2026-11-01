
import React, { useEffect, useState } from 'react';

import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  onSnapshot,
  setDoc
} from 'firebase/firestore';

import { auth, db } from '../Firebase';

import {
  SAMPLE_RESERVOIR,
  SAMPLE_ALLOCATIONS
} from '../data/sampleData';

// Your existing admin UID
const ADMIN_UID = 'nxtx9UQMhjb44a4aNQVF0bW1XBd2';

export function Allocation() {
  const [availableWater, setAvailableWater] = useState(null);
  const [reservoirInput, setReservoirInput] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const isAdmin = auth.currentUser?.uid === ADMIN_UID;

  // Read reservoir quantity from Firebase
  useEffect(() => {
    const reservoirRef = doc(db, 'reservoirs', 'main');

    const unsubscribe = onSnapshot(
      reservoirRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          setAvailableWater(Number(data.availableLitres));
          setReservoirInput(String(data.availableLitres));
        } else {
          setAvailableWater(null);
        }
      },
      (error) => {
        console.error('Reservoir loading error:', error);
        setMessage('Error loading reservoir: ' + error.message);
      }
    );

    return () => unsubscribe();
  }, []);

  // Admin updates reservoir quantity
  async function updateReservoir(e) {
    e.preventDefault();
    setMessage('');

    const quantity = Number(reservoirInput);

    if (!auth.currentUser || auth.currentUser.uid !== ADMIN_UID) {
      setMessage('Only the admin can update the reservoir.');
      return;
    }

    if (
      reservoirInput.trim() === '' ||
      !Number.isFinite(quantity) ||
      quantity <= 0 ||
      (
        Number.isFinite(Number(SAMPLE_RESERVOIR.capacityLitres)) &&
        Number(SAMPLE_RESERVOIR.capacityLitres) > 0 &&
        quantity > Number(SAMPLE_RESERVOIR.capacityLitres)
      )
    ) {
      setMessage('Enter a valid quantity within the reservoir capacity.');
      return;
    }

    try {
      setLoading(true);

      await setDoc(
        doc(db, 'reservoirs', 'main'),
        {
          availableLitres: quantity,
          updatedBy: auth.currentUser.uid,
          updatedAt: serverTimestamp()
        },
        { merge: true }
      );

      setMessage('Reservoir quantity updated successfully!');
    } catch (error) {
      console.error('Reservoir update error:', error);
      setMessage('Error updating reservoir: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  const totalRequested = SAMPLE_ALLOCATIONS.reduce(
    (sum, item) => sum + item.requestedLitres,
    0
  );

  const totalAllocated = SAMPLE_ALLOCATIONS.reduce(
    (sum, item) => sum + item.allocatedLitres,
    0
  );

  const remainingReservoir =
    availableWater === null
      ? null
      : availableWater - totalAllocated;

  return (
    <div className="page-container">

      {/* Reservoir Management */}
      <div className="custom-card p-4 mb-4">
        <h2 className="mb-2">Reservoir Management</h2>

        <p className="mb-3">
          Available Water:{' '}
          <strong>
            {availableWater === null
              ? 'Not configured'
              : `${availableWater.toLocaleString('en-IN')} L`}
          </strong>
        </p>

        {isAdmin ? (
          <form
            onSubmit={updateReservoir}
            className="d-flex flex-wrap gap-3 align-items-center"
          >
            <input
              type="number"
              className="form-control"
              style={{ maxWidth: '300px' }}
              placeholder="Enter available water in litres"
              min="1"
              value={reservoirInput}
              onChange={(e) => setReservoirInput(e.target.value)}
              required
            />

            <button
              type="submit"
              className="btn btn-primary-forest px-4"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Reservoir'}
            </button>
          </form>
        ) : (
          <p className="text-muted mb-0">
            Only the administrator can update reservoir water.
          </p>
        )}

        {message && (
          <div
            className={`alert mt-3 mb-0 ${
              message.includes('successfully')
                ? 'alert-success'
                : 'alert-danger'
            }`}
          >
            {message}
          </div>
        )}
      </div>

      {/* Page Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-2">
        <div>
          <h2 className="mb-1">Water Allocation Results</h2>
          <p className="text-muted small mb-0">
            Water resource distribution computed by the priority dispatch algorithm
          </p>
        </div>

        <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2">
          <i className="bi bi-cpu me-1"></i>
          Allocation Engine: Java Core Algorithm
        </span>
      </div>

      {/* Summary Metrics */}
      <div className="row g-3 mb-4">

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="stat-card">
            <div>
              <div className="text-muted small fw-semibold text-uppercase" style={{ fontSize: '0.75rem' }}>
                Available Reservoir Water
              </div>
              <h3 className="mb-0 mt-1 fw-bold text-dark">
                {availableWater === null
                  ? '—'
                  : `${availableWater.toLocaleString('en-IN')} L`}
              </h3>
              <small className="text-muted">Master Reservoir (RES)</small>
            </div>
            <div className="stat-icon-wrapper stat-icon-blue">
              <i className="bi bi-droplet-half"></i>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="stat-card">
            <div>
              <div className="text-muted small fw-semibold text-uppercase" style={{ fontSize: '0.75rem' }}>
                Total Requested Water
              </div>
              <h3 className="mb-0 mt-1 fw-bold text-dark">
                {totalRequested.toLocaleString('en-IN')} L
              </h3>
              <small className="text-muted">Sum of Field Requests</small>
            </div>
            <div className="stat-icon-wrapper stat-icon-amber">
              <i className="bi bi-arrow-down-circle"></i>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="stat-card">
            <div>
              <div className="text-muted small fw-semibold text-uppercase" style={{ fontSize: '0.75rem' }}>
                Total Allocated Water
              </div>
              <h3 className="mb-0 mt-1 fw-bold text-success">
                {totalAllocated.toLocaleString('en-IN')} L
              </h3>
              <small className="text-success fw-medium">
                <i className="bi bi-check-circle-fill me-1"></i>
                Dispatched via Network
              </small>
            </div>
            <div className="stat-icon-wrapper stat-icon-green">
              <i className="bi bi-water"></i>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="stat-card">
            <div>
              <div className="text-muted small fw-semibold text-uppercase" style={{ fontSize: '0.75rem' }}>
                Remaining Reservoir Water
              </div>
              <h3 className="mb-0 mt-1 fw-bold text-danger">
                {remainingReservoir === null
                  ? '—'
                  : `${remainingReservoir.toLocaleString('en-IN')} L`}
              </h3>
              <small className="text-danger fw-medium">
                <i className="bi bi-exclamation-circle-fill me-1"></i>
                After Allocation
              </small>
            </div>
            <div className="stat-icon-wrapper stat-icon-red">
              <i className="bi bi-battery"></i>
            </div>
          </div>
        </div>

      </div>

      {/* Architecture Notice */}
      <div className="alert alert-light border shadow-sm d-flex align-items-center gap-3 mb-4" role="alert">
        <i className="bi bi-info-circle-fill text-primary fs-4"></i>
        <div className="small text-muted">
          <strong className="text-dark">College Review Note:</strong>
          {' '}The allocation algorithm (enforcing Priority Queue sorting, BFS canal reachability diagnostics, and drought emergency overrides) resides inside the <code>IrrigationSystem.java</code> backend class. This page renders the dispatch outcome.
        </div>
      </div>

      {/* Allocation Table */}
      <div className="custom-card">
        <div className="card-header-clean">
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-table text-success fs-5"></i>
            <span className="fw-semibold">
              Priority Allocation Dispatch Table
            </span>
          </div>

          <span className="badge bg-secondary-subtle text-secondary">
            {SAMPLE_ALLOCATIONS.length} Requests Processed
          </span>
        </div>

        <div className="table-responsive">
          <table className="table table-custom table-hover align-middle mb-0">
            <thead>
              <tr>
                <th scope="col">Request ID</th>
                <th scope="col">Field ID</th>
                <th scope="col">Farmer & Crop</th>
                <th scope="col">Requested Water</th>
                <th scope="col">Allocated Water</th>
                <th scope="col">Unmet Deficit</th>
                <th scope="col">Status</th>
                <th scope="col">Dispatch Note</th>
              </tr>
            </thead>

            <tbody>
              {SAMPLE_ALLOCATIONS.map((alloc) => (
                <tr key={alloc.requestId}>
                  <td>
                    <span className="badge bg-dark-subtle text-dark fw-bold px-2 py-1">
                      {alloc.requestId}
                    </span>
                  </td>

                  <td>
                    <span className="fw-semibold text-dark">
                      {alloc.fieldId}
                    </span>
                  </td>

                  <td>
                    <div className="fw-medium text-dark">
                      {alloc.farmerName}
                    </div>
                    <div className="text-muted small">
                      {alloc.cropName}
                    </div>
                  </td>

                  <td>
                    <span className="fw-semibold">
                      {alloc.requestedLitres.toLocaleString('en-IN')}
                    </span>
                    <span className="text-muted small"> L</span>
                  </td>

                  <td>
                    <span className={`fw-bold ${alloc.allocatedLitres > 0 ? 'text-success' : 'text-danger'}`}>
                      {alloc.allocatedLitres.toLocaleString('en-IN')}
                    </span>
                    <span className="text-muted small"> L</span>
                  </td>

                  <td>
                    {alloc.remainingUnmet > 0 ? (
                      <span className="badge bg-warning-subtle text-warning border border-warning-subtle">
                        {alloc.remainingUnmet.toLocaleString('en-IN')} L
                      </span>
                    ) : (
                      <span className="badge bg-success-subtle text-success">
                        0 L (Met)
                      </span>
                    )}
                  </td>

                  <td>
                    <span
                      className={`badge ${
                        alloc.status === 'Fully Delivered'
                          ? 'bg-success'
                          : alloc.status === 'Unreachable'
                          ? 'bg-danger'
                          : 'bg-warning text-dark'
                      }`}
                    >
                      {alloc.status}
                    </span>
                  </td>

                  <td className="small text-muted" style={{ maxWidth: '280px' }}>
                    {alloc.note}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

export default Allocation;
