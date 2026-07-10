// src/api/services/registrationRequestsApi.js
// معاد كتابته ليستخدم httpClient الموحّد (بدل axios منفصل) ويطابق Swagger بالظبط.
//
// ملاحظة مهمة: الـ backend بيرجّع الـ DTO مباشرة، مفيش wrapper زي { success, data }.
// يعني لو الطلب نجح، الـ response هو نفسه البيانات (object أو { items, page, pageSize, totalCount }).
// لو الطلب فشل، httpClient بيرمي Error (مش بيرجع { success: false }).

import { httpClient } from '../httpClient';
import { toQuery } from '../utils';

export const registrationRequestsApi = {
  // GET /api/registration-requests?status=&search=&page=&pageSize=
  // Response: RegistrationRequestListItemDtoPagedResult { items, page, pageSize, totalCount }
  getAll: (params) => httpClient.get(`/registration-requests${toQuery(params)}`),

  // GET /api/registration-requests/counts
  getCounts: () => httpClient.get('/registration-requests/counts'),

  // GET /api/registration-requests/{id}
  // Response: RegistrationRequestDetailsDto { id, requestCode, entityType, submittedAt,
  //           registrationStatus, adminNotes, rejectionReason, account, entity, documents }
  getById: (id) => httpClient.get(`/registration-requests/${id}`),

  // POST /api/registration-requests/{id}/approve  (no body)
  approve: (id) => httpClient.post(`/registration-requests/${id}/approve`),

  // POST /api/registration-requests/{id}/reject
  // Body (RejectRequestDto): { rejectionReason }
  reject: (id, rejectionReason) =>
    httpClient.post(`/registration-requests/${id}/reject`, { rejectionReason }),

  // POST /api/registration-requests/{id}/request-more-documents
  // Body (RequestMoreDocumentsDto): { adminNotes, documentIdsNeedingReplacement }
  requestMoreDocuments: (id, adminNotes, documentIdsNeedingReplacement = []) =>
    httpClient.post(`/registration-requests/${id}/request-more-documents`, {
      adminNotes,
      documentIdsNeedingReplacement,
    }),

  // POST /api/registration-requests/documents/{documentId}/status
  // Body (DocumentStatusUpdateDto): { status, rejectionReason }
  updateDocumentStatus: (documentId, status, rejectionReason) =>
    httpClient.post(`/registration-requests/documents/${documentId}/status`, {
      status,
      rejectionReason,
    }),
};

export default registrationRequestsApi;