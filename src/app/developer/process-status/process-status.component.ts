import { Component, OnInit, inject } from '@angular/core';
import { ColDef, ICellRendererParams } from 'ag-grid-community';
import { DeveloperService, ProcessStatusRow, ProcessTypeRow } from '../../core/services/developer.service';
import { NotificationService } from '../../core/services/notification.service';
import { GridActionsComponent } from '../grid-actions.component';
import { statusBadge, gridTheme } from '../grid-shared';

@Component({
  selector: 'app-process-status',
  standalone: false,
  templateUrl: './process-status.component.html',
  styleUrl: '../developer-page.scss',
})
export class ProcessStatusComponent implements OnInit {
  private dev = inject(DeveloperService);
  private notify = inject(NotificationService);

  rows: ProcessStatusRow[] = [];
  types: ProcessTypeRow[] = [];
  loading = false;
  showForm = false;
  editKeys: { typeId: number; statusId: number } | null = null;
  model = { typeId: 0, statusCode: '', statusName: '', statusRemark: '', isActive: true };

  readonly theme = gridTheme;
  readonly context = { componentParent: this };
  readonly defaultColDef: ColDef = { sortable: true, filter: true, resizable: true, flex: 1 };
  readonly columnDefs: ColDef[] = [
    { headerName: 'Type', field: 'TypeName', maxWidth: 180 },
    { headerName: '#', field: 'StatusID', maxWidth: 90, flex: 0 },
    { headerName: 'Code', field: 'StatusCode', maxWidth: 180 },
    { headerName: 'Name', field: 'StatusName' },
    { headerName: 'Remark', field: 'StatusRemark' },
    { headerName: 'Status', field: 'ISActive', maxWidth: 120, cellRenderer: (p: ICellRendererParams) => statusBadge(p.value) },
    { headerName: 'Actions', cellRenderer: GridActionsComponent, sortable: false, filter: false, maxWidth: 120, flex: 0 },
  ];

  ngOnInit(): void {
    // Load types first so we can resolve TypeName for the grid + dropdown.
    this.dev.listProcessTypes().subscribe((t) => { this.types = t; this.load(); });
  }

  load(): void {
    this.loading = true;
    this.dev.listProcessStatuses().subscribe({
      next: (r) => {
        this.rows = r.map((row) => ({
          ...row,
          TypeName: this.types.find((t) => t.TypeID === row.TypeID)?.TypeName ?? '',
        }));
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  add(): void {
    this.editKeys = null;
    this.model = { typeId: this.types[0]?.TypeID ?? 0, statusCode: '', statusName: '', statusRemark: '', isActive: true };
    this.showForm = true;
  }

  edit(row: ProcessStatusRow): void {
    this.editKeys = { typeId: row.TypeID, statusId: row.StatusID };
    this.model = {
      typeId: row.TypeID, statusCode: row.StatusCode, statusName: row.StatusName,
      statusRemark: row.StatusRemark ?? '', isActive: !!row.ISActive,
    };
    this.showForm = true;
  }

  save(): void {
    if (!this.model.typeId || !this.model.statusCode || !this.model.statusName) {
      this.notify.warning('Type, code and name are required.');
      return;
    }
    const req = this.editKeys
      ? this.dev.updateProcessStatus(this.editKeys.typeId, this.editKeys.statusId, this.model)
      : this.dev.createProcessStatus(this.model);
    req.subscribe({
      next: () => { this.notify.success('Saved.'); this.showForm = false; this.load(); },
      error: (e) => this.notify.error(e?.error?.message ?? 'Save failed.'),
    });
  }

  remove(row: ProcessStatusRow): void {
    if (!confirm(`Delete status "${row.StatusName}"?`)) return;
    this.dev.deleteProcessStatus(row.TypeID, row.StatusID).subscribe({
      next: () => { this.notify.success('Deleted.'); this.load(); },
      error: (e) => this.notify.error(e?.error?.message ?? 'Delete failed.'),
    });
  }
}
