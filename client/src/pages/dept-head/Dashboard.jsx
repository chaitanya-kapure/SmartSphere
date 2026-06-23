import React, { useEffect, useState } from "react";
import { getComplaints, assignWorker } from "../../services/complaintService";
import ComplaintMap from "../../components/maps/ComplaintMap";
import MapFilters from "../../components/maps/MapFilters";
import StatsGrid from "../../components/charts/StatsGrid";
import MonthlyTrendChart from "../../components/charts/MonthlyTrendChart";
import StatusPieChart from "../../components/charts/StatusPieChart";
import PriorityPieChart from "../../components/charts/PriorityPieChart";
import WorkerPerfChart from "../../components/charts/WorkerPerfChart";
import {
  getStats,
  getMonthlyTrend,
  getStatusDistribution,
  getPriorityDistribution,
  getWorkerPerformance,
} from "../../services/analyticsService";

export default function DeptHeadDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [filters, setFilters] = useState({});
  const [assigning, setAssigning] = useState(null);
  const [workerEmail, setWorkerEmail] = useState("");
  const [stats, setStats] = useState(null);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [statusDist, setStatusDist] = useState([]);
  const [priorityDist, setPriorityDist] = useState([]);
  const [workerPerf, setWorkerPerf] = useState([]);

  const load = async (f = {}) => {
    try {
      const { data } = await getComplaints({
        department: filters.department,
        ...f,
      });
      setComplaints(data);
    } catch {
      setComplaints([]);
    }
  };

  const loadAnalytics = async () => {
    try {
      const [s, m, st, p, w] = await Promise.all([
        getStats(),
        getMonthlyTrend(),
        getStatusDistribution(),
        getPriorityDistribution(),
        getWorkerPerformance(),
      ]);
      setStats(s.data);
      setMonthlyTrend(m.data);
      setStatusDist(st.data);
      setPriorityDist(p.data);
      setWorkerPerf(w.data);
    } catch {}
  };

  useEffect(() => {
    load();
    loadAnalytics();
  }, []);

  const handleAssign = async (complaintId) => {
    try {
      await assignWorker(complaintId, workerEmail);
      setAssigning(null);
      setWorkerEmail("");
      load();
    } catch (err) {
      alert(err.response?.data?.error || "Assignment failed");
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>Department Head Dashboard</h2>

      <StatsGrid stats={stats} />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 16,
          marginBottom: 20,
        }}
      >
        <MonthlyTrendChart data={monthlyTrend} />
        <div>
          <StatusPieChart data={statusDist} />
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 16,
          marginBottom: 20,
        }}
      >
        <PriorityPieChart data={priorityDist} />
        <WorkerPerfChart data={workerPerf} />
      </div>

      <ComplaintMap complaints={complaints} height={350} />
      <MapFilters
        filters={filters}
        onChange={setFilters}
        onApply={() => load(filters)}
      />

      <h3 style={{ marginTop: 16, marginBottom: 12 }}>
        Department Complaints
      </h3>
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

          {(c.status === "pending" || c.status === "reopened") && (
            <div style={{ marginTop: 10 }}>
              {assigning === c._id ? (
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                  }}
                >
                  <input
                    className="input"
                    style={{ marginBottom: 0, width: 200 }}
                    placeholder="Worker ID"
                    value={workerEmail}
                    onChange={(e) => setWorkerEmail(e.target.value)}
                  />
                  <button
                    className="btn btn-sm"
                    onClick={() => handleAssign(c._id)}
                  >
                    Assign
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => setAssigning(null)}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  className="btn btn-sm"
                  onClick={() => setAssigning(c._id)}
                >
                  Assign Worker
                </button>
              )}
            </div>
          )}

          {c.status === "verification" && (
            <div style={{ marginTop: 10 }}>
              <button
                className="btn btn-sm"
                onClick={async () => {
                  try {
                    const { updateStatus } = await import(
                      "../../services/complaintService"
                    );
                    await updateStatus(c._id, {
                      status: "resolved",
                      remark: "Verified by department head",
                    });
                    load();
                  } catch (err) {
                    alert(
                      err.response?.data?.error || "Verification failed"
                    );
                  }
                }}
              >
                Verify & Resolve
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
