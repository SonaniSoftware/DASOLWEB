import { themeMaterial } from 'ag-grid-community';

/**
 * Shared AG Grid theme for the developer master grids.
 * Compact 32px rows, light-gray 44px header. Footer (pagination bar)
 * height/background is set globally in styles.scss (no theme param for it).
 */
export const gridTheme = themeMaterial.withParams({
  rowHeight: 32,
  headerHeight: 32,
  headerBackgroundColor: '#f0f3f8',
  headerTextColor: '#344054',
  rowBorder: { width: 1, color: '#e6ebf1' },          // horizontal lines between rows
  columnBorder: { width: 1, color: '#e6ebf1' },       // vertical lines between columns
  headerColumnBorder: { width: 1, color: '#e6ebf1' }, // vertical lines in the header
});

/** Active/Inactive badge HTML for AG Grid cellRenderer. */
export function statusBadge(active: unknown): string {
  return active
    ? '<span class="badge bg-success-subtle text-success">Active</span>'
    : '<span class="badge bg-secondary-subtle text-secondary">Inactive</span>';
}
