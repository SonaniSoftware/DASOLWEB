/** Active/Inactive badge HTML for AG Grid cellRenderer. */
export function statusBadge(active: unknown): string {
  return active
    ? '<span class="badge bg-success-subtle text-success">Active</span>'
    : '<span class="badge bg-secondary-subtle text-secondary">Inactive</span>';
}
