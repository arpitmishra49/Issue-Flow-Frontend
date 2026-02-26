import API from "./axios";

export const registerAPI = (data) => API.post("/auth/register", data);