import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private notify = inject(NotificationService);

  loading = false;
  showPassword = false;

  // Remember me — persists the email so it pre-fills on the next visit.
  private readonly REMEMBER_KEY = 'dasol.rememberEmail';
  rememberMe = false;
  rememberedEmail = '';

  constructor() {
    const saved = localStorage.getItem(this.REMEMBER_KEY);
    if (saved) {
      this.rememberedEmail = saved;
      this.rememberMe = true;
    }
  }

  // Forgot-password flow: 'login' (normal) → 'request' (enter email) → 'reset' (code + new password)
  mode: 'login' | 'request' | 'reset' = 'login';
  fpLoading = false;
  fpEmail = '';
  showNewPassword = false;

  SignInOption = [
    { image: 'assets/images/auth/google.svg', name: 'Google' },
    { image: 'assets/images/auth/twitter.svg', name: 'Twitter' },
    { image: 'assets/images/auth/facebook.svg', name: 'Facebook' },
  ];

  onRememberChange(checked: boolean): void {
    this.rememberMe = checked;
    if (!checked) {
      localStorage.removeItem(this.REMEMBER_KEY);
    }
  }

  onLogin(email: string, password: string): void {
    if (!email || !password) {
      this.notify.warning('Please enter your email and password.');
      return;
    }

    // Save or clear the remembered email based on the checkbox.
    if (this.rememberMe) {
      localStorage.setItem(this.REMEMBER_KEY, email);
    } else {
      localStorage.removeItem(this.REMEMBER_KEY);
    }

    this.loading = true;
    this.auth.login({ email, password }).subscribe({
      next: () => {
        const returnUrl =
          this.route.snapshot.queryParamMap.get('returnUrl') ?? '/dashboard/default';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err) => {
        this.loading = false;
        this.notify.error(err?.error?.message ?? 'Login failed. Please try again.');
      },
    });
  }

  // ---- Forgot password ----

  openForgot(currentEmail: string): void {
    this.fpEmail = currentEmail || '';
    this.mode = 'request';
  }

  backToLogin(): void {
    this.mode = 'login';
    this.fpLoading = false;
  }

  onForgotRequest(email: string): void {
    if (!email) {
      this.notify.warning('Please enter your email address.');
      return;
    }
    this.fpEmail = email;
    this.fpLoading = true;
    this.auth.forgotPassword(email).subscribe({
      next: () => {
        this.fpLoading = false;
        this.mode = 'reset';
        this.notify.success('If the account exists, a reset code was sent to your email.');
      },
      error: (err) => {
        this.fpLoading = false;
        this.notify.error(err?.error?.message ?? 'Could not start password reset.');
      },
    });
  }

  onResendCode(): void {
    if (!this.fpEmail) return;
    this.auth.forgotPassword(this.fpEmail).subscribe({
      next: () => this.notify.success('A new reset code was sent.'),
      error: (err) => this.notify.error(err?.error?.message ?? 'Could not resend the code.'),
    });
  }

  onResetPassword(otp: string, newPassword: string): void {
    if (!otp || !newPassword) {
      this.notify.warning('Enter the code and your new password.');
      return;
    }
    if (newPassword.length < 8) {
      this.notify.warning('Password must be at least 8 characters.');
      return;
    }

    this.fpLoading = true;
    this.auth.resetPassword({ email: this.fpEmail, otp: otp.trim(), newPassword }).subscribe({
      next: () => {
        this.fpLoading = false;
        this.mode = 'login';
        this.notify.success('Password reset successfully. Please sign in.');
      },
      error: (err) => {
        this.fpLoading = false;
        this.notify.error(err?.error?.message ?? 'Reset failed. Please try again.');
      },
    });
  }
}
