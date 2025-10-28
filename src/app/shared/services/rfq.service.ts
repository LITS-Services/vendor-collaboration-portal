import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { QuotationRequestsCountVM } from 'app/dashboard/dashboard1/dashboard1.component';
import { QuotationRequest } from 'app/models/quotation-request.model';
import { BidSubmissionDetails } from 'app/models/bid-submission.model';
import { QuotationRequestWithDetailsResponse } from 'app/models/quotation-request-with-details.model';

@Injectable({ providedIn: 'root' })
export class RfqService {
  private baseUrl = `${environment.apiUrl}/Quotation`;

  constructor(private http: HttpClient) { }

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

  // today's work - 25 oct
  getQuotationsByVendor(vendorUserId: string, status: string | null): Observable<QuotationRequest[]> {
    let params = new HttpParams().set('vendorUserId', vendorUserId);
    if (status) params = params.set('status', status);

    return this.http.get<QuotationRequest[]>(`${this.baseUrl}/by-vendor`, { params });
  }

  submitBids(bids: BidSubmissionDetails[]): Observable<any> {
    return this.http.post(`${environment.apiUrl}/Quotation/submit-bid`, { bids });
  }

  updateBids(bids: BidSubmissionDetails[]) {
    return this.http.put(`${environment.apiUrl}/Quotation/update-bid`, { bids });
  }


  getRfqById(rfqId: number): Observable<QuotationRequestWithDetailsResponse> {
    const params = new HttpParams().set('id', rfqId);
    return this.http.get<QuotationRequestWithDetailsResponse>(
      `${environment.apiUrl}/Quotation/get-quotation-by-id`, // <-- added Quotation
      { params }
    );
  }
}
