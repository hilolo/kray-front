/**
 * Application modules configuration
 */
export interface ModuleInfo {
  key: string;
  label: string;
  icon: string;
}

export const MODULES: ModuleInfo[] = [
  { key: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard' },
  { key: 'properties', label: 'Properties', icon: 'building' },
  { key: 'buildings', label: 'Buildings', icon: 'building-2' },
  { key: 'leasing', label: 'Leasing', icon: 'file-text' },
  { key: 'reservations', label: 'Reservations', icon: 'calendar' },
  { key: 'maintenance', label: 'Maintenance', icon: 'settings' },
  { key: 'contacts', label: 'Contacts', icon: 'users' },
  { key: 'keys', label: 'Keys', icon: 'lock' },
  { key: 'banks', label: 'Banks', icon: 'credit-card' },
  { key: 'payments', label: 'Payments', icon: 'circle-dollar-sign' },
  { key: 'file-manager', label: 'File Manager', icon: 'folder' },
  { key: 'reports', label: 'Reports', icon: 'file-spreadsheet' },
  { key: 'settings', label: 'Settings', icon: 'settings' },
] as const;

