import API from "./axios";

export const createProjectAPI = (data) => API.post("/projects", data);
export const getProjectsAPI = () => API.get("/projects");
export const getProjectAPI = (id) => API.get(`/projects/${id}`);
export const addMemberAPI = (id, data) => API.patch(`/projects/${id}/add-member`, data);
export const deleteProjectAPI = (id) => API.delete(`/projects/${id}`);
