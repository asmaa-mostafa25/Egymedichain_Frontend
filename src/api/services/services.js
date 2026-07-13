// Add alongside your existing registrationRequestsApi export

export const batchesApi = {
  getAll: (params) => httpClient.get(`/api/batches${toQuery(params)}`),
  getById: (id) => httpClient.get(`/api/batches/${id}`),
  getSummary: () => httpClient.get('/api/batches/summary'),
  freeze: (id) => httpClient.post(`/api/batches/${id}/freeze`),
  createRecallAlert: (id, body) => httpClient.post(`/api/batches/${id}/create-recall-alert`, body),
};

export const alertsApi = {
  getAll: (params) => httpClient.get(`/api/alerts${toQuery(params)}`),
  getById: (id) => httpClient.get(`/api/alerts/${id}`),
  getCounts: () => httpClient.get('/api/alerts/counts'),
  getRecalls: (params) => httpClient.get(`/api/alerts/recalls${toQuery(params)}`),
  updateStatus: (id, body) => httpClient.post(`/api/alerts/${id}/status`, body),
};

// Assumed to already exist per your established pattern — add if missing:
export const registrationRequestsApi = {
  // ...existing getAll/getById/approve/reject/requestMoreDocuments
  getCounts: () => httpClient.get('/api/registration-requests/counts'),
};