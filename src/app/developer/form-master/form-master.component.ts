import { Component, OnInit, inject } from '@angular/core';
import { ColDef, ICellRendererParams, themeMaterial } from 'ag-grid-community';
import { DeveloperService, FormRow, MenuRow } from '../../core/services/developer.service';
import { NotificationService } from '../../core/services/notification.service';
import { GridActionsComponent } from '../grid-actions.component';
import { statusBadge } from '../grid-shared';

@Component({
  selector: 'app-form-master',
  standalone: false,
  templateUrl: './form-master.component.html',
  styleUrl: '../developer-page.scss',
})
export class FormMasterComponent implements OnInit {
  private dev = inject(DeveloperService);
  private notify = inject(NotificationService);

  rows: FormRow[] = [];
  menus: MenuRow[] = [];
  loading = false;
  showForm = false;
  editId: number | null = null;
  formTypes = ['Screen', 'Report', 'Popup', 'API'];

  // AG Grid
  readonly theme = themeMaterial;
  readonly context = { componentParent: this };
  readonly defaultColDef: ColDef = { sortable: true, filter: true, resizable: true, flex: 1 };
  readonly columnDefs: ColDef[] = [
    { headerName: '#', field: 'FormID', maxWidth: 80, flex: 0 },
    { headerName: 'Menu', field: 'MenuName', maxWidth: 160 },
    { headerName: 'Code', field: 'FormCode' },
    { headerName: 'Name', field: 'FormName' },
    { headerName: 'Type', field: 'FormType', maxWidth: 120 },
    { headerName: 'Route', field: 'RoutePath' },
    { headerName: 'Status', field: 'ISActive', maxWidth: 130, cellRenderer: (p: ICellRendererParams) => statusBadge(p.value) },
    { headerName: 'Actions', cellRenderer: GridActionsComponent, sortable: false, filter: false, maxWidth: 130, flex: 0 },
  ];

  model = {
    menuId: 0,
    formCode: '',
    formName: '',
    formType: 'Screen',
    routePath: '',
    controller: '',
    actionName: '',
    isPopup: false,
    isReport: false,
    isActive: true,
  };

  ngOnInit(): void {
    this.dev.listMenus().subscribe((m) => (this.menus = m));
    this.load();
  }

  load(): void {
    this.loading = true;
    this.dev.listForms().subscribe({
      next: (r) => { this.rows = r; this.loading = false; },
      error: () => (this.loading = false),
    });
  }

  add(): void {
    this.editId = null;
    this.model = {
      menuId: this.menus[0]?.MenuID ?? 0,
      formCode: '', formName: '', formType: 'Screen',
      routePath: '', controller: '', actionName: '',
      isPopup: false, isReport: false, isActive: true,
    };
    this.showForm = true;
  }

  edit(row: FormRow): void {
    this.editId = row.FormID;
    this.model = {
      menuId: row.MenuID,
      formCode: row.FormCode,
      formName: row.FormName,
      formType: row.FormType || 'Screen',
      routePath: row.RoutePath ?? '',
      controller: row.Controller ?? '',
      actionName: row.ActionName ?? '',
      isPopup: !!row.ISPopup,
      isReport: !!row.ISReport,
      isActive: !!row.ISActive,
    };
    this.showForm = true;
  }

  save(): void {
    if (!this.model.menuId || !this.model.formCode || !this.model.formName) {
      this.notify.warning('Menu, code and name are required.');
      return;
    }
    const req = this.editId
      ? this.dev.updateForm(this.editId, this.model)
      : this.dev.createForm(this.model);
    req.subscribe({
      next: () => { this.notify.success('Saved.'); this.showForm = false; this.load(); },
      error: (e) => this.notify.error(e?.error?.message ?? 'Save failed.'),
    });
  }

  remove(row: FormRow): void {
    if (!confirm(`Delete form "${row.FormName}"?`)) return;
    this.dev.deleteForm(row.FormID).subscribe({
      next: () => { this.notify.success('Deleted.'); this.load(); },
      error: (e) => this.notify.error(e?.error?.message ?? 'Delete failed.'),
    });
  }
}
