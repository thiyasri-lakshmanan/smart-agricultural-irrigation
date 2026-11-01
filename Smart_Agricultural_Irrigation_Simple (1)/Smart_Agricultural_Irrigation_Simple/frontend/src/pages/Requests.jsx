
import React, { useState } from "react";
import {
  collection,
  addDoc,
  serverTimestamp
} from "firebase/firestore";

import { auth, db } from "../Firebase";

import {
  calculateWater,
  cropDemand
} from "../utils/irrigation";

export function Requests() {
  const [name, setName] = useState("");
  const [acres, setAcres] = useState("");
  const [moisture, setMoisture] = useState("");
  const [crop, setCrop] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const water = calculateWater(acres, moisture, crop);

  async function submitRequest(e) {
    e.preventDefault();
    setMessage("");

    if (!auth.currentUser) {
      setMessage("Please log in before submitting a request.");
      return;
    }

    if (
      !name.trim() ||
      !acres ||
      moisture === "" ||
      !crop ||
      Number(acres) <= 0 ||
      Number(moisture) < 0 ||
      Number(moisture) > 100 ||
      water <= 0
    ) {
      setMessage("Please enter valid farm details.");
      return;
    }

    try {
      setLoading(true);

      await addDoc(collection(db, "irrigationRequests"), {
        userId: auth.currentUser.uid,
        farmerName: name.trim(),
        acres: Number(acres),
        soilMoisture: Number(moisture),
        crop: crop,
        waterRequired: water,
        status: "Pending",
        createdAt: serverTimestamp()
      });

      setMessage("Water request submitted successfully!");

      setName("");
      setAcres("");
      setMoisture("");
      setCrop("");

    } catch (error) {
      console.error(error);
      setMessage("Error submitting request: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-container">
      <div className="custom-card p-4 p-md-5">

        <h2 className="mb-2">Request Irrigation Water</h2>

        <p className="text-muted mb-4">
          Enter your farm details to calculate your water requirement.
        </p>

        <form onSubmit={submitRequest}>

          <div className="row g-3">

            <div className="col-md-6">
              <label className="form-label fw-semibold">
                Farmer Name
              </label>

              <input
                type="text"
                className="form-control"
                placeholder="Enter farmer name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">
                Land Area (Acres)
              </label>

              <input
                type="number"
                className="form-control"
                placeholder="Enter land area"
                min="0.01"
                step="0.01"
                value={acres}
                onChange={(e) => setAcres(e.target.value)}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">
                Soil Moisture (%)
              </label>

              <input
                type="number"
                className="form-control"
                placeholder="Enter soil moisture"
                min="0"
                max="100"
                step="0.1"
                value={moisture}
                onChange={(e) => setMoisture(e.target.value)}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">
                Crop Type
              </label>

              <select
                className="form-select"
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
                required
              >
                <option value="">Select crop</option>

                {Object.keys(cropDemand).map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

          </div>

          <div
            className="mt-4 p-4 rounded text-center"
            style={{ backgroundColor: "#e8f5e9" }}
          >
            <h4 className="mb-2" style={{ color: "#163829" }}>
              Estimated Daily Water Requirement
            </h4>

            <h2 className="fw-bold mb-0" style={{ color: "#198754" }}>
              {water.toLocaleString("en-IN")} Litres
            </h2>
          </div>

          <div className="mt-4">
            <button
              type="submit"
              className="btn btn-primary-forest px-4 py-2"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Request"}
            </button>
          </div>

          {message && (
            <div
              className={`alert mt-3 ${
                message.includes("successfully")
                  ? "alert-success"
                  : "alert-danger"
              }`}
            >
              {message}
            </div>
          )}

        </form>
      </div>
    </div>
  );
}

export default Requests;
