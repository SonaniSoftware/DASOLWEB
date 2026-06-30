import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface PermittedGroup {
  groupId: number;
  code: string;
  name: string;
}

/** A menu the user is permitted to see (STT_MenuPermit). */
export interface MenuRef {
  menuId: number;
  menuCode: string;
  menuName: string;
  menuTab: string;
  icon: string;
  routePath: string | null;
  moduleId: number;
  moduleCode: string;
  moduleName: string;
}

/** A form reference under a menu (Menu → Form). */
export interface FormRef {
  menuId: number;
  menuCode: string;
  menuName: string;
  formId: number;
  formCode: string;
  formName: string;
  formType: string | null;
  isReport: boolean;
  routePath: string | null;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class ModuleService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/modules`;

  /** Modules the user may see (STT_ModulePermit). */
  getMyGroups(): Observable<PermittedGroup[]> {
    return this.http
      .get<ApiResponse<PermittedGroup[]>>(`${this.apiUrl}/groups`)
      .pipe(map((res) => res.data ?? []));
  }

  /** Menus the user may see (STT_MenuPermit). */
  getMyMenus(): Observable<MenuRef[]> {
    return this.http
      .get<ApiResponse<MenuRef[]>>(`${this.apiUrl}/menus`)
      .pipe(map((res) => res.data ?? []));
  }

  /** Forms under a single menu. */
  getMenuForms(menuId: number | string): Observable<FormRef[]> {
    return this.http
      .get<ApiResponse<FormRef[]>>(`${this.apiUrl}/menu/${menuId}/forms`)
      .pipe(map((res) => res.data ?? []));
  }
}
