// src/app/core/services/api.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

/** Query-string params accepted by the read/delete helpers. */
export type QueryParams = Record<string, string | number | boolean | null | undefined>;

/**
 * Thin, typed wrapper around HttpClient that prefixes every call with the
 * configured API base URL. Feature services should depend on this instead of
 * injecting HttpClient directly, so the base URL and param handling live in one place.
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  get<T>(endpoint: string, params?: QueryParams): Observable<T> {
    return this.http.get<T>(this.url(endpoint), { params: this.toHttpParams(params) });
  }

  post<T>(endpoint: string, body?: unknown): Observable<T> {
    return this.http.post<T>(this.url(endpoint), body ?? {});
  }

  put<T>(endpoint: string, body?: unknown): Observable<T> {
    return this.http.put<T>(this.url(endpoint), body ?? {});
  }

  patch<T>(endpoint: string, body?: unknown): Observable<T> {
    return this.http.patch<T>(this.url(endpoint), body ?? {});
  }

  delete<T>(endpoint: string, params?: QueryParams): Observable<T> {
    return this.http.delete<T>(this.url(endpoint), { params: this.toHttpParams(params) });
  }

  private url(endpoint: string): string {
    return `${this.baseUrl}/${endpoint.replace(/^\/+/, '')}`;
  }

  private toHttpParams(params?: QueryParams): HttpParams {
    let httpParams = new HttpParams();
    if (!params) {
      return httpParams;
    }
    for (const [key, value] of Object.entries(params)) {
      if (value !== null && value !== undefined) {
        httpParams = httpParams.set(key, String(value));
      }
    }
    return httpParams;
  }
}
