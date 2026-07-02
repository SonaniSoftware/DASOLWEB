import { Injectable, signal } from '@angular/core';

export interface WorkTab {
  url: string;
  title: string;
  icon: string;
}

@Injectable({ providedIn: 'root' })
export class TabService {
  /** Open tabs, in the order they were opened. */
  readonly tabs = signal<WorkTab[]>([]);
  /** Currently active tab url. */
  readonly activeUrl = signal<string>('');

  // Listeners notified when a tab closes (used to evict its cached component).
  private closeListeners: Array<(url: string) => void> = [];

  // url → { title, icon } registered by the sidebar from each menu's config,
  // so a tab shows the icon the user picked in Menu Master (not a generic one).
  private meta = new Map<string, { title: string; icon: string }>();

  onClose(fn: (url: string) => void): void {
    this.closeListeners.push(fn);
  }

  /** Register a menu's title + selected icon for its url (called by the sidebar). */
  registerMeta(url: string, title: string, icon: string): void {
    this.meta.set(this.normalize(url), { title, icon });
  }

  /** Look up a menu's registered title + icon by url. */
  metaFor(url: string): { title: string; icon: string } | undefined {
    return this.meta.get(this.normalize(url));
  }

  private normalize(url: string): string {
    return url.split('?')[0].replace(/\/+$/, '').toLowerCase();
  }

  /** Open (or focus) a tab for a route. */
  open(url: string, title: string, icon = 'tab'): void {
    if (!this.tabs().some((t) => t.url === url)) {
      this.tabs.update((list) => [...list, { url, title, icon }]);
    }
    this.activeUrl.set(url);
  }

  /**
   * Close a tab. Returns the url to navigate to next:
   *  - a neighbour url when the active tab was closed
   *  - '' when no tabs remain (caller should go home)
   *  - undefined when a background (non-active) tab was closed (no navigation)
   */
  close(url: string): string | undefined {
    const list = this.tabs();
    const idx = list.findIndex((t) => t.url === url);
    if (idx === -1) return undefined;

    const next = list.filter((t) => t.url !== url);
    this.tabs.set(next);
    this.closeListeners.forEach((fn) => fn(url));

    if (this.activeUrl() !== url) {
      return undefined;
    }
    const neighbour = next[idx] ?? next[idx - 1] ?? null;
    const target = neighbour?.url ?? '';
    this.activeUrl.set(target);
    return target;
  }

  closeAll(): string {
    const urls = this.tabs().map((t) => t.url);
    this.tabs.set([]);
    urls.forEach((u) => this.closeListeners.forEach((fn) => fn(u)));
    this.activeUrl.set('');
    return '';
  }
}
