import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

/**
 * Editable checkbox cell for the Module Permit grid.
 * Toggling it updates the row's ISVisible directly (rows are the same
 * objects as the component's `permits` array, so save() reads them back).
 */
@Component({
  selector: 'app-permit-checkbox',
  standalone: false,
  template: `
    <div class="form-check d-inline-block m-0">
      <input class="form-check-input" type="checkbox" [checked]="value" (change)="onToggle($event)" />
    </div>
  `,
})
export class PermitCheckboxComponent implements ICellRendererAngularComp {
  value = false;
  private params!: ICellRendererParams;

  agInit(params: ICellRendererParams): void {
    this.params = params;
    this.value = !!params.value;
  }

  refresh(params: ICellRendererParams): boolean {
    this.value = !!params.value;
    return true;
  }

  onToggle(event: Event): void {
    this.value = (event.target as HTMLInputElement).checked;
    if (this.params.data) this.params.data.ISVisible = this.value;
  }
}
