import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { getNotifications, getUnreadCount, markRead, markAllRead } from "../services/notificationService";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      const { data } = await getNotifications();
      setNotifications(data);
    } catch {}
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const { data } = await getUnreadCount();
      setUnreadCount(data.count);
    } catch {}
  }, []);

  const handleMarkRead = useCallback(async (id) => {
    try {
      await markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {}
  }, []);

  const handleMarkAllRead = useCallback(async () => {
    try {
      await markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {}
  }, []);

  useEffect(() => {
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    const token = localStorage.getItem("accessToken");
    if (!token) return;

    const socket = io(process.env.REACT_APP_SOCKET_URL || "http://localhost:5000", {
      auth: { token },
    });

    socket.on("connect_error", () => {});

    socket.on("notification", (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    socket.on("complaint_created", () => {
      fetchNotifications();
      fetchUnreadCount();
    });

    socket.on("status_changed", () => {
      fetchNotifications();
      fetchUnreadCount();
    });

    socket.on("worker_assigned", () => {
      fetchNotifications();
      fetchUnreadCount();
    });

    socket.on("verification_requested", () => {
      fetchNotifications();
      fetchUnreadCount();
    });

    socketRef.current = socket;
    fetchNotifications();
    fetchUnreadCount();

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user, fetchNotifications, fetchUnreadCount]);

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        notifications,
        unreadCount,
        markRead: handleMarkRead,
        markAllRead: handleMarkAllRead,
        refresh: fetchNotifications,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
