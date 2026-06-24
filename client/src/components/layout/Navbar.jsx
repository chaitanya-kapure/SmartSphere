import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useSocket } from "../../contexts/SocketContext";

function NotificationDropdown({ notifications, unreadCount, onMarkRead, onMarkAllRead, onClose }) {
  return (
    <div
      style={{
        position: "absolute",
        top: "100%",
        right: 0,
        width: 360,
        maxHeight: 420,
        overflowY: "auto",
        background: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: 8,
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        zIndex: 1000,
        color: "#1e293b",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px 14px",
          borderBottom: "1px solid #e2e8f0",
          fontWeight: 600,
          fontSize: 14,
        }}
      >
        <span>Notifications {unreadCount > 0 && `(${unreadCount})`}</span>
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllRead}
            style={{
              background: "none",
              border: "none",
              color: "#6366f1",
              cursor: "pointer",
              fontSize: 12,
              padding: 0,
            }}
          >
            Mark all read
          </button>
        )}
      </div>
      {notifications.length === 0 && (
        <div style={{ padding: 20, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
          No notifications
        </div>
      )}
      {notifications.map((n) => (
        <div
          key={n._id}
          onClick={() => onMarkRead(n._id)}
          style={{
            padding: "10px 14px",
            borderBottom: "1px solid #f1f5f9",
            background: n.isRead ? "transparent" : "#eef2ff",
            cursor: "pointer",
            fontSize: 13,
          }}
        >
          <div style={{ fontWeight: n.isRead ? 400 : 600 }}>{n.title}</div>
          <div style={{ color: "#64748b", fontSize: 12, marginTop: 2 }}>{n.message}</div>
        </div>
      ))}
    </div>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markRead, markAllRead } = useSocket();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

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
        background: "#ffffff",
        padding: "12px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        color: "#1e293b",
        borderBottom: "1px solid #e2e8f0",
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
            <div ref={ref} style={{ position: "relative" }}>
              <button
                onClick={() => setOpen(!open)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#1e293b",
                  cursor: "pointer",
                  fontSize: 18,
                  position: "relative",
                  padding: "4px 8px",
                }}
                aria-label="Notifications"
              >
                {"\u{1F514}"}
                {unreadCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      background: "#ef4444",
                      color: "#fff",
                      fontSize: 10,
                      fontWeight: 700,
                      borderRadius: "50%",
                      width: 16,
                      height: 16,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
              {open && (
                <NotificationDropdown
                  notifications={notifications}
                  unreadCount={unreadCount}
                  onMarkRead={(id) => {
                    markRead(id);
                  }}
                  onMarkAllRead={markAllRead}
                  onClose={() => setOpen(false)}
                />
              )}
            </div>
            <span style={{ color: "#64748b", fontSize: 14 }}>
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
