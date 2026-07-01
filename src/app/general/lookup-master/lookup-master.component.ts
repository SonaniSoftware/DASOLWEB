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
  model = { lookupType: '', lookupCode: '', lookupName: '', isActive: true };

  // AG Grid
  readonly theme = gridTheme;
  readonly context = { componentParent: this };
  readonly defaultColDef: ColDef = { sortable: true, filter: true, resizable: true, flex: 1 };
  readonly columnDefs: ColDef[] = [
    { headerName: '#', field: 'LookupID', maxWidth: 90, flex: 0 },
    { headerName: 'Type', field: 'LookupType', maxWidth: 220 },
    { headerName: 'Code', field: 'LookupCode', maxWidth: 160 },
    { headerName: 'Name', field: 'LookupName' },
    { headerName: 'Status', field: 'ISActive', maxWidth: 140, cellRenderer: (p: ICellRendererParams) => statusBadge(p.value) },
    { headerName: 'Actions', cellRenderer: GridActionsComponent, sortable: false, filter: false, maxWidth: 130, flex: 0 },
  ];

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.gen.listLookups().subscribe({
      next: (r) => { this.rows = r; this.loading = false; },
      error: () => (this.loading = false),
    });
  }

  add(): void {
    this.editKey = null;
    this.model = { lookupType: '', lookupCode: '', lookupName: '', isActive: true };
    this.showForm = true;
  }

  edit(row: LookupRow): void {
    this.editKey = { type: row.LookupType, id: row.LookupID };
    this.model = {
      lookupType: row.LookupType,
      lookupCode: row.LookupCode ?? '',
      lookupName: row.LookupName,
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
