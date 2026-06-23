import React, { useEffect, useState } from "react";
import { getComplaints } from "../../services/complaintService";
import ComplaintMap from "../../components/maps/ComplaintMap";
import MapFilters from "../../components/maps/MapFilters";

export default function AdminDashboard() {
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

  const stats = {
    total: complaints.length,
    pending: complaints.filter((c) => c.status === "pending").length,
    assigned: complaints.filter((c) => c.status === "assigned").length,
    inProgress: complaints.filter((c) => c.status === "in_progress").length,
    resolved: complaints.filter((c) => c.status === "resolved").length,
  };

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>Admin Dashboard</h2>

      <div
        className="grid-2"
        style={{ gridTemplateColumns: "repeat(4, 1fr)", marginBottom: 16 }}
      >
        <div className="card" style={{ textAlign: "center" }}>
          <p style={{ fontSize: 28, fontWeight: "bold", color: "#6366f1" }}>{stats.total}</p>
          <p style={{ fontSize: 12, color: "#94a3b8" }}>Total</p>
        </div>
        <div className="card" style={{ textAlign: "center" }}>
          <p style={{ fontSize: 28, fontWeight: "bold", color: "#fb923c" }}>{stats.pending}</p>
          <p style={{ fontSize: 12, color: "#94a3b8" }}>Pending</p>
        </div>
        <div className="card" style={{ textAlign: "center" }}>
          <p style={{ fontSize: 28, fontWeight: "bold", color: "#3b82f6" }}>{stats.assigned}</p>
          <p style={{ fontSize: 12, color: "#94a3b8" }}>Assigned</p>
        </div>
        <div className="card" style={{ textAlign: "center" }}>
          <p style={{ fontSize: 28, fontWeight: "bold", color: "#22c55e" }}>{stats.resolved}</p>
          <p style={{ fontSize: 12, color: "#94a3b8" }}>Resolved</p>
        </div>
      </div>

      <ComplaintMap complaints={complaints} height={450} />
      <MapFilters filters={filters} onChange={setFilters} onApply={() => load(filters)} />
    </div>
  );
}
