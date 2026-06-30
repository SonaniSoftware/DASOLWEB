import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LayoutStateService {
  readonly navCollapsedMob = signal(false);

  toggle() {
    this.navCollapsedMob.update(v => !v);
  }

  open() {
    this.navCollapsedMob.set(true);
  }

  close() {
    this.navCollapsedMob.set(false);
  }
}
