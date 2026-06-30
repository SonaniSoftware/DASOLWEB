// src/app/core/services/notification.service.ts
import { Injectable, inject } from '@angular/core';
import { IndividualConfig, ToastrService } from 'ngx-toastr';

type ToastType = 'success' | 'error' | 'warning' | 'info';

const BASE_CONFIG: Partial<IndividualConfig> = {
  positionClass: 'toast-top-right',
  progressBar: true,
  closeButton: true,
};

// Per-type timeouts; everything else is shared via BASE_CONFIG.
const TIMEOUTS: Record<ToastType, number> = {
  success: 3000,
  error: 5000,
  warning: 4000,
  info: 3000,
};

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private toastr = inject(ToastrService);

  success(message: string, title = 'Success'): void {
    this.show('success', message, title);
  }

  error(message: string, title = 'Error'): void {
    this.show('error', message, title);
  }

  warning(message: string, title = 'Warning'): void {
    this.show('warning', message, title);
  }

  info(message: string, title = 'Info'): void {
    this.show('info', message, title);
  }

  showToast(message: string, type: ToastType = 'info', title?: string): void {
    this.show(type, message, title);
  }

  private show(type: ToastType, message: string, title?: string): void {
    const config = { ...BASE_CONFIG, timeOut: TIMEOUTS[type] };
    this.toastr[type](message, title, config);
  }

  // Aliases kept for backwards compatibility.
  showSuccess = this.success.bind(this);
  showError = this.error.bind(this);
  showWarning = this.warning.bind(this);
  showInfo = this.info.bind(this);
}
