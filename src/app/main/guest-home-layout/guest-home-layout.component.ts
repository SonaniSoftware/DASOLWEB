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
  model = blankEmployee();

  /** "Apply" button — reveal the registration form. */
  openApply(): void {
    this.model = blankEmployee();
    this.showForm = true;
  }

  cancel(): void {
    this.showForm = false;
  }

  submit(): void {
    if (!this.model.userName || !this.model.firstName || !this.model.email || !this.model.mobile || !this.model.aadharNo) {
      this.notify.warning('User name, first name, email, mobile and Aadhar are required.');
      return;
    }
    if (!this.model.password) {
      this.notify.warning('Password is required.');
      return;
    }
    this.saving = true;
    this.api.createEmployee(this.model).subscribe({
      next: () => {
        this.saving = false;
        this.showForm = false;
        this.notify.success('Application submitted. We will review it shortly.');
      },
      error: (e) => {
        this.saving = false;
        this.notify.error(e?.error?.message ?? 'Could not submit your application.');
      },
    });
  }
}
