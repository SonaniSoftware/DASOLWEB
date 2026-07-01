import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

/** A row of HRM_EmployeeRegister (PassHash is never sent to the client). */
export interface EmployeeRow {
  RegisterID: number;
  AadharNo: string;
  Email: string;
  Mobile: string;
  UserName: string;
  FirstName: string;
  MiddleName: string;
  LastName: string;
  ISVerify: boolean;
  ISActive: boolean;
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
  updateEmployee(id: number, body: unknown) {
    return this.http.put<ApiResponse<unknown>>(`${this.api}/${id}`, body);
  }
  deleteEmployee(id: number) {
    return this.http.delete<ApiResponse<unknown>>(`${this.api}/${id}`);
  }
}
