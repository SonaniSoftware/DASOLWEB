import { Component, OnInit, inject } from '@angular/core';
import { ColDef, ICellRendererParams } from 'ag-grid-community';
import { VendorService, VendorRow } from '../../core/services/vendor.service';
import { NotificationService } from '../../core/services/notification.service';
import { GridActionsComponent } from '../../developer/grid-actions.component';
import { statusBadge, gridTheme } from '../../developer/grid-shared';

/** Blank vendor form model (camelCase mirror of PRH_VendorMaster). */
function blankVendor() {
  return {
    vendorCode: '', vendorName: '', vendorType: '', category: '', businessType: '',
    contactPerson: '', mobileNo1: '', mobileNo2: '', phoneNo: '', emailId: '', website: '',
    address: '', area: '', city: '', district: '', state: '', country: '', pincode: '', remark: '',
    gstNo: '', panNo: '', tanNo: '', cinNo: '',
    bankName: '', branchName: '', accountNo: '', ifscCode: '', holderName: '', upiId: '',
    paymentType: null as number | null, paymentTerms: null as number | null,
    creditLimit: null as number | null, currencyCode: 'INR', ledgerCode: '',
    tdsApplicable: false, tcsApplicable: false, isApprove: false, isBlocked: false, isActive: true,
  };
}

type VendorModel = ReturnType<typeof blankVendor>;
type VendorTab = 'general' | 'verify' | 'account';

@Component({
  selector: 'app-vendor-master',
  standalone: false,
  templateUrl: './vendor-master.component.html',
  styleUrls: ['../../developer/developer-page.scss', './vendor-master.component.scss'],
})
export class VendorMasterComponent implements OnInit {
  private api = inject(VendorService);
  private notify = inject(NotificationService);

  rows: VendorRow[] = [];
  loading = false;
  showForm = false;
  editId: number | null = null;
  activeTab: VendorTab = 'general';
  model: VendorModel = blankVendor();

  // AG Grid
  readonly theme = gridTheme;
  readonly context = { componentParent: this };
  readonly defaultColDef: ColDef = { sortable: true, filter: true, resizable: true, flex: 1 };
  readonly columnDefs: ColDef[] = [
    { headerName: '#', field: 'VendorID', maxWidth: 90, flex: 0 },
    { headerName: 'Code', field: 'VendorCode', maxWidth: 140 },
    { headerName: 'Name', field: 'VendorName' },
    { headerName: 'Type', field: 'VendorType', maxWidth: 140 },
    { headerName: 'City', field: 'City', maxWidth: 140 },
    { headerName: 'Mobile', field: 'MobileNo1', maxWidth: 150 },
    { headerName: 'GST No', field: 'GSTNo', maxWidth: 170 },
    {
      headerName: 'Approval', field: 'ISApprove', maxWidth: 130,
      cellRenderer: (p: ICellRendererParams) =>
        p.value
          ? '<span class="badge bg-success-subtle text-success">Approved</span>'
          : '<span class="badge bg-warning-subtle text-warning">Pending</span>',
    },
    { headerName: 'Status', field: 'ISActive', maxWidth: 130, cellRenderer: (p: ICellRendererParams) => statusBadge(p.value) },
    { headerName: 'Actions', cellRenderer: GridActionsComponent, sortable: false, filter: false, maxWidth: 130, flex: 0 },
  ];

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.api.listVendors().subscribe({
      next: (r) => { this.rows = r; this.loading = false; },
      error: () => (this.loading = false),
    });
  }

  add(): void {
    this.editId = null;
    this.model = blankVendor();
    this.activeTab = 'general';
    this.showForm = true;
  }

  edit(row: VendorRow): void {
    this.editId = row.VendorID;
    this.activeTab = 'general';
    this.model = {
      vendorCode: row.VendorCode, vendorName: row.VendorName, vendorType: row.VendorType ?? '',
      category: row.Category ?? '', businessType: row.BusinessType ?? '', contactPerson: row.ContactPerson ?? '',
      mobileNo1: row.MobileNo1 ?? '', mobileNo2: row.MobileNo2 ?? '', phoneNo: row.PhoneNo ?? '',
      emailId: row.EmailID ?? '', website: row.Website ?? '', address: row.Address ?? '', area: row.Area ?? '',
      city: row.City ?? '', district: row.District ?? '', state: row.State ?? '', country: row.Country ?? '',
      pincode: row.Pincode ?? '', remark: row.Remark ?? '',
      gstNo: row.GSTNo ?? '', panNo: row.PANNo ?? '', tanNo: row.TANNo ?? '', cinNo: row.CINNo ?? '',
      bankName: row.BankName ?? '', branchName: row.BranchName ?? '', accountNo: row.AccountNo ?? '',
      ifscCode: row.IFSCCode ?? '', holderName: row.HolderName ?? '', upiId: row.UPIID ?? '',
      paymentType: row.PaymentType, paymentTerms: row.PaymentTerms, creditLimit: row.CreditLimit,
      currencyCode: row.CurrencyCode ?? 'INR', ledgerCode: row.LedgerCode ?? '',
      tdsApplicable: !!row.TDSApplicable, tcsApplicable: !!row.TCSApplicable,
      isApprove: !!row.ISApprove, isBlocked: !!row.ISBlocked, isActive: !!row.ISActive,
    };
    this.showForm = true;
  }

  save(): void {
    if (!this.model.vendorCode || !this.model.vendorName) {
      this.notify.warning('Vendor code and name are required.');
      this.activeTab = 'general';
      return;
    }
    const req = this.editId
      ? this.api.updateVendor(this.editId, this.model)
      : this.api.createVendor(this.model);
    req.subscribe({
      next: () => { this.notify.success('Saved.'); this.showForm = false; this.load(); },
      error: (e) => this.notify.error(e?.error?.message ?? 'Save failed.'),
    });
  }

  remove(row: VendorRow): void {
    if (!confirm(`Delete vendor "${row.VendorName}"?`)) return;
    this.api.deleteVendor(row.VendorID).subscribe({
      next: () => { this.notify.success('Deleted.'); this.load(); },
      error: (e) => this.notify.error(e?.error?.message ?? 'Delete failed.'),
    });
  }
}
