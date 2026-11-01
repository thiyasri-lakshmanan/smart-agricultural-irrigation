import React from 'react';
import { SAMPLE_CANALS } from '../data/sampleData';

export function Canals() {
  const operationalCount = SAMPLE_CANALS.filter((c) => c.working).length;
  const blockedCount = SAMPLE_CANALS.filter((c) => !c.working).length;

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-2">
        <div>
          <h2 className="mb-1">Canal Distribution Network</h2>
          <p className="text-muted small mb-0">
            Water conveyance canal links, junction connections, and operational health status
          </p>
        </div>
        <div className="d-flex gap-2">
          <span className="badge bg-success px-3 py-2">
            <i className="bi bi-check-circle me-1"></i> {operationalCount} Operational
          </span>
          <span className="badge bg-danger px-3 py-2">
            <i className="bi bi-exclamation-triangle me-1"></i> {blockedCount} Blocked
          </span>
        </div>
      </div>

      {/* Network Overview Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <div className="stat-card">
            <div>
              <div className="text-muted small fw-semibold text-uppercase" style={{ fontSize: '0.75rem' }}>
                Total Canal Links
              </div>
              <h3 className="mb-0 mt-1 fw-bold">{SAMPLE_CANALS.length}</h3>
              <small className="text-muted">Interconnected Siphons & Laterals</small>
            </div>
            <div className="stat-icon-wrapper stat-icon-blue">
              <i className="bi bi-diagram-3"></i>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="stat-card">
            <div>
              <div className="text-muted small fw-semibold text-uppercase" style={{ fontSize: '0.75rem' }}>
                Operational Canals
              </div>
              <h3 className="mb-0 mt-1 fw-bold text-success">{operationalCount}</h3>
              <small className="text-success fw-medium">
                <i className="bi bi-check2 me-1"></i>Free Water Flow
              </small>
            </div>
            <div className="stat-icon-wrapper stat-icon-green">
              <i className="bi bi-check-circle"></i>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="stat-card">
            <div>
              <div className="text-muted small fw-semibold text-uppercase" style={{ fontSize: '0.75rem' }}>
                Blocked Canals
              </div>
              <h3 className="mb-0 mt-1 fw-bold text-danger">{blockedCount}</h3>
              <small className="text-danger fw-medium">
                <i className="bi bi-slash-circle me-1"></i>Canal L12 Requires Clearance
              </small>
            </div>
            <div className="stat-icon-wrapper stat-icon-red">
              <i className="bi bi-x-octagon"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Canal Links Bootstrap Table */}
      <div className="custom-card mb-4">
        <div className="card-header-clean">
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-water text-success fs-5"></i>
            <span className="fw-semibold">Canal Links Directory</span>
          </div>
          <span className="badge bg-secondary-subtle text-secondary">
            12 Canal Segments
          </span>
        </div>
        <div className="table-responsive">
          <table className="table table-custom table-hover align-middle mb-0">
            <thead>
              <tr>
                <th scope="col">Canal ID</th>
                <th scope="col">Source Location</th>
                <th scope="col">Destination Location</th>
                <th scope="col">Connected Path</th>
                <th scope="col">Canal Status</th>
              </tr>
            </thead>
            <tbody>
              {SAMPLE_CANALS.map((canal) => (
                <tr key={canal.linkId}>
                  <td>
                    <span className="badge bg-dark-subtle text-dark fw-bold px-2 py-1">
                      {canal.linkId}
                    </span>
                  </td>
                  <td className="fw-medium text-dark">{canal.fromNode}</td>
                  <td className="fw-medium text-dark">{canal.toNode}</td>
                  <td>
                    <div className="d-flex align-items-center gap-2 text-muted small">
                      <span>{canal.fromNode.split(' ')[0]}</span>
                      <i className="bi bi-arrow-right text-success"></i>
                      <span>{canal.toNode.split(' ')[0]}</span>
                    </div>
                  </td>
                  <td>
                    {canal.working ? (
                      <span className="badge bg-success px-2 py-1">
                        <i className="bi bi-check-circle me-1"></i> Operational
                      </span>
                    ) : (
                      <span className="badge bg-danger px-2 py-1">
                        <i className="bi bi-slash-circle me-1"></i> Blocked
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Diagnostic Callout Card */}
      <div className="custom-card bg-light p-3">
        <div className="d-flex align-items-start gap-3">
          <i className="bi bi-shield-exclamation text-warning fs-3 mt-1"></i>
          <div>
            <h6 className="mb-1 fw-bold text-dark">Reachability Graph Diagnostics</h6>
            <p className="mb-0 text-muted small">
              In the Java prototype (<code>IrrigationNetwork.java</code>), a Breadth-First Search (BFS) graph algorithm traverses operational links from Reservoir <code>RES</code>. When <code>L12</code> is flagged as blocked, field <code>F8</code> is detected as unreachable, preventing wasteful water discharge until canal repair is logged.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Canals;
