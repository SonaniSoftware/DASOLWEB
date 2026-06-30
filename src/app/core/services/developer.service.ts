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
export interface UserRow {
  UserID: number;
  UserCode: string;
  UserName: string;
  FullName: string;
  Email: string;
}
export interface PermitRow {
  ModuleID: number;
  ModuleCode: string;
  ModuleName: string;
  ISVisible: boolean;
  ISActive: boolean;
  HasPermit: boolean;
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

  // Users + Module Permit
  listUsers() {
    return this.get<UserRow[]>('/users');
  }
  getModulePermit(userId: number) {
    return this.get<PermitRow[]>(`/permit/module/${userId}`);
  }
  saveModulePermit(userId: number, permits: { moduleId: number; isVisible: boolean }[]) {
    return this.http.post<ApiResponse<unknown>>(`${this.api}/permit/module`, { userId, permits });
  }
}
