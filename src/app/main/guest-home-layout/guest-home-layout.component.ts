import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { EmployeeService } from '../../core/services/employee.service';
import { NotificationService } from '../../core/services/notification.service';

/** Blank employee form model (camelCase mirror of HRM_EmployeeRegister). */
function blankEmployee() {
  return {
    userName: '', firstName: '', middleName: '', lastName: '',
    aadharNo: '', email: '', mobile: '', password: '',
    isVerify: false, isActive: true,
  };
}

/**
 * Post-login home for guest users (GroupID 0/1/null). Same header as the admin
 * layout, an otherwise blank page, and an "Apply" button that opens the
 * HRM_EmployeeRegister form so a guest can apply to become an employee.
 */
@Component({
  selector: 'app-guest-home-layout',
  standalone: false,
  templateUrl: './guest-home-layout.component.html',
  styleUrl: './guest-home-layout.component.scss',
})
export class GuestHomeLayoutComponent {
  private api = inject(EmployeeService);
  private notify = inject(NotificationService);
  private auth = inject(AuthService);

  showForm = false;

  /** Name shown in the header. */
  get displayName(): string {
    const u = this.auth.getUser();
    return u?.fullName?.trim() || u?.username || 'Guest';
  }

  logout(): void {
    this.auth.logout();
  }

  saving = false;
  loading = false;
  model = blankEmployee();

  /** The guest's own RegisterID (UserID = RegisterID in this schema). */
  private get registerId(): number {
    return this.auth.getUser()?.userId ?? 0;
  }

  /**
   * "Apply" button — reveal the registration form prefilled from
   * HRM_EmployeeRegister_DataByID for the logged-in guest.
   */
  openApply(): void {
    this.model = blankEmployee();
    this.showForm = true;
    if (!this.registerId) return;
    this.loading = true;
    this.api.getEmployee(this.registerId).subscribe({
      next: (row) => {
        this.loading = false;
        if (!row) return;
        this.model = {
          userName: row.UserName ?? '',
          firstName: row.FirstName ?? '',
          middleName: row.MiddleName ?? '',
          lastName: row.LastName ?? '',
          aadharNo: row.AadharNo ?? '',
          email: row.Email ?? '',
          mobile: row.Mobile ?? '',
          password: '', // never editable here — the account password stays as-is
          isVerify: !!row.ISVerify,
          isActive: row.ISActive == null ? true : !!row.ISActive,
        };
      },
      error: (e) => {
        this.loading = false;
        this.notify.error(e?.error?.message ?? 'Could not load your details.');
      },
    });
  }

  cancel(): void {
    this.showForm = false;
  }

  submit(): void {
    if (!this.model.firstName || !this.model.email || !this.model.mobile || !this.model.aadharNo) {
      this.notify.warning('First name, email, mobile and Aadhar are required.');
      return;
    }
    this.saving = true;
    // Insert-only apply for the guest's own RegisterID; the server rejects a
    // second application with an "already registered" message.
    this.api.applyEmployee(this.model).subscribe({
      next: (r) => {
        this.saving = false;
        this.showForm = false;
        this.notify.success(r?.message ?? 'Application submitted. We will review it shortly.');
      },
      error: (e) => {
        this.saving = false;
        this.notify.error(e?.error?.message ?? 'Could not submit your application.');
      },
    });
  }
}
