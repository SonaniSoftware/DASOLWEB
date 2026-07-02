import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ColDef, GridApi, GridReadyEvent, ICellRendererParams, RowDoubleClickedEvent, ValueFormatterParams } from 'ag-grid-community';
import { AccountService, BillingDocumentRow } from '../../core/services/account.service';
import { NotificationService } from '../../core/services/notification.service';
import { gridTheme } from '../../developer/grid-shared';

@Component({
  selector: 'app-billing-document-list',
  standalone: false,
  templateUrl: './billing-document-list.component.html',
  styleUrls: ['../../developer/developer-page.scss', './billing-document-list.component.scss'],
})
export class BillingDocumentListComponent implements OnInit {
  private api = inject(AccountService);
  private notify = inject(NotificationService);
  private router = inject(Router);

  rows: BillingDocumentRow[] = [];
  loading = false;

  // Date-range filter (yyyy-MM-dd, bound to <input type="date">).
  fromDate = '';
  toDate = '';

  private gridApi?: GridApi;

  readonly theme = gridTheme;
  readonly defaultColDef: ColDef = { sortable: true, filter: true, resizable: true, flex: 1 };
  readonly columnDefs: ColDef[] = [
    {
      headerName: 'Status', field: 'BillStatus', maxWidth: 130, flex: 0,
      cellRenderer: (p: ICellRendererParams) => this.statusBadge(p.value),
    },
    { headerName: 'Bill #', field: 'Bill_ID', maxWidth: 100, flex: 0 },
    { headerName: 'Invoice No', field: 'InvoiceNo', maxWidth: 150 },
    { headerName: 'Invoice Date', field: 'InvoiceDate', maxWidth: 140, valueFormatter: this.dateFmt },
    { headerName: 'Vendor', field: 'VendorName' },
    { headerName: 'Item', field: 'ItemName' },
    { headerName: 'Qty', field: 'ItemQty', maxWidth: 100, flex: 0, valueFormatter: this.numFmt },
    { headerName: 'Taxable', field: 'TaxableAmt', maxWidth: 130, flex: 0, valueFormatter: this.numFmt },
    { headerName: 'GST', field: 'GSTAmt', maxWidth: 120, flex: 0, valueFormatter: this.numFmt },
    { headerName: 'Payable', field: 'TotalPayable', maxWidth: 140, flex: 0, valueFormatter: this.numFmt },
    { headerName: 'Payment', field: 'TotalPayment', maxWidth: 140, flex: 0, valueFormatter: this.numFmt },
    { headerName: 'Verify', field: 'ISVerify', maxWidth: 100, flex: 0, valueFormatter: this.yesNo },
    { headerName: 'Payment?', field: 'ISPayment', maxWidth: 110, flex: 0, valueFormatter: this.yesNo },
    { headerName: 'Confirm', field: 'ISConfirm', maxWidth: 110, flex: 0, valueFormatter: this.yesNo },
    { headerName: 'Entry Date', field: 'EntryDate', maxWidth: 140, valueFormatter: this.dateFmt },
  ];

  ngOnInit(): void {
    this.load();
  }

  onGridReady(e: GridReadyEvent): void {
    this.gridApi = e.api;
  }

  load(): void {
    this.loading = true;
    this.api.listBillingDocuments(this.fromDate || undefined, this.toDate || undefined).subscribe({
      next: (r) => { this.rows = r; this.loading = false; },
      error: (e) => { this.loading = false; this.notify.error(e?.error?.message ?? 'Failed to load billing documents.'); },
    });
  }

  refresh(): void {
    this.load();
  }

  /** Export the current grid rows to CSV. */
  exportCsv(): void {
    this.gridApi?.exportDataAsCsv({ fileName: 'billing-documents.csv' });
  }

  /** New -> open the Billing Document Entry page (opens as its own work tab). */
  newEntry(): void {
    this.router.navigateByUrl('/account/billing-document-entry');
  }

  /** Double-click a row -> open that bill in the entry page. */
  onRowOpen(e: RowDoubleClickedEvent<BillingDocumentRow>): void {
    if (e.data?.Bill_ID != null) this.open(e.data.Bill_ID);
  }

  /** Open the entry page for a specific bill. */
  open(billId: number): void {
    this.router.navigateByUrl(`/account/billing-document-entry/${billId}`);
  }

  // ---- Body summary counts ----
  get totalCount(): number { return this.rows.length; }
  get completeCount(): number { return this.rows.filter((r) => r.BillStatus === 'COMPLETE').length; }
  get verifyCount(): number { return this.rows.filter((r) => !!r.ISVerify).length; }
  get paymentCount(): number { return this.rows.filter((r) => !!r.ISPayment).length; }

  private statusBadge(value: string): string {
    const map: Record<string, string> = {
      COMPLETE: 'bg-success-subtle text-success',
      PENDING: 'bg-warning-subtle text-warning',
      INVALID: 'bg-danger-subtle text-danger',
    };
    const cls = map[value] ?? 'bg-secondary-subtle text-secondary';
    return `<span class="badge ${cls}">${value ?? ''}</span>`;
  }

  private dateFmt(p: ValueFormatterParams): string {
    return p.value ? new Date(p.value).toLocaleDateString() : '';
  }
  private numFmt(p: ValueFormatterParams): string {
    return p.value != null ? Number(p.value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '';
  }
  private yesNo(p: ValueFormatterParams): string {
    return p.value ? 'Yes' : 'No';
  }
}
