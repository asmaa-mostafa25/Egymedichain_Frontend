const importApi = {
  getRequests: async () => ({
    success: true,
    data: {
      items: [],
      total: 0,
    },
  }),

  getStats: async () => ({
    success: true,
    data: {
      totalItems: 0,
      pending: 0,
      approved: 0,
    },
  }),

  deleteRequest: async () => ({
    success: true,
  }),
};

export default importApi;