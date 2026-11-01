import React from 'react';
import { SAMPLE_FIELDS } from '../data/sampleData';

export function Fields() {
  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-2">
        <div>
          <h2 className="mb-1">Agricultural Field Management</h2>
          <p className="text-muted small mb-0">
            Registered agricultural plots, crop profiles, sensor soil moisture readings, and water demand
          </p>
        </div>
        <div>
          <span className="badge bg-light text-secondary border px-3 py-2">
            <i className="bi bi-info-circle me-1"></i> Mode: Read-Only (College Review)
          </span>
        </div>
      </div>

      {/* Overview Stat Strip */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="p-3 bg-white border rounded shadow-sm">
            <div className="text-muted small">Total Plots</div>
            <div className="fs-4 fw-bold text-dark">{SAMPLE_FIELDS.length}</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="p-3 bg-white border rounded shadow-sm">
            <div className="text-muted small">Total Water Demand</div>
            <div className="fs-4 fw-bold text-success">
              {SAMPLE_FIELDS.reduce((sum, f) => sum + f.waterRequirement, 0).toLocaleString()} L
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="p-3 bg-white border rounded shadow-sm">
            <div className="text-muted small">Avg. Soil Moisture</div>
            <div className="fs-4 fw-bold text-primary">
              {Math.round(SAMPLE_FIELDS.reduce((sum, f) => sum + f.soilMoisture, 0) / SAMPLE_FIELDS.length)}%
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="p-3 bg-white border rounded shadow-sm">
            <div className="text-muted small">Critical Moisture (&lt;20%)</div>
            <div className="fs-4 fw-bold text-danger">
              {SAMPLE_FIELDS.filter((f) => f.soilMoisture < 20).length} Plots
            </div>
          </div>
        </div>
      </div>

      {/* Field Table Card */}
      <div className="custom-card">
        <div className="card-header-clean">
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-table text-success fs-5"></i>
            <span className="fw-semibold">Registered Farmland Directory</span>
          </div>
          <span className="badge bg-secondary-subtle text-secondary">
            Showing {SAMPLE_FIELDS.length} Records
          </span>
        </div>
        <div className="table-responsive">
          <table className="table table-custom table-hover align-middle mb-0">
            <thead>
              <tr>
                <th scope="col">Field ID</th>
                <th scope="col">Farmer Name</th>
                <th scope="col">Crop Name</th>
                <th scope="col">Soil Moisture</th>
                <th scope="col">Water Requirement</th>
                <th scope="col">Canal Zone</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {SAMPLE_FIELDS.map((field) => {
                const isCritical = field.soilMoisture < 20;
                return (
                  <tr key={field.fieldId}>
                    <td>
                      <span className="badge bg-dark-subtle text-dark fw-bold px-2 py-1">
                        {field.fieldId}
                      </span>
                    </td>
                    <td className="fw-medium text-dark">{field.farmerName}</td>
                    <td>
                      <span className="fw-semibold text-success">{field.cropName}</span>
                      <small className="text-muted ms-1">
                        (Priority {field.cropPriority})
                      </small>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2" style={{ maxWidth: '160px' }}>
                        <span className={`fw-bold small ${isCritical ? 'text-danger' : 'text-dark'}`}>
                          {field.soilMoisture}%
                        </span>
                        <div className="progress flex-grow-1" style={{ height: '7px' }}>
                          <div
                            className={`progress-bar ${isCritical ? 'bg-danger' : field.soilMoisture < 30 ? 'bg-warning' : 'bg-success'}`}
                            style={{ width: `${field.soilMoisture}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="fw-semibold">{field.waterRequirement.toLocaleString()}</span>
                      <span className="text-muted small"> L</span>
                    </td>
                    <td className="text-muted small">{field.zone}</td>
                    <td>
                      <span
                        className={`badge ${
                          field.status === 'Irrigated'
                            ? 'bg-success'
                            : field.status === 'Optimal'
                            ? 'bg-info text-dark'
                            : field.status === 'Canal Blocked'
                            ? 'bg-danger'
                            : field.status === 'Partially Fulfilled'
                            ? 'bg-warning text-dark'
                            : 'bg-secondary'
                        }`}
                      >
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
  );
}

export default Fields;
