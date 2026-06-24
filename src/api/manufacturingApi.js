// src/api/manufacturingApi.js

const delay = (ms = 500) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const MOCK_STATS = {
  totalManufacturers: 1234,
  pendingRequests: 36,
  violations: 7,
};


const MOCK_TABS = {
  manufacturing: [
    { id: 'MFG-001', facility: 'Eva Pharma Facility', type: 'New Product Line', severity: 'Medium', country: 'Egypt', status: 'Under Review' },
    { id: 'MFG-002', facility: 'Pharco Industries', type: 'Capacity Expansion', severity: 'High', country: 'Egypt', status: 'Monitoring' },
    { id: 'MFG-003', facility: 'CID Pharma', type: 'Equipment Upgrade', severity: 'Medium', country: 'Egypt', status: 'Open' },
    { id: 'MFG-004', facility: 'Memphis Pharma', type: 'Process Modification', severity: 'Critical', country: 'Egypt', status: 'Resolved' },
    { id: 'MFG-005', facility: 'Amoun Pharma', type: 'Quality Audit Request', severity: 'Low', country: 'Egypt', status: 'Under Review' },
    { id: 'MFG-006', facility: 'Hikma Egypt', type: 'Annual Renewal', severity: 'Medium', country: 'Egypt', status: 'Open' },
  ],

  batch: [
    { id: 'BAT-001', facility: 'Eva Pharma Facility', type: 'Batch Release', severity: 'Medium', country: 'Belgium', status: 'Under Review' },
    { id: 'BAT-002', facility: 'Pharco Industries', type: 'Batch Recall', severity: 'High', country: 'Switzerland', status: 'Monitoring' },
    { id: 'BAT-003', facility: 'CID Pharma', type: 'Batch Hold', severity: 'Medium', country: 'Germany', status: 'Open' },
  ],

  inspections: [
    { id: 'INS-001', facility: 'Eva Pharma Facility', type: 'Routine Inspection', severity: 'Medium', country: 'France', status: 'Resolved' },
    { id: 'INS-002', facility: 'Pharco Industries', type: 'GMP Audit', severity: 'High', country: 'UK', status: 'Under Review' },
    { id: 'INS-003', facility: 'Memphis Pharma', type: 'Surprise Inspection', severity: 'Critical', country: 'Switzerland', status: 'Open' },
  ],

  violations: [
    { id: 'VIO-001', facility: 'Eva Pharma Facility', type: 'Missing Batch Documentation', severity: 'Medium', country: 'Belgium', status: 'Under Review' },
    { id: 'VIO-002', facility: 'Pharco Industries', type: 'Safety Procedure Violation', severity: 'High', country: 'Switzerland', status: 'Monitoring' },
    { id: 'VIO-003', facility: 'CID Pharma', type: 'Temperature Compliance Issue', severity: 'Medium', country: 'Germany', status: 'Open' },
    { id: 'VIO-004', facility: 'Memphis Pharma', type: 'Expired Production License', severity: 'Critical', country: 'France', status: 'Resolved' },
    { id: 'VIO-005', facility: 'Amoun Pharma', type: 'Delayed Inspection Response', severity: 'Low', country: 'UK', status: 'Under Review' },
    { id: 'VIO-006', facility: 'Hikma Egypt', type: 'Incomplete Regulatory Report', severity: 'Medium', country: 'Switzerland', status: 'Open' },
  ],
};

const MOCK_REQUESTS = {
  manufacturing: [
    {
      id: 'MFG-001',
      facility: 'Eva Pharma Facility',
      type: 'New Product Line',
      severity: 'Medium',
      country: 'Egypt',
      status: 'Under Review',
    },
    {
      id: 'MFG-002',
      facility: 'Pharco Industries',
      type: 'Capacity Expansion',
      severity: 'High',
      country: 'Egypt',
      status: 'Monitoring',
    },
  ],

  batch: [
    {
      id: 'BAT-001',
      facility: 'Eva Pharma Facility',
      type: 'Batch Release',
      severity: 'Medium',
      country: 'Belgium',
      status: 'Under Review',
    },
  ],

  inspections: [
    {
      id: 'INS-001',
      facility: 'Eva Pharma Facility',
      type: 'Routine Inspection',
      severity: 'Medium',
      country: 'France',
      status: 'Resolved',
    },
  ],

  violations: [
    {
      id: 'VIO-001',
      facility: 'Eva Pharma Facility',
      type: 'Missing Batch Documentation',
      severity: 'Medium',
      country: 'Belgium',
      status: 'Under Review',
    },
  ],
};

const MOCK_DOCUMENTS = [
  {
    id: 1,
    name: 'Facility License.pdf',
    type: 'PDF',
    size: '2.4 MB',
    date: '2024-03-10',
  },
  {
    id: 2,
    name: 'GMP Certificate.pdf',
    type: 'PDF',
    size: '1.1 MB',
    date: '2024-02-28',
  },
];

const manufacturingApi = {
  // ==========================
  // Dashboard Stats
  // ==========================
  async getStats() {
    await delay();

    return {
      success: true,
      data: MOCK_STATS,
    };
  },

  // ==========================
  // Table Data
  // ==========================
  async getRequests({
    tab = 'manufacturing',
    page = 1,
    limit = 10,
    filters = {},
  } = {}) {
    await delay();

    let rows = [...(MOCK_TABS[tab] || [])];

    if (filters.search) {
      rows = rows.filter(
        (item) =>
          item.facility
            .toLowerCase()
            .includes(filters.search.toLowerCase()) ||
          item.id
            .toLowerCase()
            .includes(filters.search.toLowerCase())
      );
    }

    if (filters.status) {
      rows = rows.filter(
        (item) => item.status === filters.status
      );
    }

    const start = (page - 1) * limit;
    const end = start + limit;

    return {
      success: true,
      data: {
        items: rows.slice(start, end),
        total: rows.length,
      },
    };
  },

  // ==========================
  // Single Request Details
  // ==========================
  async getRequestDetails(id) {
    await delay();

    return {
      success: true,
      data: {
        request: {
          id,
          title: 'Manufacturing Facility Approval',
          companyName: 'Eva Pharma',
          email: 'imports@eva-pharma.com',
          requestType: 'Production Facility Approval',
          requestedAction:
            'Approve New Tablet Manufacturing Production Line',
          facilityType: 'Tablet Manufacturing',
          governorate: 'Cairo',
          capacity: '120,000 Units Monthly',
        },

        documents: MOCK_DOCUMENTS,
      },
    };
  },

  // ==========================
  // Approve
  // ==========================
  async approveRequest(id) {
    await delay();

    return {
      success: true,
      message: `Request ${id} approved successfully`,
    };
  },

  // ==========================
  // Reject
  // ==========================
  async rejectRequest(id) {
    await delay();

    return {
      success: true,
      message: `Request ${id} rejected successfully`,
    };
  },

  // ==========================
  // Delete
  // ==========================
  async deleteRequest(id) {
    await delay();

    return {
      success: true,
      message: `Request ${id} deleted successfully`,
    };
  },

  // ==========================
  // Export
  // ==========================
  async exportReport() {
    await delay();

    return {
      success: true,
      message: 'Report exported successfully',
    };
  },
};

export default manufacturingApi;