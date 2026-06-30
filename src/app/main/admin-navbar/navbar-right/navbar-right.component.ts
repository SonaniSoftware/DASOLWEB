import { Component, HostListener, inject } from '@angular/core';
import { AuthService, User } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar-right',
  standalone: false,
  templateUrl: './navbar-right.component.html',
  styleUrl: './navbar-right.component.scss',
})
export class NavbarRightComponent {
  private auth = inject(AuthService);

  open = false;

  get user(): User | null {
    return this.auth.getUser();
  }

  get displayName(): string {
    return this.user?.fullName?.trim() || this.user?.username || 'User';
  }

  get initials(): string {
    const name = this.displayName;
    const parts = name.split(' ').filter(Boolean);
    const letters = parts.length > 1 ? parts[0][0] + parts[1][0] : name.slice(0, 2);
    return letters.toUpperCase();
  }

  toggle(event: Event): void {
    event.stopPropagation();
    this.open = !this.open;
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.open = false;
  }

  logout(): void {
    this.open = false;
    this.auth.logout();
  }
}
