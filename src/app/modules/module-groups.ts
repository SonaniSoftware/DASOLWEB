// Mirrors dbo.STT_ModuleGroup. Swap this static list for an API call
// (GET /modules/groups) once the backend exposes the module metadata tables.
export interface ModuleGroup {
  groupId: number;
  code: string;
  name: string;
  /** Material icon name. */
  icon: string;
  description: string;
}

export const MODULE_GROUPS: ModuleGroup[] = [
  { groupId: 1, code: 'DEV', name: 'Developer', icon: 'developer_mode', description: 'Developer & system administration' },
  { groupId: 2, code: 'GEN', name: 'General', icon: 'widgets', description: 'Common masters shared across modules' },
  { groupId: 3, code: 'STT', name: 'Settings', icon: 'settings', description: 'Masters, users and configuration' },
  { groupId: 4, code: 'HRM', name: 'Employee', icon: 'badge', description: 'Employees, attendance and payroll' },
  { groupId: 5, code: 'PRH', name: 'Purchase', icon: 'shopping_cart', description: 'Suppliers, orders and bills' },
  { groupId: 6, code: 'INV', name: 'Inventory', icon: 'inventory_2', description: 'Items, stock and warehouses' },
  { groupId: 7, code: 'ACC', name: 'Account', icon: 'account_balance_wallet', description: 'Ledgers, vouchers and finance' },
  { groupId: 8, code: 'SAL', name: 'Sales', icon: 'point_of_sale', description: 'Customers, invoices and quotations' },
  { groupId: 9, code: 'PRO', name: 'Production', icon: 'precision_manufacturing', description: 'Work orders and planning' },
  { groupId: 10, code: 'MNT', name: 'Maintenance', icon: 'build', description: 'Assets and maintenance schedules' },
];

export function findModuleGroup(code: string | null): ModuleGroup | undefined {
  if (!code) return undefined;
  return MODULE_GROUPS.find((g) => g.code.toLowerCase() === code.toLowerCase());
}

/** Material icon for a module group code (falls back to a generic folder icon). */
export function iconForCode(code: string): string {
  return findModuleGroup(code)?.icon ?? 'folder';
}

/** "EMPLOYEE" → "Employee", "STT SETTINGS" → "Stt Settings". */
export function titleCase(text: string): string {
  return (text ?? '').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Material icon for a MenuTab subgroup. */
export function iconForTab(tab: string): string {
  const map: Record<string, string> = {
    master: 'dataset',
    developer: 'developer_mode',
    report: 'assessment',
    view: 'table_view',
    transaction: 'receipt_long',
    setting: 'settings',
    settings: 'settings',
  };
  return map[(tab ?? '').toLowerCase()] ?? 'widgets';
}

/** The four sections every module group exposes. */
export type ModuleTabKey = 'master' | 'modulegroup' | 'view' | 'report';

export interface ModuleTab {
  key: ModuleTabKey;
  label: string;
  icon: string;
}

export const MODULE_TABS: ModuleTab[] = [
  { key: 'master', label: 'Master', icon: 'dataset' },
  { key: 'modulegroup', label: 'Module Group', icon: 'widgets' },
  { key: 'view', label: 'View', icon: 'table_view' },
  { key: 'report', label: 'Report', icon: 'assessment' },
];
