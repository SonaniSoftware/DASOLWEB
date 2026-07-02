import { Component, Input, OnInit, inject } from '@angular/core';
import { NavigationItem } from '../navigation-items';
import { LayoutStateService } from '../../../core/services/layout-state.service';

@Component({
  selector: 'app-nav-item',
  standalone: false,
  templateUrl: './nav-item.component.html',
  styleUrl: './nav-item.component.scss',
})
export class NavItemComponent implements OnInit {
  @Input() item!: NavigationItem;
  /** Nesting depth — drives left indentation. */
  @Input() depth = 0;

  expanded = false;

  private layout = inject(LayoutStateService);

  ngOnInit(): void {
    // Top-level modules start expanded (arrow up) when the sidebar loads.
    if (this.depth === 0 && this.item?.type === 'collapse') {
      this.expanded = true;
    }
  }

  get paddingLeft(): number {
    return 24 + this.depth * 16;
  }

  toggle(): void {
    this.expanded = !this.expanded;
  }

  /** Close the mobile drawer after navigating to a leaf. */
  onLeafClick(): void {
    if (window.innerWidth < 992) {
      this.layout.close();
    }
  }
}
