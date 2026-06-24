import React, { useEffect, useState } from "react";
import { getComplaints, assignWorker, approveComplaint, rejectComplaint } from "../../services/complaintService";
import { getDepartmentWorkers } from "../../services/workerService";
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
  const [selectedWorker, setSelectedWorker] = useState("");
  const [workers, setWorkers] = useState([]);
  const [stats, setStats] = useState(null);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [statusDist, setStatusDist] = useState([]);
  const [priorityDist, setPriorityDist] = useState([]);
  const [workerPerf, setWorkerPerf] = useState([]);
  const [verificationTasks, setVerificationTasks] = useState([]);
  const [rejecting, setRejecting] = useState(null);
  const [rejectRemark, setRejectRemark] = useState("");

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

  const loadVerificationTasks = async () => {
    try {
      const { data } = await getComplaints({ status: "verification" });
      setVerificationTasks(data);
    } catch {
      setVerificationTasks([]);
    }
  };

  useEffect(() => {
    load();
    loadAnalytics();
    loadVerificationTasks();
    getDepartmentWorkers().then(setWorkers).catch(() => {});
  }, []);

  const handleAssign = async (complaintId) => {
    try {
      await assignWorker(complaintId, selectedWorker);
      setAssigning(null);
      setSelectedWorker("");
      load();
    } catch (err) {
      alert(err.response?.data?.error || "Assignment failed");
    }
  };

  const handleApprove = async (complaintId) => {
    try {
      await approveComplaint(complaintId);
      loadVerificationTasks();
      load();
    } catch (err) {
      alert(err.response?.data?.error || "Approval failed");
    }
  };

  const handleReject = async (complaintId) => {
    try {
      await rejectComplaint(complaintId, rejectRemark);
      setRejecting(null);
      setRejectRemark("");
      loadVerificationTasks();
      load();
    } catch (err) {
      alert(err.response?.data?.error || "Rejection failed");
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
        Pending Verification
      </h3>
      {verificationTasks.length === 0 && (
        <p style={{ color: "#64748b", marginBottom: 16 }}>
          No complaints pending verification.
        </p>
      )}
      {verificationTasks.map((c) => (
        <div key={c._id} className="card" style={{ borderLeft: "4px solid #f59e0b" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <strong>{c.complaintId}</strong>
            <span className={`badge badge-${c.status}`}>
              {c.status?.toUpperCase()}
            </span>
          </div>
          <p style={{ marginTop: 4, fontWeight: 600 }}>{c.title}</p>
          <p style={{ fontSize: 13, color: "#64748b" }}>{c.description}</p>
          {c.assignedWorker && (
            <p style={{ fontSize: 12, color: "#64748b" }}>
              Worker: {c.assignedWorker.name} ({c.assignedWorker.email})
            </p>
          )}
          {c.completedAt && (
            <p style={{ fontSize: 12, color: "#64748b" }}>
              Completed: {new Date(c.completedAt).toLocaleString()}
            </p>
          )}
          {c.proofImages && c.proofImages.length > 0 && (
            <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
              {c.proofImages.map((img, i) => (
                <a key={i} href={img.url} target="_blank" rel="noopener noreferrer">
                  <img
                    src={img.url}
                    alt={`proof ${i + 1}`}
                    style={{ width: 120, height: 90, objectFit: "cover", borderRadius: 4, border: "1px solid #cbd5e1" }}
                  />
                </a>
              ))}
            </div>
          )}
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <button className="btn btn-sm" style={{ background: "#22c55e" }} onClick={() => handleApprove(c._id)}>
              Approve
            </button>
            {rejecting === c._id ? (
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  className="input"
                  style={{ marginBottom: 0, width: 200 }}
                  placeholder="Reason for rejection"
                  value={rejectRemark}
                  onChange={(e) => setRejectRemark(e.target.value)}
                />
                <button className="btn btn-sm btn-danger" onClick={() => handleReject(c._id)} disabled={!rejectRemark.trim()}>
                  Confirm
                </button>
                <button className="btn btn-sm" onClick={() => { setRejecting(null); setRejectRemark(""); }}>
                  Cancel
                </button>
              </div>
            ) : (
              <button className="btn btn-sm btn-danger" onClick={() => setRejecting(c._id)}>
                Reject
              </button>
            )}
          </div>
        </div>
      ))}

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
          <p style={{ marginTop: 6, fontSize: 14, color: "#64748b" }}>
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
                  <select
                    className="input"
                    style={{ marginBottom: 0, width: 220 }}
                    value={selectedWorker}
                    onChange={(e) => setSelectedWorker(e.target.value)}
                  >
                    <option value="">Select Worker</option>
                    {workers.map((w) => (
                      <option key={w._id} value={w._id}>
                        {w.name} ({w.email})
                      </option>
                    ))}
                  </select>
                  <button
                    className="btn btn-sm"
                    onClick={() => handleAssign(c._id)}
                    disabled={!selectedWorker}
                  >
                    Assign
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => {
                      setAssigning(null);
                      setSelectedWorker("");
                    }}
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

        </div>
      ))}
    </div>
  );
}
