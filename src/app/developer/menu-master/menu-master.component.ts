import { Component, OnInit, inject } from '@angular/core';
import { ColDef, ICellRendererParams } from 'ag-grid-community';
import { DeveloperService, MenuRow, ModuleRow } from '../../core/services/developer.service';
import { NotificationService } from '../../core/services/notification.service';
import { GridActionsComponent } from '../grid-actions.component';
import { statusBadge, gridTheme } from '../grid-shared';

@Component({
  selector: 'app-menu-master',
  standalone: false,
  templateUrl: './menu-master.component.html',
  styleUrl: '../developer-page.scss',
})
export class MenuMasterComponent implements OnInit {
  private dev = inject(DeveloperService);
  private notify = inject(NotificationService);

  rows: MenuRow[] = [];
  modules: ModuleRow[] = [];
  loading = false;
  showForm = false;
  editId: number | null = null;
  model = { moduleId: 0, menuCode: '', menuName: '', menuTab: 'General', menuIcon: '', routePath: '', isActive: true };

  // AG Grid
  readonly theme = gridTheme;
  readonly context = { componentParent: this };
  readonly defaultColDef: ColDef = { sortable: true, filter: true, resizable: true, flex: 1 };
  readonly columnDefs: ColDef[] = [
    { headerName: '#', field: 'MenuID', maxWidth: 70, flex: 0 },
    {
      headerName: 'Icon',
      field: 'MenuIcon',
      maxWidth: 80,
      flex: 0,
      sortable: false,
      filter: false,
      cellRenderer: (p: ICellRendererParams) =>
        p.value ? `<span class="material-icons" style="font-size:20px;color:#1677ff;vertical-align:middle">${p.value}</span>` : '',
    },
    { headerName: 'Module', field: 'ModuleName', maxWidth: 150 },
    { headerName: 'Tab', field: 'MenuTab', maxWidth: 130 },
    { headerName: 'Code', field: 'MenuCode' },
    { headerName: 'Name', field: 'MenuName' },
    { headerName: 'Route', field: 'RoutePath' },
    { headerName: 'Status', field: 'ISActive', maxWidth: 120, cellRenderer: (p: ICellRendererParams) => statusBadge(p.value) },
    { headerName: 'Actions', cellRenderer: GridActionsComponent, sortable: false, filter: false, maxWidth: 120, flex: 0 },
  ];

  ngOnInit(): void {
    this.dev.listModules().subscribe((m) => (this.modules = m));
    this.load();
  }

  load(): void {
    this.loading = true;
    this.dev.listMenus().subscribe({
      next: (r) => { this.rows = r; this.loading = false; },
      error: () => (this.loading = false),
    });
  }

  add(): void {
    this.editId = null;
    this.model = {
      moduleId: this.modules[0]?.ModuleID ?? 0,
      menuCode: '', menuName: '', menuTab: 'General', menuIcon: '', routePath: '', isActive: true,
    };
    this.showForm = true;
  }

  edit(row: MenuRow): void {
    this.editId = row.MenuID;
    this.model = {
      moduleId: row.ModuleID,
      menuCode: row.MenuCode,
      menuName: row.MenuName,
      menuTab: row.MenuTab || 'General',
      menuIcon: row.MenuIcon || '',
      routePath: row.RoutePath,
      isActive: !!row.ISActive,
    };
    this.showForm = true;
  }

  save(): void {
    if (!this.model.moduleId || !this.model.menuCode || !this.model.menuName) {
      this.notify.warning('Module, code and name are required.');
      return;
    }
    const req = this.editId
      ? this.dev.updateMenu(this.editId, this.model)
      : this.dev.createMenu(this.model);
    req.subscribe({
      next: () => { this.notify.success('Saved.'); this.showForm = false; this.load(); },
      error: (e) => this.notify.error(e?.error?.message ?? 'Save failed.'),
    });
  }

  remove(row: MenuRow): void {
    if (!confirm(`Delete menu "${row.MenuName}"?`)) return;
    this.dev.deleteMenu(row.MenuID).subscribe({
      next: () => { this.notify.success('Deleted.'); this.load(); },
      error: (e) => this.notify.error(e?.error?.message ?? 'Delete failed (still in use?).'),
    });
  }
}
