// src/app/core/services/auth.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface User {
  userId: number;
  username: string;
  email: string;
  fullName: string;
  companyId: number;
  companyName: string;
  employeeCode: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  sessionId: string;
  user: User;
}

export interface RegisterPayload {
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  password: string;
  mobile: string;
  channel: 'email' | 'mobile';
  registerType?: 'user' | 'client';
}

/** Returned by register/resend — tells the client where the OTP was sent. */
export interface OtpChallenge {
  userId: number;
  email: string;
  channel: 'email' | 'mobile';
  destination: string;
  expiresIn: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly apiUrl = `${environment.apiUrl}/auth`;

  // Seed from storage so a page refresh keeps the user signed in.
  private currentUserSubject = new BehaviorSubject<User | null>(this.readStoredUser());
  readonly currentUser$ = this.currentUserSubject.asObservable();

  login(credentials: LoginCredentials): Observable<ApiResponse<AuthSession>> {
    return this.http
      .post<ApiResponse<AuthSession>>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap((response) => {
          if (response.success) {
            this.setSession(response.data);
            this.currentUserSubject.next(response.data.user);
          }
        }),
      );
  }

  register(payload: RegisterPayload): Observable<ApiResponse<OtpChallenge>> {
    return this.http.post<ApiResponse<OtpChallenge>>(`${this.apiUrl}/register`, payload);
  }

  verifyOtp(payload: { email: string; otp: string; channel?: string }): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(`${this.apiUrl}/verify-otp`, payload);
  }

  resendOtp(payload: { email: string; channel?: string }): Observable<ApiResponse<OtpChallenge>> {
    return this.http.post<ApiResponse<OtpChallenge>>(`${this.apiUrl}/resend-otp`, payload);
  }

  forgotPassword(email: string): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(`${this.apiUrl}/forgot-password`, { email });
  }

  resetPassword(payload: { email: string; otp: string; newPassword: string }): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(`${this.apiUrl}/reset-password`, payload);
  }

  /** Exchanges the stored refresh token for a fresh access token. */
  refreshAccessToken(): Observable<string> {
    const refreshToken = this.getRefreshToken();
    return this.http
      .post<ApiResponse<{ accessToken: string; expiresIn: number }>>(
        `${this.apiUrl}/refresh-token`,
        { refreshToken },
      )
      .pipe(
        tap((response) => {
          if (response.success) {
            localStorage.setItem(environment.tokenKey, response.data.accessToken);
          }
        }),
        map((response) => response.data.accessToken),
      );
  }

  /**
   * Clears the local session immediately (so logout always works, even offline),
   * then notifies the server best-effort and routes to the login page.
   */
  logout(): void {
    this.clearSession();
    this.http.post(`${this.apiUrl}/logout`, {}).subscribe({
      next: () => this.router.navigate(['/auth/login']),
      error: () => this.router.navigate(['/auth/login']),
    });
  }

  /** Local-only teardown used when a token refresh fails. No server round-trip. */
  sessionExpired(): void {
    this.clearSession();
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(environment.tokenKey);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(environment.refreshTokenKey);
  }

  getUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /** Alias kept for the route guard. */
  isLoggedIn(): boolean {
    return this.isAuthenticated();
  }

  private setSession(session: AuthSession): void {
    localStorage.setItem(environment.tokenKey, session.accessToken);
    localStorage.setItem(environment.refreshTokenKey, session.refreshToken);
    localStorage.setItem(environment.sessionKey, session.sessionId);
    localStorage.setItem(environment.userKey, JSON.stringify(session.user));
  }

  private clearSession(): void {
    localStorage.removeItem(environment.tokenKey);
    localStorage.removeItem(environment.refreshTokenKey);
    localStorage.removeItem(environment.sessionKey);
    localStorage.removeItem(environment.userKey);
    this.currentUserSubject.next(null);
  }

  private readStoredUser(): User | null {
    const userStr = localStorage.getItem(environment.userKey);
    if (!userStr) {
      return null;
    }
    try {
      return JSON.parse(userStr) as User;
    } catch {
      localStorage.removeItem(environment.userKey);
      return null;
    }
  }
}
