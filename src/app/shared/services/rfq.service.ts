// src/app/services/rfq.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { QuotationRequestsCountVM } from 'app/dashboard/dashboard1/dashboard1.component';

@Injectable({ providedIn: 'root' })
export class RfqService {
  private baseUrl = `${environment.apiUrl}/Quotation`;

  constructor(private http: HttpClient) { }

  // getQuotationByVendor(vendorUserId: string): Observable<any> {
  //   return this.http.get<any>(`${this.baseUrl}/by-vendor`, {
  //     params: new HttpParams().set('vendorUserId', vendorUserId)
  //   });
  // }

  getQuotationsByVendor(vendorUserId: string, status: string | null): Observable<any> {
    let params = new HttpParams().set('vendorUserId', vendorUserId);
    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<any>(`${this.baseUrl}/by-vendor`, { params });
  }

  submitBids(bids: any[]): Observable<any> {
    return this.http.post(`${environment.apiUrl}/Quotation/submit-bid`, bids);
  }

  getQuotationRequestsCount(): Observable<QuotationRequestsCountVM> {
    return this.http.get<QuotationRequestsCountVM>(`${this.baseUrl}/quotation-requests-count`);
  }

  getAllQuotationsByStatus(userId: string, status: string, isVendorPortal: boolean = true): Observable<any> {
    const params = new HttpParams()
      .set('userId', userId)
      .set('status', status)
      .set('isVendorPortal', isVendorPortal.toString());

    return this.http.get<any>(`${this.baseUrl}/get-quotations-by-status`, { params });
  }
}
