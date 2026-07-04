import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ColDef, GridApi, GridReadyEvent, RowDoubleClickedEvent, ValueFormatterParams, ValueGetterParams } from 'ag-grid-community';
import { AccountService, BillingDocumentRow } from '../../core/services/account.service';
import { GeneralService, ComboItem } from '../../core/services/general.service';
import { NotificationService } from '../../core/services/notification.service';
import { gridTheme } from '../../developer/grid-shared';
import { PayRequestButtonComponent } from '../pay-request-button.component';

@Component({
  selector: 'app-billing-document-list',
  standalone: false,
  templateUrl: './billing-document-list.component.html',
  styleUrls: ['../../developer/developer-page.scss', './billing-document-list.component.scss'],
})
export class BillingDocumentListComponent implements OnInit {
  private api = inject(AccountService);
  private general = inject(GeneralService);
  private notify = inject(NotificationService);
  private router = inject(Router);

  /** Full result set (drives the summary counts). */
  private allRows: BillingDocumentRow[] = [];
  /** Rows shown in the grid (allRows filtered by the active status chip). */
  rows: BillingDocumentRow[] = [];
  /** Active ProcessStatus filter from the chips; null = show all (Total). */
  activeStatus: string | null = null;
  loading = false;

  // Date-range filter (yyyy-MM-dd, bound to <input type="date">).
  fromDate = '';
  toDate = '';

  // GEN_FillCombo id -> name maps for Division / Warehouse columns.
  private divisionMap = new Map<number, string>();
  private warehouseMap = new Map<number, string>();

  private gridApi?: GridApi;

  readonly theme = gridTheme;
  readonly context = { componentParent: this };
  /** Tint each row with the same colour as its ProcessStatus summary chip. */
  readonly rowClassRules: Record<string, (p: { data?: BillingDocumentRow }) => boolean> = {
    'row-complete': (p) => p.data?.ProcessStatus === 'COMPLETE',
    'row-confirm': (p) => p.data?.ProcessStatus === 'CONFIRM',
    'row-payment': (p) => p.data?.ProcessStatus === 'PAYMENT',
  };
  // Fixed widths per column (below); no flex. Header text wraps onto 2 lines.
  readonly defaultColDef: ColDef = { sortable: true, filter: true, resizable: true, wrapHeaderText: true };
  /** Header row height — taller so wrapped headers fit two lines. */
  readonly headerHeight = 50;
  readonly columnDefs: ColDef[] = [
    { headerName: 'Pay Request', pinned: 'left', width: 80, sortable: false, filter: false, resizable: false, cellRenderer: PayRequestButtonComponent },
    { headerName: 'Status', field: 'ProcessStatus', hide: true },
    { headerName: 'Bill #', field: 'BillingID', hide: true },
    { headerName: 'Company', field: 'CompanyID', hide: true },
    { headerName: 'Employee', field: 'EmployeeID', hide: true },
    { headerName: 'Division', field: 'DivisionID', width: 100, valueGetter: (p: ValueGetterParams) => this.divisionMap.get(p.data?.DivisionID) ?? p.data?.DivisionID ?? '' },
    { headerName: 'Warehouse', field: 'WarehouseID', width: 100, valueGetter: (p: ValueGetterParams) => this.warehouseMap.get(p.data?.WarehouseID) ?? p.data?.WarehouseID ?? '' },
    { headerName: 'Bill Type', field: 'BillingType', width: 100 },
    { headerName: 'Fin. Year', field: 'FinancialYear', width: 100 },
    { headerName: 'Billing No', field: 'BillingNo', width: 100 },
    { headerName: 'Billing Date', field: 'BillingDate', width: 100, valueFormatter: this.dateFmt },
    { headerName: 'Party', field: 'PartyID', hide: true },
    { headerName: 'Party Name', field: 'PartyName', width: 300 },
    { headerName: 'Reference No', field: 'ReferenceNo', width: 100 },
    { headerName: 'Reference Date', field: 'ReferenceDate', width: 100, valueFormatter: this.dateFmt },
    { headerName: 'Curr', field: 'CurrencyCode', width: 50 },
    { headerName: 'Rate', field: 'ExchangeRate', width: 50, valueFormatter: this.numFmt },
    { headerName: 'Days', field: 'TermsDays', width: 50 },
    { headerName: 'Due Date', field: 'DueDate', width: 100, valueFormatter: this.dateFmt },
    { headerName: 'Total Qty', field: 'TotalQty', width: 100, valueFormatter: this.numFmt },
    { headerName: 'Free Qty', field: 'TotalFreeQty', width: 100, valueFormatter: this.numFmt },
    { headerName: 'Gross Amt', field: 'GrossAmount', width: 100, valueFormatter: this.numFmt },
    { headerName: 'Disc %', field: 'DiscountPersent', width: 100, valueFormatter: this.numFmt },
    { headerName: 'Disc Amt', field: 'DiscountAmount', width: 100, valueFormatter: this.numFmt },
    { headerName: 'Taxable Amt', field: 'TaxableAmount', width: 100, valueFormatter: this.numFmt },
    { headerName: 'CGST Amt', field: 'CGSTAmount', width: 100, valueFormatter: this.numFmt },
    { headerName: 'SGST Amt', field: 'SGSTAmount', width: 100, valueFormatter: this.numFmt },
    { headerName: 'IGST Amt', field: 'IGSTAmount', width: 100, valueFormatter: this.numFmt },
    { headerName: 'CESS Amt', field: 'CESSAmount', width: 100, valueFormatter: this.numFmt },
    { headerName: 'Tax Amt', field: 'TaxAmount', width: 100, valueFormatter: this.numFmt },
    { headerName: 'Other Charge', field: 'OtherCharge', width: 100, valueFormatter: this.numFmt },
    { headerName: 'Freight Amt', field: 'FreightAmount', width: 100, valueFormatter: this.numFmt },
    { headerName: 'Packing Amt', field: 'PackingAmount', width: 100, valueFormatter: this.numFmt },
    { headerName: 'Net Amt', field: 'NetAmount', width: 100, valueFormatter: this.numFmt },
    { headerName: 'Round Off', field: 'RoundOff', width: 100, valueFormatter: this.numFmt },
    { headerName: 'Billing Amt', field: 'BillingAmount', width: 100, valueFormatter: this.numFmt },
    { headerName: 'Pay Term', field: 'PaymentTerm', width: 50 },
    { headerName: 'Pay Status', field: 'PaymentStatus', hide: true },
    { headerName: 'Billing Address', field: 'BillingAddress', hide: true },
    { headerName: 'Shipping Address', field: 'ShippingAddress', hide: true },
    { headerName: 'Narration', field: 'Narration', hide: true },
    { headerName: 'Remarks', field: 'Remarks', hide: true },
    { headerName: 'Confirm', field: 'ISConfirm', width: 50, valueFormatter: this.yesNo },
    { headerName: 'Approve', field: 'ISApprove', width: 50, valueFormatter: this.yesNo },
    { headerName: 'Payment', field: 'ISPayment', width: 50, valueFormatter: this.yesNo },
    { headerName: 'Cancel', field: 'ISCancel', width: 50, valueFormatter: this.yesNo },
    { headerName: 'Entry Date', field: 'EntryDate', width: 100, valueFormatter: this.dateFmt },
  ];

  ngOnInit(): void {
    this.loadCombos();
    this.load();
  }

  onGridReady(e: GridReadyEvent): void {
    this.gridApi = e.api;
  }

  /** Load Division/Warehouse combo values for the lookup columns. */
  private loadCombos(): void {
    this.general.getFillCombo('DIVISION').subscribe({
      next: (d) => { this.divisionMap = this.toMap(d); this.gridApi?.refreshCells({ force: true }); },
      error: () => { /* keep raw ids if combo unavailable */ },
    });
    this.general.getFillCombo('WAREHOUSE').subscribe({
      next: (w) => { this.warehouseMap = this.toMap(w); this.gridApi?.refreshCells({ force: true }); },
      error: () => { /* keep raw ids if combo unavailable */ },
    });
  }

  private toMap(items: ComboItem[]): Map<number, string> {
    const m = new Map<number, string>();
    (items ?? []).forEach((i) => m.set(i.id, i.name));
    return m;
  }

  load(): void {
    this.loading = true;
    this.api.listBillingDocuments(this.fromDate || undefined, this.toDate || undefined).subscribe({
      next: (r) => { this.allRows = r; this.applyFilter(); this.loading = false; },
      error: (e) => { this.loading = false; this.notify.error(e?.error?.message ?? 'Failed to load billing documents.'); },
    });
  }

  /** Filter the grid by a ProcessStatus (or null to clear, for the Total chip). */
  filterBy(status: string | null): void {
    this.activeStatus = status;
    this.applyFilter();
  }

  private applyFilter(): void {
    this.rows = this.activeStatus
      ? this.allRows.filter((r) => r.ProcessStatus === this.activeStatus)
      : this.allRows;
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
    if (e.data?.BillingID != null) this.open(e.data.BillingID);
  }

  /** Open the entry page for a specific bill. */
  open(billId: number): void {
    this.router.navigateByUrl(`/account/billing-document-entry/${billId}`);
  }

  /** PaymentRequest button — block if already confirmed, else go to the request entry page. */
  paymentRequest(row: BillingDocumentRow): void {
    if (row?.ISConfirm) {
      this.notify.warning('Already in request.');
      return;
    }
    this.router.navigateByUrl(`/account/payment-request-entry/${row.BillingID}`);
  }

  // ---- Body summary counts (by ProcessStatus field, over the full result set) ----
  get totalCount(): number { return this.allRows.length; }
  get completeCount(): number { return this.countByStatus('COMPLETE'); }
  get confirmCount(): number { return this.countByStatus('CONFIRM'); }
  get paymentCount(): number { return this.countByStatus('PAYMENT'); }

  private countByStatus(status: string): number {
    return this.allRows.filter((r) => r.ProcessStatus === status).length;
  }

  private dateFmt(p: ValueFormatterParams): string {
    if (!p.value) return '';
    const d = new Date(p.value);
    if (isNaN(d.getTime())) return '';
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }
  private numFmt(p: ValueFormatterParams): string {
    return p.value != null ? Number(p.value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '';
  }
  private yesNo(p: ValueFormatterParams): string {
    return p.value ? 'Yes' : 'No';
  }
}
