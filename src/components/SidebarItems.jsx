import {
  DashboardOutlined,
  ManageAccountsOutlined,
  SupervisorAccountOutlined,
  AssignmentIndOutlined,
  MedicalServicesOutlined,
  EventOutlined,
  AutoGraphOutlined,
  // ReceiptLongOutlined,
  SettingsOutlined,
  ExitToAppOutlined,
} from '@mui/icons-material';
import SpaOutlinedIcon from '@mui/icons-material/SpaOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';

export const sidebarItems = [
  {
    type: 'link',
    to: '/app/dashboard',
    primary: 'Dashboard',
    icon: DashboardOutlined,
  },
  {
    type: 'link',
    to: '/app/manage-users',
    primary: 'Users',
    icon: ManageAccountsOutlined,
  },
  {
    type: 'link',
    to: '/app/role',
    primary: 'Roles',
    icon: AssignmentIndOutlined,
  },
  {
    type: 'link',
    to: '/app/academic-year',
    primary: 'Academic Year',
    icon: SchoolOutlinedIcon,
  },
  {
    type: 'link',
    to: '/app/clinic-records',
    primary: 'Clinic Visit',
    icon: AssignmentOutlinedIcon,
  },
  {
    type: 'submenu',
    primary: 'Medicine Inventory',
    icon: MedicalServicesOutlined,
    submenuLinks: [
      { to: '/app/medicine-item', primary: 'Medicine Item' },
      { to: '/app/medicine-batch', primary: 'Medicine Batch' },
      { to: '/app/medicine-in', primary: 'Medicine In' },
      { to: '/app/medicine-dispense', primary: 'Medicine Dispense' },
      { to: '/app/medicine-adjustment', primary: 'Medicine Adjustment' },
    ],
  },
  {
    type: 'link',
    to: '/app/events',
    primary: 'Events',
    icon: EventOutlined,
  },
  {
    type: 'submenu',
    primary: 'Profile',
    icon: SupervisorAccountOutlined,
    submenuLinks: [
      { to: '/app/students-profile', primary: 'Student Profile' },
      { to: '/app/employee-profile', primary: 'Employee Profile' },
    ],
  },
  {
    type: 'submenu',
    primary: 'Programs',
    icon: SpaOutlinedIcon,
    submenuLinks: [
      { to: '/app/dengue-monitoring', primary: 'Dengue Monitoring' },
      { to: '/app/medical-checkup', primary: 'Medical Checkup' },
      { to: '/app/faculty-checkup', primary: 'Employee Checkup' },
      { to: '/app/dewormed-monitoring', primary: 'Dewormed Monitoring' },
      { to: '/app/feeding-program', primary: 'Feeding Program' },
    ],
  },
  {
    type: 'submenu',
    primary: 'Analytics',
    icon: AutoGraphOutlined,
    submenuLinks: [
      { to: '/app/dengue-analytics', primary: 'Dengue Analytics' },
      {
        to: '/app/dewormed-analytics',
        primary: 'Dewormed Analytics',
      },
      { to: '/app/medical-analytics', primary: 'Checkup Analytics' },
      { to: '/app/clinic-analytics', primary: 'Clinic Analytics' },
      { to: '/app/feeding-analytics', primary: 'Feeding Analytics' },
    ],
  },
  {
    type: 'link',
    to: '/app/settings',
    primary: 'Settings',
    icon: SettingsOutlined,
  },
  // {
  //   type: 'link',
  //   to: '/app/logs',
  //   primary: 'Logs',
  //   icon: ReceiptLongOutlined,
  // },
  {
    type: 'link',
    to: '/',
    primary: 'Logout',
    icon: ExitToAppOutlined,
    onClick: 'handleLogout',
  },
];
