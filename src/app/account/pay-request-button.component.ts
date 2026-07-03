import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

/** Parent component must expose paymentRequest(row). */
interface PayRequestParent {
  paymentRequest(row: unknown): void;
}

@Component({
  selector: 'app-pay-request-button',
  standalone: false,
  template: `
    <button type="button" class="btn btn-sm btn-outline-primary pay-req-btn" title="Payment Request" (click)="onClick()">
      <span class="material-icons">request_quote</span>
    </button>
  `,
  styles: [
    `
    .pay-req-btn { display: inline-flex; align-items: center; justify-content: center; padding: 1px 6px; }
    .pay-req-btn .material-icons { font-size: 18px; line-height: 1; vertical-align: middle; }
    `,
  ],
})
export class PayRequestButtonComponent implements ICellRendererAngularComp {
  private params!: ICellRendererParams & { context: { componentParent: PayRequestParent } };

  agInit(params: ICellRendererParams): void {
    this.params = params as never;
  }

  refresh(): boolean {
    return false;
  }

  onClick(): void {
    this.params.context?.componentParent?.paymentRequest(this.params.data);
  }
}
