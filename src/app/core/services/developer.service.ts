import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface ModuleRow {
  ModuleID: number;
  ModuleCode: string;
  ModuleName: string;
  ISActive: boolean;
}
export interface MenuRow {
  MenuID: number;
  ModuleID: number;
  ModuleName: string;
  MenuCode: string;
  MenuName: string;
  MenuTab: string;
  MenuIcon: string;
  RoutePath: string;
  ISActive: boolean;
}
export interface FormRow {
  FormID: number;
  MenuID: number;
  MenuName: string;
  FormCode: string;
  FormName: string;
  FormType: string;
  RoutePath: string | null;
  Controller: string | null;
  ActionName: string | null;
  ISPopup: boolean;
  ISReport: boolean;
  ISActive: boolean;
}

export interface ProcessTypeRow {
  TypeID: number;
  TypeCode: string;
  TypeName: string;
  TypeRemark: string | null;
  ISActive: boolean;
}
export interface ProcessStatusRow {
  TypeID: number;
  StatusID: number;
  TypeName: string;
  StatusCode: string;
  StatusName: string;
  StatusRemark: string | null;
  ISActive: boolean;
}
export interface ProcessMasterRow {
  TypeID: number;
  ProcessID: number;
  TypeName: string;
  ProcessCode: string;
  ProcessName: string;
  ProcessRemark: string | null;
  ISActive: boolean;
}
export interface ProcessPermitRow {
  TypeID: number;
  ProcessID: number;
  StatusID: number;
  PermitCode: string | null;
  PermitName: string | null;
  NProcessID: number | null;
  NStatusID: number | null;
  ISFinal: boolean;
  ISActive: boolean;
  SerialNo: number | null;
  // Resolved client-side for the grid:
  TypeName?: string;
  ProcessName?: string;
  StatusName?: string;
  NProcessName?: string;
  NStatusName?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class DeveloperService {
  private http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/developer`;

  private get<T>(path: string): Observable<T> {
    return this.http.get<ApiResponse<T>>(`${this.api}${path}`).pipe(map((r) => r.data));
  }

  // Module Master
  listModules() {
    return this.get<ModuleRow[]>('/modules');
  }
  createModule(body: unknown) {
    return this.http.post<ApiResponse<unknown>>(`${this.api}/modules`, body);
  }
  updateModule(id: number, body: unknown) {
    return this.http.put<ApiResponse<unknown>>(`${this.api}/modules/${id}`, body);
  }
  deleteModule(id: number) {
    return this.http.delete<ApiResponse<unknown>>(`${this.api}/modules/${id}`);
  }

  // Menu Master
  listMenus() {
    return this.get<MenuRow[]>('/menus');
  }
  createMenu(body: unknown) {
    return this.http.post<ApiResponse<unknown>>(`${this.api}/menus`, body);
  }
  updateMenu(id: number, body: unknown) {
    return this.http.put<ApiResponse<unknown>>(`${this.api}/menus/${id}`, body);
  }
  deleteMenu(id: number) {
    return this.http.delete<ApiResponse<unknown>>(`${this.api}/menus/${id}`);
  }

  // Form Master
  listForms() {
    return this.get<FormRow[]>('/forms');
  }
  createForm(body: unknown) {
    return this.http.post<ApiResponse<unknown>>(`${this.api}/forms`, body);
  }
  updateForm(id: number, body: unknown) {
    return this.http.put<ApiResponse<unknown>>(`${this.api}/forms/${id}`, body);
  }
  deleteForm(id: number) {
    return this.http.delete<ApiResponse<unknown>>(`${this.api}/forms/${id}`);
  }

  // Process Type
  listProcessTypes() {
    return this.get<ProcessTypeRow[]>('/process-types');
  }
  createProcessType(body: unknown) {
    return this.http.post<ApiResponse<unknown>>(`${this.api}/process-types`, body);
  }
  updateProcessType(id: number, body: unknown) {
    return this.http.put<ApiResponse<unknown>>(`${this.api}/process-types/${id}`, body);
  }
  deleteProcessType(id: number) {
    return this.http.delete<ApiResponse<unknown>>(`${this.api}/process-types/${id}`);
  }

  // Process Status (composite key)
  listProcessStatuses() {
    return this.get<ProcessStatusRow[]>('/process-statuses');
  }
  createProcessStatus(body: unknown) {
    return this.http.post<ApiResponse<unknown>>(`${this.api}/process-statuses`, body);
  }
  updateProcessStatus(typeId: number, statusId: number, body: unknown) {
    return this.http.put<ApiResponse<unknown>>(`${this.api}/process-statuses/${typeId}/${statusId}`, body);
  }
  deleteProcessStatus(typeId: number, statusId: number) {
    return this.http.delete<ApiResponse<unknown>>(`${this.api}/process-statuses/${typeId}/${statusId}`);
  }

  // Process Master (composite key)
  listProcesses() {
    return this.get<ProcessMasterRow[]>('/processes');
  }
  createProcess(body: unknown) {
    return this.http.post<ApiResponse<unknown>>(`${this.api}/processes`, body);
  }
  updateProcess(typeId: number, processId: number, body: unknown) {
    return this.http.put<ApiResponse<unknown>>(`${this.api}/processes/${typeId}/${processId}`, body);
  }
  deleteProcess(typeId: number, processId: number) {
    return this.http.delete<ApiResponse<unknown>>(`${this.api}/processes/${typeId}/${processId}`);
  }

  // Process Permit (composite key TypeID + ProcessID + StatusID)
  listProcessPermits() {
    return this.get<ProcessPermitRow[]>('/process-permits');
  }
  createProcessPermit(body: unknown) {
    return this.http.post<ApiResponse<unknown>>(`${this.api}/process-permits`, body);
  }
  updateProcessPermit(typeId: number, processId: number, statusId: number, body: unknown) {
    return this.http.put<ApiResponse<unknown>>(`${this.api}/process-permits/${typeId}/${processId}/${statusId}`, body);
  }
  deleteProcessPermit(typeId: number, processId: number, statusId: number) {
    return this.http.delete<ApiResponse<unknown>>(`${this.api}/process-permits/${typeId}/${processId}/${statusId}`);
  }
}
