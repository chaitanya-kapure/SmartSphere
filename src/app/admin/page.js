'use client';
import { useRouter } from 'next/navigation';

export default function Admin() {
  const r = useRouter();

  return (
    <div className="home-wrapper">

      <h2 className="title">Admin Dashboard 🧑‍💼</h2>
      <p className="subtitle">Manage complaints and assignments</p>

      <div className="card admin-card">

        <button
          className="btn admin-btn"
          onClick={() => r.push('/admin/pending')}
        >
          📋 User Pending Requests
        </button>

        <button
          className="btn admin-btn"
          onClick={() => r.push('/admin/assigned')}
        >
          🛠️ Assigned Tasks
        </button>

      </div>

    </div>
  );
}
