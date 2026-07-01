import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface VendorRow {
  VendorID: number;
  VendorCode: string;
  VendorName: string;
  VendorType: string | null;
  Category: string | null;
  BusinessType: string | null;
  ContactPerson: string | null;
  MobileNo1: string | null;
  MobileNo2: string | null;
  PhoneNo: string | null;
  EmailID: string | null;
  Website: string | null;
  Address: string | null;
  Area: string | null;
  City: string | null;
  District: string | null;
  State: string | null;
  Country: string | null;
  Pincode: string | null;
  Remark: string | null;
  GSTNo: string | null;
  PANNo: string | null;
  TANNo: string | null;
  CINNo: string | null;
  BankName: string | null;
  BranchName: string | null;
  AccountNo: string | null;
  IFSCCode: string | null;
  HolderName: string | null;
  UPIID: string | null;
  PaymentType: number | null;
  PaymentTerms: number | null;
  CreditLimit: number | null;
  CurrencyCode: string | null;
  LedgerCode: string | null;
  TDSApplicable: boolean;
  TCSApplicable: boolean;
  ISApprove: boolean;
  ISBlocked: boolean;
  ISActive: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class VendorService {
  private http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/vendors`;

  listVendors(): Observable<VendorRow[]> {
    return this.http.get<ApiResponse<VendorRow[]>>(this.api).pipe(map((r) => r.data));
  }
  createVendor(body: unknown) {
    return this.http.post<ApiResponse<unknown>>(this.api, body);
  }
  updateVendor(id: number, body: unknown) {
    return this.http.put<ApiResponse<unknown>>(`${this.api}/${id}`, body);
  }
  deleteVendor(id: number) {
    return this.http.delete<ApiResponse<unknown>>(`${this.api}/${id}`);
  }
}
