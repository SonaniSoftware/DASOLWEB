import { Component, OnInit, inject } from '@angular/core';
import { ColDef, ICellRendererParams } from 'ag-grid-community';
import { DeveloperService, ProcessTypeRow } from '../../core/services/developer.service';
import { NotificationService } from '../../core/services/notification.service';
import { GridActionsComponent } from '../grid-actions.component';
import { statusBadge, gridTheme } from '../grid-shared';

@Component({
  selector: 'app-process-type',
  standalone: false,
  templateUrl: './process-type.component.html',
  styleUrl: '../developer-page.scss',
})
export class ProcessTypeComponent implements OnInit {
  private dev = inject(DeveloperService);
  private notify = inject(NotificationService);

  rows: ProcessTypeRow[] = [];
  loading = false;
  showForm = false;
  editId: number | null = null;
  model = { typeCode: '', typeName: '', typeRemark: '', isActive: true };

  readonly theme = gridTheme;
  readonly context = { componentParent: this };
  readonly defaultColDef: ColDef = { sortable: true, filter: true, resizable: true, flex: 1 };
  readonly columnDefs: ColDef[] = [
    { headerName: '#', field: 'TypeID', maxWidth: 90, flex: 0 },
    { headerName: 'Code', field: 'TypeCode', maxWidth: 180 },
    { headerName: 'Name', field: 'TypeName' },
    { headerName: 'Remark', field: 'TypeRemark' },
    { headerName: 'Status', field: 'ISActive', maxWidth: 120, cellRenderer: (p: ICellRendererParams) => statusBadge(p.value) },
    { headerName: 'Actions', cellRenderer: GridActionsComponent, sortable: false, filter: false, maxWidth: 120, flex: 0 },
  ];

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.dev.listProcessTypes().subscribe({
      next: (r) => { this.rows = r; this.loading = false; },
      error: () => (this.loading = false),
    });
  }

  add(): void {
    this.editId = null;
    this.model = { typeCode: '', typeName: '', typeRemark: '', isActive: true };
    this.showForm = true;
  }

  edit(row: ProcessTypeRow): void {
    this.editId = row.TypeID;
    this.model = {
      typeCode: row.TypeCode, typeName: row.TypeName,
      typeRemark: row.TypeRemark ?? '', isActive: !!row.ISActive,
    };
    this.showForm = true;
  }

  save(): void {
    if (!this.model.typeCode || !this.model.typeName) {
      this.notify.warning('Code and name are required.');
      return;
    }
    const req = this.editId
      ? this.dev.updateProcessType(this.editId, this.model)
      : this.dev.createProcessType(this.model);
    req.subscribe({
      next: () => { this.notify.success('Saved.'); this.showForm = false; this.load(); },
      error: (e) => this.notify.error(e?.error?.message ?? 'Save failed.'),
    });
  }

  remove(row: ProcessTypeRow): void {
    if (!confirm(`Delete type "${row.TypeName}"?`)) return;
    this.dev.deleteProcessType(row.TypeID).subscribe({
      next: () => { this.notify.success('Deleted.'); this.load(); },
      error: (e) => this.notify.error(e?.error?.message ?? 'Delete failed.'),
    });
  }
}
