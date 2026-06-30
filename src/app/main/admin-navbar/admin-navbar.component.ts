import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-admin-navbar',
  standalone: false,
  templateUrl: './admin-navbar.component.html',
  styleUrl: './admin-navbar.component.scss',
})
export class AdminNavbarComponent {
  /** Hamburger clicked — the layout decides collapse vs mobile-drawer. */
  @Output() toggleSidebar = new EventEmitter<void>();
}
