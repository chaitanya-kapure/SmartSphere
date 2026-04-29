'use client';
import { useEffect, useState } from 'react';
import { db } from "../../../lib/firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";

export default function Pending() {
  const [data, setData] = useState([]);

  const load = async () => {
    const querySnapshot = await getDocs(collection(db, "complaints"));

    const all = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // 🔥 only pending (not assigned yet)
    const pending = all.filter(x => !x.assignedTo);

    setData(pending);
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="container">
      <h2>Pending Requests</h2>

      {data.length === 0 && <p>No pending requests 🚀</p>}

      {data.map(c => (
        <div key={c.id} className="card">

          <p><b>Area:</b> {c.area}</p>
          <p><b>Description:</b> {c.description}</p>

          {c.image && (
            <img 
              src={c.image} 
              width={220} 
              style={{ borderRadius: "10px", marginBottom: "10px" }}
            />
          )}

          <AssignBox id={c.id} reload={load} />

        </div>
      ))}
    </div>
  );
}

function AssignBox({ id, reload }) {
  const [email, setEmail] = useState("");
  const [instruction, setInstruction] = useState("");

  const assign = async () => {
    if (!email || !instruction) {
      alert("Fill all fields ❗");
      return;
    }

    // 🔥 Update Firebase instead of API
    await updateDoc(doc(db, "complaints", id), {
      assignedTo: email,
      instruction,
      status: "assigned"
    });

    // 🔥 OPTIONAL: call API for email
    await fetch('/api/assign', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        worker: email,
        instruction
      })
    });

    alert("Assigned Successfully ✅");

    setEmail("");
    setInstruction("");

    reload();
  };

  return (
    <div style={{ marginTop: "10px" }}>

      <input
        className="input"
        placeholder="Worker Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <textarea
        className="input"
        placeholder="Instructions"
        value={instruction}
        onChange={(e) => setInstruction(e.target.value)}
      />

      <button className="btn" onClick={assign}>
        Assign Work 🚀
      </button>

    </div>
  );
}