'use client';
import { useEffect, useState } from 'react';
import { db } from "../../lib/firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";

export default function Worker() {
  const [tasks, setTasks] = useState([]);
  const [images, setImages] = useState({});
  const [workerEmail, setWorkerEmail] = useState("");

  // 🔥 Load saved email on page load
  useEffect(() => {
    const savedEmail = localStorage.getItem("workerEmail");
    if (savedEmail) {
      setWorkerEmail(savedEmail);
    }
  }, []);

  // 🔥 Save email whenever it changes
  useEffect(() => {
    if (workerEmail) {
      localStorage.setItem("workerEmail", workerEmail);
    }
  }, [workerEmail]);

  const load = async () => {
    const querySnapshot = await getDocs(collection(db, "complaints"));

    const all = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    const assigned = all.filter(
      x => x.assignedTo === workerEmail && x.status !== "done"
    );

    setTasks(assigned);
  };

  // 🔥 Reload tasks when email changes
  useEffect(() => {
    if (workerEmail) load();
  }, [workerEmail]);

  const handleImage = (e, id) => {
    const reader = new FileReader();
    reader.onload = () => {
      setImages(prev => ({
        ...prev,
        [id]: reader.result
      }));
    };
    reader.readAsDataURL(e.target.files[0]);
  };

  const done = async (id) => {
    const img = images[id];

    if (!img) {
      alert("📸 Please upload image");
      return;
    }

    await updateDoc(doc(db, "complaints", id), {
      workerProof: img,
      status: "done"
    });

    alert("✅ Task marked as done");

    // remove image for this task
    setImages(prev => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });

    load();
  };

  return (
    <div className="home-wrapper">

      <h2 className="title">Worker Panel 👷</h2>
      <p className="subtitle">Complete assigned tasks</p>

      {/* 🔥 EMAIL INPUT */}
      <input
        className="input"
        placeholder="Enter your email"
        value={workerEmail}
        onChange={(e) => setWorkerEmail(e.target.value)}
      />

      <div className="worker-container">

        {!workerEmail && <p>Enter your email to see tasks 👆</p>}

        {workerEmail && tasks.length === 0 && <p>No tasks assigned 🚀</p>}

        {tasks.map(t => (
          <div key={t.id} className="card worker-card">

            <p><b>📍 Area:</b> {t.area}</p>

            <label className="file-label">
              📸 Upload Work Proof
              <input 
                type="file" 
                onChange={(e) => handleImage(e, t.id)} 
                hidden 
              />
            </label>

            {images[t.id] && (
              <img src={images[t.id]} className="preview-img" />
            )}

            <button className="btn worker-btn" onClick={() => done(t.id)}>
              Mark as Done ✅
            </button>

          </div>
        ))}

      </div>

    </div>
  );
}