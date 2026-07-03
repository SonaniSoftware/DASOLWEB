import { Component, HostListener, OnInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService, User } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { environment } from '../../../../environments/environment';

const DEVICE_ID_KEY = 'dasol.deviceId';

@Component({
  selector: 'app-navbar-right',
  standalone: false,
  templateUrl: './navbar-right.component.html',
  styleUrl: './navbar-right.component.scss',
})
export class NavbarRightComponent implements OnInit {
  private auth = inject(AuthService);
  private http = inject(HttpClient);
  readonly theme = inject(ThemeService);

  open = false;
  themeOpen = false;

  /** Client-side device/browser details shown in the user dropdown. */
  readonly device = this.readDevice();
  /** Public IP resolved from the API (browser can't read it directly). */
  ipAddress = '—';

  ngOnInit(): void {
    this.http.get<{ success: boolean; data: { ip: string } }>(`${environment.apiUrl}/whoami`).subscribe({
      next: (r) => (this.ipAddress = r?.data?.ip || '—'),
      error: () => (this.ipAddress = '—'),
    });
  }

  get user(): User | null {
    return this.auth.getUser();
  }

  private readDevice(): { browser: string; os: string; device: string; platform: string; deviceId: string; screen: string; language: string; online: boolean } {
    const ua = navigator.userAgent;
    return {
      browser: this.detectBrowser(ua),
      os: this.detectOs(ua),
      device: /Mobi|Android|iPhone|iPad|iPod/i.test(ua) ? 'Mobile' : 'Desktop',
      platform: navigator.platform || '—',
      deviceId: this.getDeviceId(),
      screen: `${window.screen.width} × ${window.screen.height}`,
      language: navigator.language || '—',
      online: navigator.onLine,
    };
  }

  /** Stable per-device id, generated once and kept in localStorage. */
  private getDeviceId(): string {
    let id = localStorage.getItem(DEVICE_ID_KEY);
    if (!id) {
      id = crypto?.randomUUID?.() ?? `dev-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
      localStorage.setItem(DEVICE_ID_KEY, id);
    }
    return id;
  }

  private detectBrowser(ua: string): string {
    if (/Edg\//.test(ua)) return 'Edge';
    if (/OPR\//.test(ua)) return 'Opera';
    if (/Chrome\//.test(ua)) return 'Chrome';
    if (/Firefox\//.test(ua)) return 'Firefox';
    if (/Safari\//.test(ua)) return 'Safari';
    return 'Unknown';
  }

  private detectOs(ua: string): string {
    if (/Windows NT 10/.test(ua)) return 'Windows';
    if (/Windows NT/.test(ua)) return 'Windows';
    if (/Android/.test(ua)) return 'Android';
    if (/iPhone|iPad|iPod/.test(ua)) return 'iOS';
    if (/Mac OS X|Macintosh/.test(ua)) return 'macOS';
    if (/Linux/.test(ua)) return 'Linux';
    return 'Unknown';
  }

  get displayName(): string {
    return this.user?.fullName?.trim() || this.user?.username || 'User';
  }

  get initials(): string {
    const name = this.displayName;
    const parts = name.split(' ').filter(Boolean);
    const letters = parts.length > 1 ? parts[0][0] + parts[1][0] : name.slice(0, 2);
    return letters.toUpperCase();
  }

  toggle(event: Event): void {
    event.stopPropagation();
    this.open = !this.open;
    this.themeOpen = false;
  }

  toggleTheme(event: Event): void {
    event.stopPropagation();
    this.themeOpen = !this.themeOpen;
    this.open = false;
  }

  selectTheme(id: string): void {
    this.theme.select(id);
    this.themeOpen = false;
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.open = false;
    this.themeOpen = false;
  }

  logout(): void {
    this.open = false;
    this.auth.logout();
  }
}
