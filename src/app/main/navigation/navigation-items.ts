import { MODULE_GROUPS } from '../../modules/module-groups';

export interface NavigationItem {
  id: string;
  title: string;
  type: 'item' | 'collapse' | 'group';
  /** Material icon name (https://fonts.google.com/icons). */
  icon?: string;
  /** Router path for leaf items. Omit for not-yet-built placeholder items. */
  url?: string;
  /** External link (opens in a new tab). */
  external?: boolean;
  children?: NavigationItem[];
}

/**
 * Sidebar is built from dbo.STT_ModuleGroup. Each group opens its module page
 * (/modules/:code) which exposes the Master / Module Group / View / Report tabs.
 */
export const NavigationItems: NavigationItem[] = [
  {
    id: 'navigation',
    title: 'Navigation',
    type: 'group',
    children: [
      { id: 'dashboard', title: 'Dashboard', type: 'item', url: '/dashboard/default', icon: 'dashboard' },
    ],
  },
  {
    id: 'modules',
    title: 'Modules',
    type: 'group',
    children: MODULE_GROUPS.map((g) => ({
      id: g.code.toLowerCase(),
      title: g.name,
      type: 'item' as const,
      url: `/modules/${g.code.toLowerCase()}`,
      icon: g.icon,
    })),
  },
];
