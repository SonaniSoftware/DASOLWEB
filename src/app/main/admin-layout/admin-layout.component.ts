import { Component, inject } from '@angular/core';
import { LayoutStateService } from '../../core/services/layout-state.service';

@Component({
  selector: 'app-admin-layout',
  standalone: false,
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss',
})
export class AdminLayoutComponent {
  private layoutState = inject(LayoutStateService);

  /** Desktop: sidebar collapsed (hidden, content full-width). */
  navCollapsed = false;

  readonly year = new Date().getFullYear();

  /** Mobile drawer open state (from shared signal). */
  get navCollapsedMob(): boolean {
    return this.layoutState.navCollapsedMob();
  }

  /** One hamburger, context-aware: drawer on mobile, collapse on desktop. */
  toggleSidebar(): void {
    if (window.innerWidth < 992) {
      this.layoutState.toggle();
    } else {
      this.navCollapsed = !this.navCollapsed;
    }
  }

  closeMenu(): void {
    this.layoutState.close();
  }

  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.closeMenu();
    }
  }
}
