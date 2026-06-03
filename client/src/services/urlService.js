import api from "./api";

export const createUrl = (data) => api.post("/url/create", data);

export const bulkCreateUrls = (formData) => {
  return api.post("/url/bulk", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
};

export const unlockUrl = (shortCode, password) => {
  return api.post(`/url/unlock/${shortCode}`, { password });
};

export const getUrls = (params) => {
  return api.get("/url/myurls", { params });
};

export const getUrlById = (id) => {
  return api.get(`/url/${id}`);
};

export const updateUrl = (id, data) => {
  return api.put(`/url/${id}`, data);
};

export const deleteUrl = (id) => {
  return api.delete(`/url/${id}`);
};