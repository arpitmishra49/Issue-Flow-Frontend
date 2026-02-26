import API from "./axios";

export const createIssueAPI = (data) => API.post("/issues", data);
export const getIssuesAPI = (params) => API.get("/issues", { params });
export const assignIssueAPI = (id, data) => API.patch(`/issues/${id}/assign`, data);
export const updateIssueStatusAPI = (id, data) => API.patch(`/issues/${id}/status`, data);
export const deleteIssueAPI = (id) => API.delete(`/issues/${id}`);