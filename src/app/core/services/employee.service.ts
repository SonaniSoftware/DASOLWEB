import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

/**
 * A row of HRM_EmployeeRegister_DataByID / _GetData (PassHash is never sent
 * to the client). The HRM_* fields are null when the account exists in
 * ATH_RegisterMaster but has not applied as an employee yet (LEFT JOIN).
 */
export interface EmployeeRow {
  RegisterID: number;
  AadharNo: string | null;
  Email: string;
  Mobile: string;
  UserName: string;
  FirstName: string;
  MiddleName: string | null;
  LastName: string | null;
  ISVerify: boolean | null;
  ISActive: boolean | null;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/employees`;

  listEmployees(): Observable<EmployeeRow[]> {
    return this.http.get<ApiResponse<EmployeeRow[]>>(this.api).pipe(map((r) => r.data));
  }
  getEmployee(id: number): Observable<EmployeeRow> {
    return this.http.get<ApiResponse<EmployeeRow>>(`${this.api}/${id}`).pipe(map((r) => r.data));
  }
  createEmployee(body: unknown) {
    return this.http.post<ApiResponse<unknown>>(this.api, body);
  }
  /** Guest "Apply" — insert-only for the caller's own RegisterID. */
  applyEmployee(body: unknown) {
    return this.http.post<ApiResponse<unknown> & { message?: string }>(`${this.api}/apply`, body);
  }
  updateEmployee(id: number, body: unknown) {
    return this.http.put<ApiResponse<unknown>>(`${this.api}/${id}`, body);
  }
  deleteEmployee(id: number) {
    return this.http.delete<ApiResponse<unknown>>(`${this.api}/${id}`);
  }
}
