import { httpClient } from '../httpClient';
import { toQuery } from '../utils';

export const batchesService = {
  getSummary: () => httpClient.get('/batches/summary'),
  getAll: (params) => httpClient.get(`/batches${toQuery(params)}`),
  getById: (id) => httpClient.get(`/batches/${id}`),
  freeze: (id) => httpClient.post(`/batches/${id}/freeze`),
  createRecallAlert: (id, payload) =>
    httpClient.post(`/batches/${id}/create-recall-alert`, typeof payload === 'string' ? { message: payload } : payload),
};

export async function createRecallAlert(id, reason) {
  return batchesService.createRecallAlert(id, { message: reason });
}