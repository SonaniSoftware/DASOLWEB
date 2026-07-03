import { Component, inject } from '@angular/core';
import { AuthService, User } from '../core/services/auth.service';
import { DeviceInfo, DeviceInfoService, DeviceSnapshot } from '../core/services/device-info.service';

@Component({
  selector: 'app-profile',
  standalone: false,
  templateUrl: './profile.component.html',
  styleUrls: ['../developer/developer-page.scss', './profile.component.scss'],
})
export class ProfileComponent {
  private auth = inject(AuthService);
  private deviceInfo = inject(DeviceInfoService);

  readonly user: User | null = this.auth.getUser();
  /** Snapshot captured at login (IP + device). */
  readonly login: DeviceSnapshot | null = this.deviceInfo.loginSnapshot();
  /** Current live device info. */
  readonly device: DeviceInfo = this.deviceInfo.info;

  get displayName(): string {
    return this.user?.fullName?.trim() || this.user?.username || 'User';
  }

  get initials(): string {
    const name = this.displayName;
    const parts = name.split(' ').filter(Boolean);
    const letters = parts.length > 1 ? parts[0][0] + parts[1][0] : name.slice(0, 2);
    return letters.toUpperCase();
  }

  get loginAt(): string {
    return this.login?.at ? new Date(this.login.at).toLocaleString() : '—';
  }
}
