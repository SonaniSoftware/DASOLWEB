import { Component, OnInit, inject } from '@angular/core';
import { ColDef, ICellRendererParams, themeMaterial } from 'ag-grid-community';
import { DeveloperService, ModuleRow } from '../../core/services/developer.service';
import { NotificationService } from '../../core/services/notification.service';
import { GridActionsComponent } from '../grid-actions.component';
import { statusBadge } from '../grid-shared';

@Component({
  selector: 'app-module-master',
  standalone: false,
  templateUrl: './module-master.component.html',
  styleUrl: '../developer-page.scss',
})
export class ModuleMasterComponent implements OnInit {
  private dev = inject(DeveloperService);
  private notify = inject(NotificationService);

  rows: ModuleRow[] = [];
  loading = false;
  showForm = false;
  editId: number | null = null;
  model = { moduleCode: '', moduleName: '', isActive: true };

  // AG Grid
  readonly theme = themeMaterial;
  readonly context = { componentParent: this };
  readonly defaultColDef: ColDef = { sortable: true, filter: true, resizable: true, flex: 1 };
  readonly columnDefs: ColDef[] = [
    { headerName: '#', field: 'ModuleID', maxWidth: 90, flex: 0 },
    { headerName: 'Code', field: 'ModuleCode', maxWidth: 160 },
    { headerName: 'Name', field: 'ModuleName' },
    { headerName: 'Status', field: 'ISActive', maxWidth: 140, cellRenderer: (p: ICellRendererParams) => statusBadge(p.value) },
    { headerName: 'Actions', cellRenderer: GridActionsComponent, sortable: false, filter: false, maxWidth: 130, flex: 0 },
  ];

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.dev.listModules().subscribe({
      next: (r) => { this.rows = r; this.loading = false; },
      error: () => (this.loading = false),
    });
  }

  add(): void {
    this.editId = null;
    this.model = { moduleCode: '', moduleName: '', isActive: true };
    this.showForm = true;
  }

  edit(row: ModuleRow): void {
    this.editId = row.ModuleID;
    this.model = { moduleCode: row.ModuleCode, moduleName: row.ModuleName, isActive: !!row.ISActive };
    this.showForm = true;
  }

  save(): void {
    if (!this.model.moduleCode || !this.model.moduleName) {
      this.notify.warning('Code and name are required.');
      return;
    }
    const req = this.editId
      ? this.dev.updateModule(this.editId, this.model)
      : this.dev.createModule(this.model);
    req.subscribe({
      next: () => { this.notify.success('Saved.'); this.showForm = false; this.load(); },
      error: (e) => this.notify.error(e?.error?.message ?? 'Save failed.'),
    });
  }

  remove(row: ModuleRow): void {
    if (!confirm(`Delete module "${row.ModuleName}"?`)) return;
    this.dev.deleteModule(row.ModuleID).subscribe({
      next: () => { this.notify.success('Deleted.'); this.load(); },
      error: (e) => this.notify.error(e?.error?.message ?? 'Delete failed (still in use?).'),
    });
  }
}
