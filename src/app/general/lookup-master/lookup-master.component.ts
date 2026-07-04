import { Component, OnInit, inject } from '@angular/core';
import { ColDef, ICellRendererParams } from 'ag-grid-community';
import { GeneralService, LookupRow } from '../../core/services/general.service';
import { NotificationService } from '../../core/services/notification.service';
import { GridActionsComponent } from '../../developer/grid-actions.component';
import { statusBadge, gridTheme } from '../../developer/grid-shared';

@Component({
  selector: 'app-lookup-master',
  standalone: false,
  templateUrl: './lookup-master.component.html',
  styleUrl: '../../developer/developer-page.scss',
})
export class LookupMasterComponent implements OnInit {
  private gen = inject(GeneralService);
  private notify = inject(NotificationService);

  rows: LookupRow[] = [];
  loading = false;
  showForm = false;
  /** Composite key of the row being edited; null when adding. */
  editKey: { type: string; id: number } | null = null;
  model = { lookupType: '', lookupCode: '', lookupName: '', remarks: '', isActive: true };
  /** True when the user picked "New type…" so the Type field becomes free text. */
  newType = false;
  /** Grid filter: show only this LookupType ('' = all). Sent to GEN_LookupMaster_GetData. */
  filterType = '';
  /** Master list of every LookupType seen, for the filter + Type dropdowns (never shrinks). */
  allTypes: string[] = [];

  // AG Grid
  readonly theme = gridTheme;
  readonly context = { componentParent: this };
  readonly defaultColDef: ColDef = { sortable: true, filter: true, resizable: true, flex: 1 };
  readonly columnDefs: ColDef[] = [
    { headerName: '#', field: 'LookupID', maxWidth: 90, flex: 0 },
    { headerName: 'Type', field: 'LookupType', maxWidth: 220 },
    { headerName: 'Code', field: 'LookupCode', maxWidth: 160 },
    { headerName: 'Name', field: 'LookupName' },
    { headerName: 'Remarks', field: 'Remarks' },
    { headerName: 'Status', field: 'ISActive', maxWidth: 140, cellRenderer: (p: ICellRendererParams) => statusBadge(p.value) },
    { headerName: 'Actions', cellRenderer: GridActionsComponent, sortable: false, filter: false, maxWidth: 130, flex: 0 },
  ];

  /** LookupType values for the "New Lookup" Type dropdown (full master list). */
  get lookupTypes(): string[] {
    return this.allTypes;
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.gen.listLookups(this.filterType || undefined).subscribe({
      next: (r) => {
        this.rows = r;
        // Grow the master type list (never shrink) so filtering keeps every option.
        this.allTypes = [...new Set([...this.allTypes, ...r.map((x) => x.LookupType)])].sort((a, b) => a.localeCompare(b));
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  add(): void {
    this.editKey = null;
    this.newType = false;
    this.model = { lookupType: '', lookupCode: '', lookupName: '', remarks: '', isActive: true };
    this.showForm = true;
  }

  /** Type <select> change: the "New type…" sentinel switches to a text input. */
  onTypeChange(value: string): void {
    if (value === '__NEW__') {
      this.newType = true;
      this.model.lookupType = '';
    }
  }

  edit(row: LookupRow): void {
    this.editKey = { type: row.LookupType, id: row.LookupID };
    // Load the latest record by id (GEN_LookupMaster_DataById); fall back to the grid row.
    this.newType = false;
    this.gen.getLookup(row.LookupType, row.LookupID).subscribe({
      next: (r) => { this.fillForm(r ?? row); },
      error: () => { this.fillForm(row); },
    });
  }

  private fillForm(row: LookupRow): void {
    this.model = {
      lookupType: row.LookupType,
      lookupCode: row.LookupCode ?? '',
      lookupName: row.LookupName,
      remarks: row.Remarks ?? '',
      isActive: !!row.ISActive,
    };
    this.showForm = true;
  }

  save(): void {
    if (!this.model.lookupType || !this.model.lookupName) {
      this.notify.warning('Type and name are required.');
      return;
    }
    const req = this.editKey
      ? this.gen.updateLookup(this.editKey.type, this.editKey.id, this.model)
      : this.gen.createLookup(this.model);
    req.subscribe({
      next: () => { this.notify.success('Saved.'); this.showForm = false; this.load(); },
      error: (e) => this.notify.error(e?.error?.message ?? 'Save failed.'),
    });
  }

  remove(row: LookupRow): void {
    if (!confirm(`Delete lookup "${row.LookupName}"?`)) return;
    this.gen.deleteLookup(row.LookupType, row.LookupID).subscribe({
      next: () => { this.notify.success('Deleted.'); this.load(); },
      error: (e) => this.notify.error(e?.error?.message ?? 'Delete failed.'),
    });
  }
}
