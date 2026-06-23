import api from "../api/axios";

export const getStats = () => api.get("/analytics/stats");

export const getMonthlyTrend = () => api.get("/analytics/monthly-trend");

export const getDepartmentDistribution = () =>
  api.get("/analytics/department-distribution");

export const getStatusDistribution = () =>
  api.get("/analytics/status-distribution");

export const getPriorityDistribution = () =>
  api.get("/analytics/priority-distribution");

export const getAreaTrend = () => api.get("/analytics/area-trend");

export const getWorkerPerformance = () =>
  api.get("/analytics/worker-performance");
