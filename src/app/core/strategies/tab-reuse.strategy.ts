import { Injectable, inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  DetachedRouteHandle,
  RouteReuseStrategy,
} from '@angular/router';
import { TabService } from '../services/tab.service';

/**
 * Keeps each open tab's component alive (detached) so switching tabs preserves
 * state — like a desktop app. A component is evicted when its tab is closed.
 */
@Injectable()
export class TabReuseStrategy implements RouteReuseStrategy {
  private handles = new Map<string, DetachedRouteHandle>();
  private tabs = inject(TabService);

  constructor() {
    this.tabs.onClose((url) => this.handles.delete(this.normalize(url)));
  }

  private normalize(url: string): string {
    return url.split('?')[0];
  }

  private key(route: ActivatedRouteSnapshot): string {
    const path = route.pathFromRoot
      .map((r) => r.url.map((s) => s.path).join('/'))
      .filter(Boolean)
      .join('/');
    return '/' + path;
  }

  /**
   * Cache leaf content routes only — skip the layout shell, auth pages, and the
   * transient /modules resolver (it must re-run to redirect to the real screen).
   */
  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    const key = this.key(route);
    return (
      !!route.routeConfig?.component &&
      !route.firstChild &&
      !key.startsWith('/auth') &&
      !key.startsWith('/modules')
    );
  }

  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle | null): void {
    const key = this.key(route);
    if (handle) {
      this.handles.set(key, handle);
    } else {
      this.handles.delete(key);
    }
  }

  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    return this.handles.has(this.key(route));
  }

  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    if (!route.routeConfig) return null;
    return this.handles.get(this.key(route)) ?? null;
  }

  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    return future.routeConfig === curr.routeConfig;
  }
}
