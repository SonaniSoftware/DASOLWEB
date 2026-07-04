import { themeMaterial } from 'ag-grid-community';

/**
 * Shared AG Grid theme for the developer master grids.
 * Compact 32px rows, light-gray 44px header. Footer (pagination bar)
 * height/background is set globally in styles.scss (no theme param for it).
 */
export const gridTheme = themeMaterial.withParams({
  rowHeight: 30,
  headerHeight: 32,
  backgroundColor: 'var(--bs-body-bg)',
  foregroundColor: 'var(--bs-body-color)',
  headerBackgroundColor: 'var(--bs-tertiary-bg)',
  headerTextColor: 'var(--bs-emphasis-color)',
  // Darker grid lines: mix the theme border colour toward the body text colour
  // so cell borders read clearly in both light and dark themes.
  rowBorder: { width: 1, color: 'color-mix(in srgb, var(--bs-border-color), var(--bs-body-color) 35%)' },          // horizontal lines between rows
  columnBorder: { width: 1, color: 'color-mix(in srgb, var(--bs-border-color), var(--bs-body-color) 35%)' },       // vertical lines between columns
  headerColumnBorder: { width: 1, color: 'color-mix(in srgb, var(--bs-border-color), var(--bs-body-color) 35%)' }, // vertical lines in the header
});

/** Active/Inactive badge HTML for AG Grid cellRenderer. */
export function statusBadge(active: unknown): string {
  return active
    ? '<span class="badge bg-success-subtle text-success">Active</span>'
    : '<span class="badge bg-secondary-subtle text-secondary">Inactive</span>';
}
