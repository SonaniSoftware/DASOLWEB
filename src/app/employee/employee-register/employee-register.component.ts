import { Component, OnInit, inject } from '@angular/core';
import { ColDef, ICellRendererParams } from 'ag-grid-community';
import { EmployeeService, EmployeeRow } from '../../core/services/employee.service';
import { NotificationService } from '../../core/services/notification.service';
import { GridActionsComponent } from '../../developer/grid-actions.component';
import { statusBadge, gridTheme } from '../../developer/grid-shared';

/** Blank employee form model (camelCase mirror of HRM_EmployeeRegister). */
function blankEmployee() {
  return {
    userName: '', firstName: '', middleName: '', lastName: '',
    aadharNo: '', email: '', mobile: '', password: '',
    isVerify: false, isActive: true,
  };
}

type EmployeeModel = ReturnType<typeof blankEmployee>;

@Component({
  selector: 'app-employee-register',
  standalone: false,
  templateUrl: './employee-register.component.html',
  styleUrl: '../../developer/developer-page.scss',
})
export class EmployeeRegisterComponent implements OnInit {
  private api = inject(EmployeeService);
  private notify = inject(NotificationService);

  rows: EmployeeRow[] = [];
  loading = false;
  showForm = false;
  editId: number | null = null;
  model: EmployeeModel = blankEmployee();

  // AG Grid
  readonly theme = gridTheme;
  readonly context = { componentParent: this };
  readonly defaultColDef: ColDef = { sortable: true, filter: true, resizable: true, flex: 1 };
  readonly columnDefs: ColDef[] = [
    { headerName: '#', field: 'RegisterID', maxWidth: 90, flex: 0 },
    { headerName: 'User Name', field: 'UserName', maxWidth: 170 },
    {
      headerName: 'Name',
      valueGetter: (p) => [p.data?.FirstName, p.data?.MiddleName, p.data?.LastName].filter(Boolean).join(' '),
    },
    { headerName: 'Email', field: 'Email' },
    { headerName: 'Mobile', field: 'Mobile', maxWidth: 150 },
    { headerName: 'Aadhar', field: 'AadharNo', maxWidth: 160 },
    {
      headerName: 'Verified', field: 'ISVerify', maxWidth: 130,
      cellRenderer: (p: ICellRendererParams) =>
        p.value
          ? '<span class="badge bg-success-subtle text-success">Verified</span>'
          : '<span class="badge bg-warning-subtle text-warning">Pending</span>',
    },
    { headerName: 'Status', field: 'ISActive', maxWidth: 130, cellRenderer: (p: ICellRendererParams) => statusBadge(p.value) },
    { headerName: 'Actions', cellRenderer: GridActionsComponent, sortable: false, filter: false, maxWidth: 130, flex: 0 },
  ];

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.api.listEmployees().subscribe({
      next: (r) => { this.rows = r; this.loading = false; },
      error: () => (this.loading = false),
    });
  }

  add(): void {
    this.editId = null;
    this.model = blankEmployee();
    this.showForm = true;
  }

  edit(row: EmployeeRow): void {
    this.editId = row.RegisterID;
    this.showForm = true;
    // Fill the form from HRM_EmployeeRegister_DataByID.
    this.api.getEmployee(row.RegisterID).subscribe({
      next: (e) => {
        this.model = {
          userName: e.UserName ?? '', firstName: e.FirstName ?? '', middleName: e.MiddleName ?? '',
          lastName: e.LastName ?? '', aadharNo: e.AadharNo ?? '', email: e.Email ?? '',
          mobile: e.Mobile ?? '', password: '', isVerify: !!e.ISVerify, isActive: !!e.ISActive,
        };
      },
      error: (err) => this.notify.error(err?.error?.message ?? 'Failed to load employee.'),
    });
  }

  save(): void {
    if (!this.model.userName || !this.model.firstName || !this.model.email || !this.model.mobile || !this.model.aadharNo) {
      this.notify.warning('User name, first name, email, mobile and Aadhar are required.');
      return;
    }
    if (!this.editId && !this.model.password) {
      this.notify.warning('Password is required for a new employee.');
      return;
    }
    const req = this.editId
      ? this.api.updateEmployee(this.editId, this.model)
      : this.api.createEmployee(this.model);
    req.subscribe({
      next: () => { this.notify.success('Saved.'); this.showForm = false; this.load(); },
      error: (e) => this.notify.error(e?.error?.message ?? 'Save failed.'),
    });
  }

  remove(row: EmployeeRow): void {
    if (!confirm(`Delete employee "${row.UserName}"?`)) return;
    this.api.deleteEmployee(row.RegisterID).subscribe({
      next: () => { this.notify.success('Deleted.'); this.load(); },
      error: (e) => this.notify.error(e?.error?.message ?? 'Delete failed.'),
    });
  }
}
