import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

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
export interface MenuPermitRow {
  MenuID: number;
  MenuCode: string;
  MenuName: string;
  ModuleID: number;
  ModuleCode: string;
  ModuleName: string;
  MenuTab: string;
  MenuIcon: string;
  ISVisible: boolean;
  ISActive: boolean;
  HasPermit: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/settings`;

  private get<T>(path: string): Observable<T> {
    return this.http.get<ApiResponse<T>>(`${this.api}${path}`).pipe(map((r) => r.data));
  }

  // Users
  listUsers() {
    return this.get<UserRow[]>('/users');
  }

  // Module Permit
  getModulePermit(userId: number) {
    return this.get<PermitRow[]>(`/permit/module/${userId}`);
  }
  saveModulePermit(userId: number, permits: { moduleId: number; isVisible: boolean }[]) {
    return this.http.post<ApiResponse<unknown>>(`${this.api}/permit/module`, { userId, permits });
  }

  // Menu Permit
  getMenuPermit(userId: number) {
    return this.get<MenuPermitRow[]>(`/permit/menu/${userId}`);
  }
  saveMenuPermit(userId: number, permits: { menuId: number; moduleId: number; isVisible: boolean }[]) {
    return this.http.post<ApiResponse<unknown>>(`${this.api}/permit/menu`, { userId, permits });
  }
}
