import { httpClient } from '../httpClient';
import { toQuery } from '../utils';
import { mapStaffMember } from '../mappers';

const mapPagedStaff = (result) => ({
  staff: (result?.items || []).map(mapStaffMember),
  total: result?.totalCount ?? 0,
  page: result?.page ?? 1,
  pageSize: result?.pageSize ?? 10,
});

export const staffApi = {
  getAll: async (params = {}) => {
    const result = await httpClient.get(
      `/admin/users${toQuery({
        search: params.search,
        role: params.role,
        page: params.page,
        pageSize: params.limit || params.pageSize || 10,
      })}`
    );
    return mapPagedStaff(result);
  },

  getStats: async () => httpClient.get('/admin/users/summary'),

  create: async (data) => {
    const payload = {
      fullName: data.name,
      email: data.officialEmail || data.email,
      mobileNumber: data.phone,
      nationalId: data.nationalId,
      role: data.role,
      temporaryPassword: data.password,
      sendResetLink: data.sendCredentialsTo === 'personalEmail',
    };
    const created = await httpClient.post('/admin/users', payload);
    return mapStaffMember(created);
  },

  activate: async (id) => httpClient.post(`/admin/users/${id}/activate`),
  deactivate: async (id) => httpClient.post(`/admin/users/${id}/deactivate`),

  delete: async (id) => httpClient.delete(`/admin/users/${id}`),

  // TODO: Backend endpoint missing in swagger.json — no staff update route.
  update: async () => {
    throw new Error('Update user API is not available yet');
  },

  // TODO: Backend endpoint missing in swagger.json — no password reset route.
  resetPassword: async () => {
    throw new Error('Reset password API is not available yet');
  },

  getById: async (id) => {
    const result = await httpClient.get(`/admin/users${toQuery({ page: 1, pageSize: 1 })}`);
    const match = (result?.items || []).find((item) => String(item.id) === String(id));
    return match ? mapStaffMember(match) : null;
  },
};

export default staffApi;