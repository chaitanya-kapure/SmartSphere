import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Home() {
  const { user } = useAuth();

  return (
    <div style={{ textAlign: "center", paddingTop: 60 }}>
      <h1 style={{ fontSize: "2.8rem", color: "#6366f1", marginBottom: 10 }}>
        SmartSphere City
      </h1>
      <p style={{ color: "#94a3b8", marginBottom: 30, fontSize: 16 }}>
        Smart Urban Complaint Management System
      </p>
      {user ? (
        <p style={{ color: "#22c55e" }}>Logged in as {user.name}</p>
      ) : (
        <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
          <Link to="/login" className="btn" style={{ textDecoration: "none" }}>
            Login
          </Link>
          <Link to="/register" className="btn" style={{ textDecoration: "none" }}>
            Register
          </Link>
        </div>
      )}
    </div>
  );
}
