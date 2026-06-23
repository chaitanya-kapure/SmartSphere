import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const dashboardLink = user
    ? user.role === "citizen"
      ? "/citizen"
      : user.role === "worker"
        ? "/worker"
        : user.role === "dept_head"
          ? "/dept-head"
          : "/admin"
    : "/";

  return (
    <nav
      style={{
        background: "#1e293b",
        padding: "12px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        color: "#e2e8f0",
      }}
    >
      <Link
        to={dashboardLink}
        style={{ color: "#6366f1", fontWeight: "bold", fontSize: 18, textDecoration: "none" }}
      >
        SmartSphere City
      </Link>
      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        {user && (
          <>
            <span style={{ color: "#94a3b8", fontSize: 14 }}>
              {user.name} ({user.role})
            </span>
            <button
              onClick={handleLogout}
              style={{
                background: "#ef4444",
                color: "#fff",
                border: "none",
                padding: "6px 14px",
                borderRadius: 6,
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
