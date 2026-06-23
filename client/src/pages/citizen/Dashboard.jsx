import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getComplaints } from "../../services/complaintService";
import ComplaintMap from "../../components/maps/ComplaintMap";
import MapFilters from "../../components/maps/MapFilters";

export default function CitizenDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [filters, setFilters] = useState({});

  const load = async (f = {}) => {
    try {
      const { data } = await getComplaints(f);
      setComplaints(data);
    } catch {
      setComplaints([]);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <h2>Citizen Dashboard</h2>
        <Link to="/citizen/new" className="btn" style={{ textDecoration: "none" }}>
          + New Complaint
        </Link>
      </div>

      <ComplaintMap complaints={complaints} height={350} />
      <MapFilters filters={filters} onChange={setFilters} onApply={() => load(filters)} />

      <h3 style={{ marginBottom: 12, marginTop: 16 }}>My Complaints</h3>
      {complaints.length === 0 && (
        <p style={{ color: "#94a3b8" }}>No complaints yet.</p>
      )}
      {complaints.map((c) => (
        <div key={c._id} className="card">
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <strong>{c.complaintId}</strong>
            <span className={`badge badge-${c.status}`}>
              {c.status?.toUpperCase()}
            </span>
          </div>
          <p style={{ marginTop: 6, fontSize: 14, color: "#94a3b8" }}>
            {c.title}
          </p>
        </div>
      ))}
    </div>
  );
}
