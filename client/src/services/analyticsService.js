import api from "./api";

export const getAnalytics = (id) => api.get(`/analytics/${id}`);
export const getPublicStats = (shortCode) => api.get(`/public-stats/${shortCode}`);

// Admin Endpoints
export const getAdminMetrics = () => api.get("/admin/metrics");
export const getAdminUsers = () => api.get("/admin/users");
export const getAdminUrls = (params) => api.get("/admin/urls", { params });
export const toggleAbusiveUrl = (urlId) => api.put(`/admin/urls/${urlId}/toggle`);

// Workspace Endpoints
export const createWorkspace = (name) => api.post("/workspaces", { name });
export const inviteWorkspaceMember = (workspaceId, email, role) => api.post(`/workspaces/${workspaceId}/invite`, { email, role });
export const removeWorkspaceMember = (workspaceId, userId) => api.delete(`/workspaces/${workspaceId}/members/${userId}`);
export const deleteWorkspace = (workspaceId) => api.delete(`/workspaces/${workspaceId}`);
