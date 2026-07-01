import { Component, OnInit, inject } from '@angular/core';
import { ColDef, ICellRendererParams } from 'ag-grid-community';
import { DeveloperService, ProcessMasterRow, ProcessTypeRow } from '../../core/services/developer.service';
import { NotificationService } from '../../core/services/notification.service';
import { GridActionsComponent } from '../grid-actions.component';
import { statusBadge, gridTheme } from '../grid-shared';

@Component({
  selector: 'app-process-master',
  standalone: false,
  templateUrl: './process-master.component.html',
  styleUrl: '../developer-page.scss',
})
export class ProcessMasterComponent implements OnInit {
  private dev = inject(DeveloperService);
  private notify = inject(NotificationService);

  rows: ProcessMasterRow[] = [];
  types: ProcessTypeRow[] = [];
  loading = false;
  showForm = false;
  editKeys: { typeId: number; processId: number } | null = null;
  model = { typeId: 0, processCode: '', processName: '', processRemark: '', isActive: true };

  readonly theme = gridTheme;
  readonly context = { componentParent: this };
  readonly defaultColDef: ColDef = { sortable: true, filter: true, resizable: true, flex: 1 };
  readonly columnDefs: ColDef[] = [
    { headerName: 'Type', field: 'TypeName', maxWidth: 180 },
    { headerName: '#', field: 'ProcessID', maxWidth: 90, flex: 0 },
    { headerName: 'Code', field: 'ProcessCode', maxWidth: 180 },
    { headerName: 'Name', field: 'ProcessName' },
    { headerName: 'Remark', field: 'ProcessRemark' },
    { headerName: 'Status', field: 'ISActive', maxWidth: 120, cellRenderer: (p: ICellRendererParams) => statusBadge(p.value) },
    { headerName: 'Actions', cellRenderer: GridActionsComponent, sortable: false, filter: false, maxWidth: 120, flex: 0 },
  ];

  ngOnInit(): void {
    // Load types first so we can resolve TypeName for the grid + dropdown.
    this.dev.listProcessTypes().subscribe((t) => { this.types = t; this.load(); });
  }

  load(): void {
    this.loading = true;
    this.dev.listProcesses().subscribe({
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
    this.model = { typeId: this.types[0]?.TypeID ?? 0, processCode: '', processName: '', processRemark: '', isActive: true };
    this.showForm = true;
  }

  edit(row: ProcessMasterRow): void {
    this.editKeys = { typeId: row.TypeID, processId: row.ProcessID };
    this.model = {
      typeId: row.TypeID, processCode: row.ProcessCode, processName: row.ProcessName,
      processRemark: row.ProcessRemark ?? '', isActive: !!row.ISActive,
    };
    this.showForm = true;
  }

  save(): void {
    if (!this.model.typeId || !this.model.processCode || !this.model.processName) {
      this.notify.warning('Type, code and name are required.');
      return;
    }
    const req = this.editKeys
      ? this.dev.updateProcess(this.editKeys.typeId, this.editKeys.processId, this.model)
      : this.dev.createProcess(this.model);
    req.subscribe({
      next: () => { this.notify.success('Saved.'); this.showForm = false; this.load(); },
      error: (e) => this.notify.error(e?.error?.message ?? 'Save failed.'),
    });
  }

  remove(row: ProcessMasterRow): void {
    if (!confirm(`Delete process "${row.ProcessName}"?`)) return;
    this.dev.deleteProcess(row.TypeID, row.ProcessID).subscribe({
      next: () => { this.notify.success('Deleted.'); this.load(); },
      error: (e) => this.notify.error(e?.error?.message ?? 'Delete failed.'),
    });
  }
}
