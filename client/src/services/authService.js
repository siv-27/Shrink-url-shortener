import api from "./api";

export const registerUser = (data) => api.post("/auth/register", data);
export const loginUser = (data) => api.post("/auth/login", data);
export const logoutUser = () => api.post("/auth/logout");
export const forgotPassword = (email) => api.post("/auth/forgot-password", { email });
export const resetPassword = (data) => api.post("/auth/reset-password", data);
export const getProfile = () => api.get("/auth/profile");
export const generateApiKey = (name) => api.post("/auth/api-keys", { name });
export const deleteApiKey = (keyId) => api.delete(`/auth/api-keys/${keyId}`);
export const updateProfile = (data) => api.put("/auth/profile", data);
export const changePassword = (data) => api.put("/auth/password", data);
export const deleteAccount = () => api.delete("/auth/account");