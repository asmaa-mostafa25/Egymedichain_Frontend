import axiosInstance from './axios';

export const getUsersSummary = () => axiosInstance.get('/admin/users/summary');

export default axiosInstance;
