import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

/** Parent components expose edit(row) / remove(row). */
interface ActionsParent {
  edit(row: unknown): void;
  remove(row: unknown): void;
}

@Component({
  selector: 'app-grid-actions',
  standalone: false,
  template: `
    <div class="grid-actions">
      <button type="button" class="btn btn-sm btn-light" title="Edit" (click)="onEdit()">
        <span class="material-icons">edit</span>
      </button>
      <button type="button" class="btn btn-sm btn-light text-danger" title="Delete" (click)="onRemove()">
        <span class="material-icons">delete</span>
      </button>
    </div>
  `,
  styles: [
    `.grid-actions { display: flex; gap: 4px; }
     .grid-actions .material-icons { font-size: 18px; line-height: 1; vertical-align: middle; }`,
  ],
})
export class GridActionsComponent implements ICellRendererAngularComp {
  private params!: ICellRendererParams & { context: { componentParent: ActionsParent } };

  agInit(params: ICellRendererParams): void {
    this.params = params as never;
  }

  refresh(): boolean {
    return false;
  }

  onEdit(): void {
    this.params.context?.componentParent?.edit(this.params.data);
  }

  onRemove(): void {
    this.params.context?.componentParent?.remove(this.params.data);
  }
}
