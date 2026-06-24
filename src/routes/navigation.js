import {
  Home,
  LayoutDashboard,
  PackageSearch,
  Factory,
  Warehouse,
  ShieldCheck,
  Activity,
  Package,
  Truck,
  CheckSquare,
  Users,
  ClipboardList,
  BarChart3,
} from 'lucide-react';
import config from '../config';

const { ROLES } = config;

export const navigationConfig = [
  {
    id: 'home',
    label: 'Home',
    path: '/home',
    icon: Home,
    roles: [ROLES.MOH_ADMIN, ROLES.SUPER_ADMIN, ROLES.INSPECTOR, ROLES.ANALYST, ROLES.AUDITOR],
  },
  {
    id: 'dashboard',
    label: 'Main Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
    roles: [ROLES.MOH_ADMIN, ROLES.SUPER_ADMIN, ROLES.INSPECTOR, ROLES.ANALYST, ROLES.AUDITOR],
  },
  {
    id: 'import-operations',
    label: 'Import Operations',
    path: '/import-operations',
    icon: PackageSearch,
    roles: [ROLES.MOH_ADMIN, ROLES.SUPER_ADMIN, ROLES.INSPECTOR, ROLES.ANALYST, ROLES.AUDITOR],
  },
  {
  id: 'manufacturing-oversight',
  label: 'Manufacturing Oversight',
  path: '/manufacturing-oversight',
  icon: Factory,
  roles: [
    ROLES.MOH_ADMIN,
    ROLES.SUPER_ADMIN,
    ROLES.INSPECTOR,
    ROLES.ANALYST,
    ROLES.AUDITOR
  ],
  },

  {
    id: 'warehouse-monitoring',
    label: 'Warehouse Monitoring',
    path: '/warehouse-monitoring',
    icon: Warehouse,
    roles: [ROLES.MOH_ADMIN, ROLES.SUPER_ADMIN, ROLES.INSPECTOR, ROLES.ANALYST, ROLES.AUDITOR],
  },
  {
    id: 'pharmacy-compliance',
    label: 'Pharmacy Compliance',
    path: '/pharmacy-compliance',
    icon: ShieldCheck,
    roles: [ROLES.MOH_ADMIN, ROLES.SUPER_ADMIN, ROLES.INSPECTOR, ROLES.ANALYST, ROLES.AUDITOR],
  },
  {
    id: 'monitoring',
    label: 'Monitoring',
    path: '/monitoring',
    icon: Activity,
    roles: [ROLES.MOH_ADMIN, ROLES.SUPER_ADMIN, ROLES.INSPECTOR, ROLES.ANALYST, ROLES.AUDITOR],
    badge: 'live',
  },
  // {
  //   id: 'inventory',
  //   label: 'Inventory',
  //   path: '/inventory',
  //   icon: Package,
  //   roles: [ROLES.MOH_ADMIN, ROLES.SUPER_ADMIN, ROLES.INSPECTOR, ROLES.ANALYST, ROLES.AUDITOR],
  // },
  {
    id: 'shipments',
    label: 'Shipments',
    path: '/shipments',
    icon: Truck,
    roles: [ROLES.MOH_ADMIN, ROLES.SUPER_ADMIN, ROLES.INSPECTOR, ROLES.ANALYST, ROLES.AUDITOR],
  },
  {
    id: 'approvals',
    label: 'Approvals',
    path: '/approvals',
    icon: CheckSquare,
    roles: [ROLES.MOH_ADMIN, ROLES.SUPER_ADMIN, ROLES.AUDITOR],
  },
  {
    id: 'reports',
    label: 'Reports',
    path: '/reports',
    icon: BarChart3,
    roles: [ROLES.MOH_ADMIN, ROLES.SUPER_ADMIN, ROLES.ANALYST, ROLES.AUDITOR],
  },
  {
    id: 'staff',
    label: 'Staff Management',
    path: '/staff',
    icon: Users,
    roles: [ROLES.MOH_ADMIN, ROLES.SUPER_ADMIN],
  },
  {
    id: 'audit',
    label: 'Audit Logs',
    path: '/audit',
    icon: ClipboardList,
    roles: [ROLES.MOH_ADMIN, ROLES.SUPER_ADMIN, ROLES.AUDITOR],
  },
  // ✅ Settings شيلناها من هنا — موجودة في الأسفل في Sidebar كـ button
];

export const getNavigationForRole = (role) => {
  return navigationConfig.filter((item) => item.roles.includes(role));
};

export default navigationConfig;