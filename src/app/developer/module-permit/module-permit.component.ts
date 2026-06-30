import { Component, OnInit, inject } from '@angular/core';
import { DeveloperService, PermitRow, UserRow } from '../../core/services/developer.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-module-permit',
  standalone: false,
  templateUrl: './module-permit.component.html',
  styleUrl: '../developer-page.scss',
})
export class ModulePermitComponent implements OnInit {
  private dev = inject(DeveloperService);
  private notify = inject(NotificationService);

  users: UserRow[] = [];
  permits: PermitRow[] = [];
  selectedUserId = 0;
  loading = false;
  saving = false;

  ngOnInit(): void {
    this.dev.listUsers().subscribe((u) => (this.users = u));
  }

  onUserChange(): void {
    if (!this.selectedUserId) {
      this.permits = [];
      return;
    }
    this.loading = true;
    this.dev.getModulePermit(this.selectedUserId).subscribe({
      next: (p) => { this.permits = p.map((r) => ({ ...r, ISVisible: !!r.ISVisible })); this.loading = false; },
      error: () => (this.loading = false),
    });
  }

  toggleAll(visible: boolean): void {
    this.permits = this.permits.map((p) => ({ ...p, ISVisible: visible }));
  }

  save(): void {
    if (!this.selectedUserId) {
      this.notify.warning('Select a user first.');
      return;
    }
    this.saving = true;
    const payload = this.permits.map((p) => ({ moduleId: p.ModuleID, isVisible: !!p.ISVisible }));
    this.dev.saveModulePermit(this.selectedUserId, payload).subscribe({
      next: () => { this.notify.success('Permissions saved.'); this.saving = false; },
      error: (e) => { this.saving = false; this.notify.error(e?.error?.message ?? 'Save failed.'); },
    });
  }
}
