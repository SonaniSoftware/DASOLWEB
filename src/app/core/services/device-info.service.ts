import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface DeviceInfo {
  browser: string;
  os: string;
  device: string;
  platform: string;
  deviceId: string;
  screen: string;
  language: string;
  online: boolean;
}

/** Snapshot stored at login time (device + IP + timestamp). */
export interface DeviceSnapshot extends Omit<DeviceInfo, 'online'> {
  ip: string;
  at: string; // ISO login time
}

const DEVICE_ID_KEY = 'dasol.deviceId';
const LOGIN_DEVICE_KEY = 'dasol.loginDevice';

@Injectable({ providedIn: 'root' })
export class DeviceInfoService {
  private http = inject(HttpClient);

  /** Live device details available from the browser. */
  get info(): DeviceInfo {
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

  /** Client IPv4 as seen by the server (loopback on localhost, LAN IP over network). */
  getIp(): Observable<string> {
    return this.http
      .get<{ success: boolean; data: { ip: string; ipv4?: string } }>(`${environment.apiUrl}/whoami`)
      .pipe(
        map((r) => r?.data?.ipv4 || r?.data?.ip || '—'),
        catchError(() => of('—')),
      );
  }

  /** Capture the login-time device + IP snapshot and persist it. Call after a successful login. */
  captureLogin(): void {
    // Persist the device part synchronously — the app may do a full page load
    // right after login, which would abort the async IP lookup.
    const i = this.info;
    const snap: DeviceSnapshot = {
      ip: '—',
      at: new Date().toISOString(),
      browser: i.browser,
      os: i.os,
      device: i.device,
      platform: i.platform,
      deviceId: i.deviceId,
      screen: i.screen,
      language: i.language,
    };
    this.store(snap);
    this.getIp().subscribe((ip) => this.store({ ...snap, ip }));
  }

  private store(snap: DeviceSnapshot): void {
    try {
      localStorage.setItem(LOGIN_DEVICE_KEY, JSON.stringify(snap));
    } catch {
      /* storage unavailable — ignore */
    }
  }

  /** Remove the login-time snapshot (used on logout). */
  clearLoginSnapshot(): void {
    try {
      localStorage.removeItem(LOGIN_DEVICE_KEY);
    } catch {
      /* storage unavailable — ignore */
    }
  }

  /** The stored login snapshot (or null if none captured yet). */
  loginSnapshot(): DeviceSnapshot | null {
    try {
      const s = localStorage.getItem(LOGIN_DEVICE_KEY);
      return s ? (JSON.parse(s) as DeviceSnapshot) : null;
    } catch {
      return null;
    }
  }

  /** Stable per-device id, generated once and kept in localStorage. */
  getDeviceId(): string {
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
    if (/Windows NT/.test(ua)) return 'Windows';
    if (/Android/.test(ua)) return 'Android';
    if (/iPhone|iPad|iPod/.test(ua)) return 'iOS';
    if (/Mac OS X|Macintosh/.test(ua)) return 'macOS';
    if (/Linux/.test(ua)) return 'Linux';
    return 'Unknown';
  }
}
