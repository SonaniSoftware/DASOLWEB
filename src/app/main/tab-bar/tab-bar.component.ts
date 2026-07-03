import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

import { TabService } from '../../core/services/tab.service';

@Component({
  selector: 'app-tab-bar',
  standalone: false,
  templateUrl: './tab-bar.component.html',
  styleUrl: './tab-bar.component.scss',
})
export class TabBarComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  tab = inject(TabService);

  /** True until the first in-app navigation after a page load / browser refresh. */
  private firstNav = true;

  ngOnInit(): void {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => {
        const url = this.router.url.split('?')[0];
        // Skip auth + the transient /modules resolver (it redirects to the real screen).
        if (url.startsWith('/auth') || url === '/' || url.startsWith('/modules')) return;
        // On browser refresh, don't re-open a tab for the landing page — keep the
        // tab bar hidden until the user navigates somewhere.
        if (this.firstNav) { this.firstNav = false; return; }
        // Prefer the menu's registered title/icon (chosen in Menu Master) over
        // route-derived values, so the tab shows the selected icon.
        const meta = this.tab.metaFor(url);
        const title = meta?.title || this.resolveTitle(url);
        const icon = meta?.icon || this.resolveIcon();
        this.tab.open(url, title, icon);
      });
  }

  /** Title from the deepest route's `data.title`, else derived from the URL. */
  private resolveTitle(url: string): string {
    let r = this.route.root;
    let title = '';
    while (r.firstChild) {
      r = r.firstChild;
      if (r.snapshot.data?.['title']) title = r.snapshot.data['title'];
    }
    if (title) return title;
    const seg = url.split('/').filter(Boolean).pop() ?? 'Page';
    return seg.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }

  private resolveIcon(): string {
    let r = this.route.root;
    let icon = 'tab';
    while (r.firstChild) {
      r = r.firstChild;
      if (r.snapshot.data?.['icon']) icon = r.snapshot.data['icon'];
    }
    return icon;
  }

  select(url: string): void {
    if (url !== this.tab.activeUrl()) this.router.navigateByUrl(url);
  }

  close(url: string, event: Event): void {
    event.stopPropagation();
    const target = this.tab.close(url);
    if (target !== undefined) {
      this.router.navigateByUrl(target || '/dashboard/default');
    }
  }

  closeAll(): void {
    this.tab.closeAll();
    this.router.navigateByUrl('/dashboard/default');
  }
}
