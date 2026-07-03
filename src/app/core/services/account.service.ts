import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

/** Row shape returned by ACC_BillingMaster_GetData (header-level billing columns). */
export interface BillingDocumentRow {
  ProcessStatus: string; // CONFIRM | PAYMENT | COMPLETE | INVALID
  BillingID: number;
  CompanyID: number | null;
  EmployeeID: number | null;
  DivisionID: number | null;
  WarehouseID: number | null;
  BillingType: string | null;
  FinancialYear: string | null;
  BillingNo: string | null;
  BillingDate: string | null;
  PartyID: number | null;
  PartyName: string | null;
  ReferenceNo: string | null;
  ReferenceDate: string | null;
  CurrencyCode: string | null;
  ExchangeRate: number | null;
  TermsDays: number | null;
  DueDate: string | null;
  TotalQty: number | null;
  TotalFreeQty: number | null;
  GrossAmount: number | null;
  DiscountPersent: number | null;
  DiscountAmount: number | null;
  TaxableAmount: number | null;
  CGSTAmount: number | null;
  SGSTAmount: number | null;
  IGSTAmount: number | null;
  CESSAmount: number | null;
  TaxAmount: number | null;
  OtherCharge: number | null;
  FreightAmount: number | null;
  PackingAmount: number | null;
  NetAmount: number | null;
  RoundOff: number | null;
  PaymentAmount: number | null;
  PaymentTerm: string | null;
  PaymentStatus: string | null;
  BillingAddress: string | null;
  ShippingAddress: string | null;
  Narration: string | null;
  Remarks: string | null;
  ISConfirm: boolean | number | null;
  ISApprove: boolean | number | null;
  ISPayment: boolean | number | null;
  ISCancel: boolean | number | null;
  EntryDate: string | null;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class AccountService {
  private http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/account`;

  /** Billing Document list, optionally filtered by an EntryDate range (yyyy-MM-dd). */
  listBillingDocuments(fromDate?: string, toDate?: string): Observable<BillingDocumentRow[]> {
    let params = new HttpParams();
    if (fromDate) params = params.set('fromDate', fromDate);
    if (toDate) params = params.set('toDate', toDate);
    return this.http
      .get<ApiResponse<BillingDocumentRow[]>>(`${this.api}/billing-documents`, { params })
      .pipe(map((r) => r.data));
  }
}
