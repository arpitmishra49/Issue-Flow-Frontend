import API from "./axios";

export const getProjectAnalyticsAPI = (projectId) =>
  API.get(`/analytics/${projectId}`);
