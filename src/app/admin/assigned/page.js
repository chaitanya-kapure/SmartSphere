'use client';
import { useEffect, useState } from 'react';
import { db } from "../../../lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function Assigned() {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState("all");

  const load = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "complaints"));

      const all = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // 🔥 only assigned tasks
      const assigned = all.filter(x => x.assignedTo);

      setData(assigned);
    } catch (err) {
      console.error("Error loading data:", err);
    }
  };
  console.log("Calling email API...");

  useEffect(() => { load(); }, []);

  // 🔥 Apply filter
  const filteredData = data.filter(item => {
    if (filter === "all") return true;
    return item.status === filter;
  });

  return (
    <div className="home-wrapper">

      <h2 className="title">Assigned Tasks 🛠️</h2>
      <p className="subtitle">Track worker progress</p>

      {/* 🔥 FILTER BUTTONS */}
      <div className="filter-bar">
        <button onClick={() => setFilter("all")} className={`filter-btn ${filter==="all" ? "active" : ""}`}>All</button>
        <button onClick={() => setFilter("assigned")} className={`filter-btn ${filter==="assigned" ? "active" : ""}`}>Assigned</button>
        <button onClick={() => setFilter("done")} className={`filter-btn ${filter==="done" ? "active" : ""}`}>Done</button>
      </div>

      <div className="worker-container">

        {filteredData.length === 0 && <p>No tasks found 🚀</p>}

        {filteredData.map(c => (
          <div key={c.id} className="card">

            {/* 🔥 BASIC INFO */}
            <p><b>📍 Area:</b> {c.area}</p>
            <p><b>📝 Description:</b> {c.description}</p>

            {/* 🔥 USER IMAGE */}
            {c.image && (
              <>
                <p><b>📸 User Image:</b></p>
                <img src={c.image} className="preview-img" />
              </>
            )}

            {/* 🔥 ASSIGNMENT */}
            <p><b>👷 Worker:</b> {c.assignedTo}</p>

            {/* 🔥 STATUS BADGE */}
            <p>
              <b>Status:</b>{" "}
              <span className={`status ${c.status || "pending"}`}>
                {(c.status || "pending").toUpperCase()}
              </span>
            </p>

            {/* 🔥 INSTRUCTION */}
            <p><b>📌 Instruction:</b> {c.instruction}</p>

            {/* 🔥 WORKER PROOF */}
            {c.workerProof ? (
              <>
                <p><b>✅ Worker Proof:</b></p>
                <img src={c.workerProof} className="preview-img" />
              </>
            ) : (
              <p style={{ color: "gray" }}>No proof uploaded yet</p>
            )}

          </div>
        ))}

      </div>

    </div>
  );
}