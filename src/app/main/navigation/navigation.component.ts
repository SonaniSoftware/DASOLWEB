import { Component, ElementRef, EventEmitter, HostListener, OnInit, Output, inject } from '@angular/core';
import { forkJoin } from 'rxjs';

import { NavigationItem } from './navigation-items';
import { MenuRef, ModuleService, PermittedGroup } from '../../core/services/module.service';
import { iconForCode, iconForTab, titleCase } from '../../modules/module-groups';

@Component({
  selector: 'app-navigation',
  standalone: false,
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss',
})
export class NavigationComponent implements OnInit {
  /** Emitted when the menu requests the layout to close (mobile). */
  @Output() NavCollapse = new EventEmitter<void>();

  private moduleApi = inject(ModuleService);
  private host = inject(ElementRef<HTMLElement>);

  loading = true;
  navigationItems: NavigationItem[] = [];

  ngOnInit(): void {
    const items: NavigationItem[] = [
      {
        id: 'navigation',
        title: 'Navigation',
        type: 'group',
        children: [
          { id: 'dashboard', title: 'Dashboard', type: 'item', url: '/dashboard/default', icon: 'dashboard' },
        ],
      },
    ];

    // Modules (STT_ModulePermit) + menus (STT_MenuPermit), both per-user via SPs.
    forkJoin({ groups: this.moduleApi.getMyGroups(), menus: this.moduleApi.getMyMenus() }).subscribe({
      next: ({ groups, menus }) => {
        if (groups.length) {
          items.push({
            id: 'modules',
            title: 'Modules',
            type: 'group',
            children: groups.map((g) => this.buildModuleNode(g, menus)),
          });
        }
        this.navigationItems = items;
        this.loading = false;
        setTimeout(() => this.ensureEntryPoint());
      },
      error: () => {
        this.navigationItems = items;
        this.loading = false;
        setTimeout(() => this.ensureEntryPoint());
      },
    });
  }

  /** Module (UPPERCASE) → MenuTab subgroups (Title Case) → menus. */
  private buildModuleNode(group: PermittedGroup, menus: MenuRef[]): NavigationItem {
    const code = group.code.toLowerCase();
    const myMenus = menus.filter((m) => m.moduleId === group.groupId);

    // Distinct MenuTabs, in first-seen order.
    const tabs = [...new Set(myMenus.map((m) => m.menuTab || 'General'))];

    const tabNodes: NavigationItem[] = tabs.map((tab) => ({
      id: `${code}-tab-${tab.toLowerCase()}`,
      title: titleCase(tab),
      type: 'collapse' as const,
      icon: iconForTab(tab),
      children: myMenus
        .filter((m) => (m.menuTab || 'General') === tab)
        .map((m) => ({
          id: `${code}-${m.menuId}`,
          title: titleCase(m.menuName),
          type: 'item' as const,
          // Menu opens its own screen (RoutePath) when set; else its forms.
          url: m.routePath ? m.routePath.toLowerCase() : `/modules/${code}/${m.menuId}`,
          icon: m.icon || 'description',
        })),
    }));

    return {
      id: code,
      title: group.name, // keep module name UPPERCASE
      type: 'collapse',
      icon: iconForCode(group.code),
      children: tabNodes,
    };
  }

  // ---- Keyboard navigation (tree: ↑/↓ move, →/← expand-collapse, Enter/Space activate) ----

  private visibleLinks(): HTMLElement[] {
    const root = this.host.nativeElement as HTMLElement;
    return Array.from(root.querySelectorAll<HTMLElement>('.nav-link')).filter(
      (el) => !el.closest('.nav-submenu:not(.open)'),
    );
  }

  private ensureEntryPoint(): void {
    const links = this.visibleLinks();
    if (links.length && !links.some((l) => l.getAttribute('tabindex') === '0')) {
      links[0].setAttribute('tabindex', '0');
    }
  }

  private parentToggle(el: HTMLElement): HTMLElement | null {
    const prev = el.closest('.nav-submenu')?.previousElementSibling as HTMLElement | null;
    return prev?.classList.contains('nav-link') ? prev : null;
  }

  @HostListener('focusin', ['$event'])
  onFocusIn(event: FocusEvent): void {
    const target = event.target as HTMLElement;
    if (!target?.classList?.contains('nav-link')) return;
    this.host.nativeElement
      .querySelectorAll('.nav-link')
      .forEach((l: Element) => l.setAttribute('tabindex', l === target ? '0' : '-1'));
  }

  @HostListener('keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    const keys = ['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft', 'Home', 'End', 'Enter', ' '];
    if (!keys.includes(event.key)) return;

    const links = this.visibleLinks();
    if (!links.length) return;

    const idx = links.indexOf(document.activeElement as HTMLElement);
    if (idx === -1) {
      event.preventDefault();
      links[0].focus();
      return;
    }

    const current = links[idx];
    const isToggle = current.classList.contains('collapse-toggle');
    const isOpen = current.classList.contains('open');

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        links[Math.min(idx + 1, links.length - 1)].focus();
        break;
      case 'ArrowUp':
        event.preventDefault();
        links[Math.max(idx - 1, 0)].focus();
        break;
      case 'Home':
        event.preventDefault();
        links[0].focus();
        break;
      case 'End':
        event.preventDefault();
        links[links.length - 1].focus();
        break;
      case 'ArrowRight':
        event.preventDefault();
        if (isToggle && !isOpen) {
          current.click();
        } else if (isToggle && isOpen && links[idx + 1]) {
          links[idx + 1].focus();
        }
        break;
      case 'ArrowLeft':
        event.preventDefault();
        if (isToggle && isOpen) {
          current.click();
        } else {
          this.parentToggle(current)?.focus();
        }
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        current.click();
        break;
    }
  }
}
