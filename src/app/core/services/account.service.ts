import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

/** Row shape returned by ACC_BillingMaster_GetData (key columns used in the list). */
export interface BillingDocumentRow {
  BillStatus: string; // PENDING | COMPLETE | INVALID
  Bill_ID: number;
  Detail_ID: number;
  Location_ID: number | null;
  BillType: string | null;
  Vendor_ID: number | null;
  VendorName: string | null;
  InvoiceNo: string | null;
  InvoiceDate: string | null;
  ChallanNo: string | null;
  ChallanDate: string | null;
  Item_ID: number | null;
  ItemName: string | null;
  HSNCode: string | null;
  ItemQty: number | null;
  TaxableAmt: number | null;
  GSTAmt: number | null;
  NetAmt: number | null;
  TotalNetAmt: number | null;
  PayableAmt: number | null;
  TotalPayable: number | null;
  TotalPayment: number | null;
  ISVerify: boolean | number | null;
  ISPayment: boolean | number | null;
  ISConfirm: boolean | number | null;
  BillDueDate: string | null;
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
