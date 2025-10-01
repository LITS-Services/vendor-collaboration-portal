// src/app/services/rfq.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';

@Injectable({ providedIn: 'root' })
export class RfqService {
  private baseUrl = `${environment.apiUrl}/Quotation`;

  constructor(private http: HttpClient) { }

  getQuotationByVendor(vendorUserId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/by-vendor`, {
      params: new HttpParams().set('vendorUserId', vendorUserId)
    });
  }

  submitBids(bids: any[]): Observable<any> {
    return this.http.post(`${environment.apiUrl}/Quotation/submit-bid`, bids);
  }
}
