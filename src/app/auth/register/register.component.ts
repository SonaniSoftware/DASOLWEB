import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private notify = inject(NotificationService);

  loading = false;
  showPassword = false;

  // Where the OTP is delivered: 'email' or 'mobile'.
  verifyChannel: 'email' | 'mobile' = 'email';

  // OTP step state
  otpStep = false;
  verifying = false;
  pendingEmail = '';
  pendingChannel: 'email' | 'mobile' = 'email';
  maskedDestination = '';

  SignUpOption = [
    { image: 'assets/images/auth/google.svg', name: 'Google' },
    { image: 'assets/images/auth/twitter.svg', name: 'Twitter' },
    { image: 'assets/images/auth/facebook.svg', name: 'Facebook' },
  ];

  setChannel(channel: 'email' | 'mobile'): void {
    this.verifyChannel = channel;
  }

  onRegister(
    firstName: string,
    middleName: string,
    lastName: string,
    email: string,
    mobile: string,
    password: string,
  ): void {
    if (!firstName || !middleName || !lastName || !email || !mobile || !password) {
      this.notify.warning('Please fill in all required fields.');
      return;
    }
    if (password.length < 8) {
      this.notify.warning('Password must be at least 8 characters.');
      return;
    }

    const channel = this.verifyChannel;

    this.loading = true;
    this.auth
      .register({
        firstName,
        middleName,
        lastName,
        email,
        password,
        mobile,
        channel,
      })
      .subscribe({
        next: (res) => {
          this.loading = false;
          this.otpStep = true;
          this.pendingEmail = email;
          this.pendingChannel = res.data?.channel ?? channel;
          this.maskedDestination = res.data?.destination ?? '';
          this.notify.success(`Verification code sent to your ${this.pendingChannel}.`);
        },
        error: (err) => {
          this.loading = false;
          this.notify.error(err?.error?.message ?? 'Registration failed. Please try again.');
        },
      });
  }

  onVerify(otp: string): void {
    if (!otp || otp.trim().length < 4) {
      this.notify.warning('Enter the verification code.');
      return;
    }

    this.verifying = true;
    this.auth
      .verifyOtp({ email: this.pendingEmail, otp: otp.trim(), channel: this.pendingChannel })
      .subscribe({
        next: () => {
          this.notify.success('Account verified. Please sign in.');
          this.router.navigate(['/auth/login']);
        },
        error: (err) => {
          this.verifying = false;
          this.notify.error(err?.error?.message ?? 'Verification failed. Please try again.');
        },
      });
  }

  onResend(): void {
    this.auth
      .resendOtp({ email: this.pendingEmail, channel: this.pendingChannel })
      .subscribe({
        next: (res) => {
          this.maskedDestination = res.data?.destination ?? this.maskedDestination;
          this.notify.success(`A new code was sent to your ${this.pendingChannel}.`);
        },
        error: (err) => {
          this.notify.error(err?.error?.message ?? 'Could not resend the code.');
        },
      });
  }
}
