import api from "../api/axios";

export const createComplaint = (data) => api.post("/complaints", data);
export const getComplaints = (params) => api.get("/complaints", { params });
export const getComplaintById = (id) => api.get(`/complaints/${id}`);
export const assignWorker = (id, workerId) =>
  api.post(`/complaints/${id}/assign`, { workerId });
export const updateStatus = (id, data) =>
  api.post(`/complaints/${id}/status`, data);
export const approveComplaint = (id) =>
  api.post(`/complaints/${id}/approve`);
export const rejectComplaint = (id, remark) =>
  api.post(`/complaints/${id}/reject`, { remark });
export const getTimeline = (id) => api.get(`/complaints/${id}/timeline`);

export const getMapComplaints = (params) =>
  api.get("/maps/complaints", { params });
export const getNearby = (params) => api.get("/maps/nearby", { params });
export const reverseGeocode = (lat, lng) =>
  api.get("/maps/reverse-geocode", { params: { lat, lng } });

export const uploadImage = (file, endpoint, complaintId) => {
  const formData = new FormData();
  formData.append("image", file);
  if (complaintId) formData.append("complaintId", complaintId);
  return api.post(`/uploads/${endpoint}`, formData);
};
