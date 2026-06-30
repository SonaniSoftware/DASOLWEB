import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, inject } from '@angular/core';
import { MATERIAL_ICON_NAMES } from './material-icons';
import { IconService } from './icon.service';

@Component({
  selector: 'app-icon-picker',
  standalone: false,
  template: `
    <div class="icon-picker">
      <button type="button" class="ip-trigger form-control text-start" (click)="toggle()">
        @if (value) {
          <span class="material-icons">{{ value }}</span>
          <span class="ip-name">{{ value }}</span>
        } @else {
          <span class="material-icons text-muted">add_reaction</span>
          <span class="text-muted ip-name">Pick an icon…</span>
        }
        <span class="material-icons ms-auto text-muted">arrow_drop_down</span>
      </button>

      @if (open) {
        <div class="ip-panel" (click)="$event.stopPropagation()">
          <div class="ip-search">
            <span class="material-icons">search</span>
            <input type="text" [(ngModel)]="search" placeholder="Search {{ icons.length }} icons…" (keyup.enter)="applyCustom()" autofocus />
            @if (value) { <button type="button" class="ip-clear material-icons" (click)="select('')" title="Clear">close</button> }
          </div>

          <div class="ip-list">
            @for (ic of displayed; track ic) {
              <button type="button" class="ip-row" [class.active]="ic === value" (click)="select(ic)">
                <span class="material-icons">{{ ic }}</span>
                <span class="ip-row-name">{{ ic }}</span>
              </button>
            } @empty {
              <button type="button" class="ip-use" (click)="applyCustom()">
                <span class="material-icons">{{ search }}</span> Use “{{ search }}”
              </button>
            }
          </div>

          @if (overflow > 0) {
            <div class="ip-more">+{{ overflow }} more — refine your search</div>
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
    .icon-picker { position: relative; }
    .ip-trigger { display: flex; align-items: center; gap: 8px; height: 38px; min-width: 0; cursor: pointer; }
    .ip-trigger > .material-icons { font-size: 20px; flex-shrink: 0; }
    .ip-name { font-size: 14px; color: #101828; min-width: 0; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

    .ip-panel {
      position: absolute; z-index: 1100; top: calc(100% + 4px); left: 0; width: 300px;
      background: #fff; border: 1px solid #e6ebf1; border-radius: 10px;
      box-shadow: 0 8px 24px rgba(16,24,40,.12); padding: 1px;
    }
    .ip-search { display: flex; align-items: center; gap: 6px; border: 1px solid #d0d5dd; border-radius: 8px; padding: 1px; margin-bottom: 8px; }
    .ip-search > .material-icons { font-size: 18px; color: #98a2b3; }
    .ip-search input { border: none; outline: none; flex: 1; font-size: 14px; min-width: 0; }
    .ip-clear { border: none; background: transparent; color: #98a2b3; cursor: pointer; font-size: 18px; }

    .ip-list { max-height: 280px; overflow-y: auto; display: flex; flex-direction: column; gap: 2px; }
    .ip-row {
      display: flex; align-items: center; gap: 10px; width: 100%; padding: 1px;
      border: none; background: transparent; border-radius: 8px; cursor: pointer; text-align: left; color: #344054;
    }
    .ip-row .material-icons { font-size: 20px; color: #475467; flex-shrink: 0; }
    .ip-row-name { font-size: 13px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .ip-row:hover { background: #f5f7f9; }
    .ip-row.active { background: #1677ff; color: #fff; }
    .ip-row.active .material-icons { color: #fff; }

    .ip-use { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 1px; border: 1px dashed #d0d5dd; border-radius: 8px; background: #fff; color: #1677ff; cursor: pointer; }
    .ip-use .material-icons { font-size: 20px; }
    .ip-more { padding: 1px; font-size: 12px; color: #98a2b3; text-align: center; }
    `,
  ],
})
export class IconPickerComponent implements OnInit {
  @Input() value = '';
  @Output() valueChange = new EventEmitter<string>();

  private el = inject(ElementRef);
  private iconApi = inject(IconService);

  open = false;
  search = '';
  icons: string[] = MATERIAL_ICON_NAMES;

  /** Cap rendered rows so a 2000-icon list stays smooth; search narrows it. */
  private readonly LIMIT = 300;

  ngOnInit(): void {
    this.iconApi.getIcons().then((list) => (this.icons = list));
  }

  private get filtered(): string[] {
    const q = this.search.trim().toLowerCase();
    return q ? this.icons.filter((i) => i.includes(q)) : this.icons;
  }

  get displayed(): string[] {
    return this.filtered.slice(0, this.LIMIT);
  }

  get overflow(): number {
    return Math.max(0, this.filtered.length - this.LIMIT);
  }

  toggle(): void {
    this.open = !this.open;
    if (this.open) this.search = '';
  }

  select(icon: string): void {
    this.value = icon;
    this.valueChange.emit(icon);
    this.open = false;
  }

  applyCustom(): void {
    const v = this.search.trim();
    if (v) this.select(v);
  }

  @HostListener('document:click', ['$event'])
  onDocClick(event: Event): void {
    if (!this.el.nativeElement.contains(event.target)) this.open = false;
  }
}
