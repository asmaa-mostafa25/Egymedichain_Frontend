import {
  LayoutDashboard,
  ClipboardList,
  Building2,
  Factory,
  Warehouse,
  Store,
  Package,
  ShieldAlert,
  ShieldCheck,
  Users,
  Bell
} from 'lucide-react';
import config from '../config';

const { ROLES } = config;

const ALL_ROLES = [
  ROLES.MOH_ADMIN,
  ROLES.SUPER_ADMIN,
  ROLES.INSPECTOR,
  ROLES.ANALYST,
  ROLES.AUDITOR,
];

export const navigationConfig = [
  {
    id: 'overview',
    label: 'Overview',
    path: '/overview',
    icon: LayoutDashboard,
    roles: ALL_ROLES,
  },
  {
    id: 'registration-requests',
    label: 'RegistrationRequests',
    path: '/registrationrequests',
    icon: ClipboardList,
    roles: ALL_ROLES,
  },
  {
    id: 'entities-management',
    label: 'EntitiesManagement',
    icon: Building2,
    roles: ALL_ROLES,
    children: [
      {
        id: 'factory',
        label: 'Factory',
        path: '/entities-management?tab=factories',
        icon: Factory,
        roles: ALL_ROLES,
      },
      {
        id: 'warehouse',
        label: 'Warehouse',
        path: '/entities-management?tab=warehouses',
        icon: Warehouse,
        roles: ALL_ROLES,
      },
      {
        id: 'pharmacy',
        label: 'Pharmacy',
        path: '/entities-management?tab=pharmacies',
        icon: Store,
        roles: ALL_ROLES,
      },
    ],
  },
  {
    id: 'medicine-batch-monitoring',
    label: 'MedicineBatchMonitoring',
    path: '/medicine-batch-monitoring',
    icon: Package,
    roles: ALL_ROLES,
  },
  {
    id: 'alerts-public-scans',
    label: 'Alerts & Scans',
    path: '/alerts-public-scans',
    icon: Bell,
    roles: ALL_ROLES,
    badge: 'live',
  },
  {
    id: 'admin-audit',
    label: 'Admin & Audit',
    path: '/admin-audit',
    icon: ShieldCheck,
    roles: [ROLES.MOH_ADMIN, ROLES.SUPER_ADMIN, ROLES.AUDITOR],
  },
  {
    id: 'staff',
    label: 'Staff',
    path: '/staff',
    icon: Users,
    roles: ALL_ROLES,
  }
  // ✅ Settings شيلناها من هنا — موجودة في الأسفل في Sidebar كـ button
];

const filterByRole = (items, role) =>
  items
    .filter((item) => item.roles.includes(role))
    .map((item) =>
      item.children
        ? { ...item, children: filterByRole(item.children, role) }
        : item
    );

export const getNavigationForRole = (role) => {
  return filterByRole(navigationConfig, role);
};

export default navigationConfig;