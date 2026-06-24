import api from "../api/axios";

export const getDepartmentWorkers = () =>
  api.get("/users/workers").then((r) => r.data.data);
