import Link from 'next/link';

export default function Home() {
  return (
    <div className="home-wrapper">

      <h1 className="title">SmartSphere_City 🌐</h1>
      <p className="subtitle">Smart Urban Complaint Management System</p>

      <div className="card">
        <Link href="/citizen" className="btn">Citizen 👤</Link>
        <Link href="/admin" className="btn">Admin 🧑‍💼</Link>
        <Link href="/worker" className="btn">Worker 👷</Link>
      </div>

    </div>
  );
}