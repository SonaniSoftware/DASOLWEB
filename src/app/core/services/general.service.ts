import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface LookupRow {
  LookupType: string;
  LookupID: number;
  LookupCode: string | null;
  LookupName: string;
  Remarks: string | null;
  ISActive: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface ComboItem {
  id: number;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class GeneralService {
  private http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/general`;

  private get<T>(path: string): Observable<T> {
    return this.http.get<ApiResponse<T>>(`${this.api}${path}`).pipe(map((r) => r.data));
  }

  /** GEN_FillCombo values (id/name) for a type, e.g. DIVISION, WAREHOUSE. */
  getFillCombo(type: string) {
    return this.get<ComboItem[]>(`/fillcombo?type=${encodeURIComponent(type)}`);
  }

  // Lookup Master
  /** List lookups; optional server-side filter by LookupType (GEN_LookupMaster_GetData @LookupType). */
  listLookups(type?: string) {
    return this.get<LookupRow[]>(type ? `/lookups?type=${encodeURIComponent(type)}` : '/lookups');
  }
  getLookup(type: string, id: number) {
    return this.get<LookupRow>(`/lookups/${encodeURIComponent(type)}/${id}`);
  }
  createLookup(body: unknown) {
    return this.http.post<ApiResponse<unknown>>(`${this.api}/lookups`, body);
  }
  updateLookup(type: string, id: number, body: unknown) {
    return this.http.put<ApiResponse<unknown>>(`${this.api}/lookups/${encodeURIComponent(type)}/${id}`, body);
  }
  deleteLookup(type: string, id: number) {
    return this.http.delete<ApiResponse<unknown>>(`${this.api}/lookups/${encodeURIComponent(type)}/${id}`);
  }
}
