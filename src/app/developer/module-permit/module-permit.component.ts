import { Component, OnInit, inject } from '@angular/core';
import { ColDef, ICellRendererParams } from 'ag-grid-community';
import { DeveloperService, PermitRow, UserRow } from '../../core/services/developer.service';
import { NotificationService } from '../../core/services/notification.service';
import { gridTheme } from '../grid-shared';
import { PermitCheckboxComponent } from '../permit-checkbox.component';

@Component({
  selector: 'app-module-permit',
  standalone: false,
  templateUrl: './module-permit.component.html',
  styleUrl: '../developer-page.scss',
})
export class ModulePermitComponent implements OnInit {
  private dev = inject(DeveloperService);
  private notify = inject(NotificationService);

  users: UserRow[] = [];
  permits: PermitRow[] = [];
  selectedUserId = 0;
  loading = false;
  saving = false;

  // AG Grid — same theme as the master grids
  readonly theme = gridTheme;
  readonly context = { componentParent: this };
  readonly defaultColDef: ColDef = { sortable: true, filter: true, resizable: true, flex: 1 };
  readonly columnDefs: ColDef[] = [
    { headerName: '#', field: 'ModuleID', maxWidth: 90, flex: 0 },
    {
      headerName: 'Code',
      field: 'ModuleCode',
      maxWidth: 160,
      cellRenderer: (p: ICellRendererParams) => `<span class="badge bg-light text-dark">${p.value ?? ''}</span>`,
    },
    { headerName: 'Module', field: 'ModuleName' },
    {
      headerName: 'Visible',
      field: 'ISVisible',
      maxWidth: 140,
      flex: 0,
      sortable: false,
      filter: false,
      cellRenderer: PermitCheckboxComponent,
    },
  ];

  ngOnInit(): void {
    this.dev.listUsers().subscribe((u) => (this.users = u));
  }

  onUserChange(): void {
    if (!this.selectedUserId) {
      this.permits = [];
      return;
    }
    this.loading = true;
    this.dev.getModulePermit(this.selectedUserId).subscribe({
      next: (p) => { this.permits = p.map((r) => ({ ...r, ISVisible: !!r.ISVisible })); this.loading = false; },
      error: () => (this.loading = false),
    });
  }

  toggleAll(visible: boolean): void {
    this.permits = this.permits.map((p) => ({ ...p, ISVisible: visible }));
  }

  save(): void {
    if (!this.selectedUserId) {
      this.notify.warning('Select a user first.');
      return;
    }
    this.saving = true;
    const payload = this.permits.map((p) => ({ moduleId: p.ModuleID, isVisible: !!p.ISVisible }));
    this.dev.saveModulePermit(this.selectedUserId, payload).subscribe({
      next: () => { this.notify.success('Permissions saved.'); this.saving = false; },
      error: (e) => { this.saving = false; this.notify.error(e?.error?.message ?? 'Save failed.'); },
    });
  }
}
