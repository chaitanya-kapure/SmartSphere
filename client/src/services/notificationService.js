import api from "../api/axios";

export const getNotifications = (unreadOnly = false) => {
  const params = unreadOnly ? "?unreadOnly=true" : "";
  return api.get(`/notifications${params}`);
};

export const getUnreadCount = () => api.get("/notifications/unread-count");

export const markRead = (id) => api.patch(`/notifications/${id}/read`);

export const markAllRead = () => api.patch("/notifications/read-all");
