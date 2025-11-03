import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PurchaseOrderService {
  private baseUrl = `${environment.apiUrl}/PurchaseOrder`;
  constructor(private http: HttpClient) { }

  getPurchaseOrdersByVendor(vendorUserId: string): Observable<any> {
    const params = new HttpParams().set('vendorUserId', vendorUserId);
    return this.http.get<any>(`${this.baseUrl}/get-purchase-orders-by-vendor`, { params });
  }

  getPurchaseOrderById(id: number) {
    return this.http.get<any>(`${this.baseUrl}/get-purchase-order-by-id?id=${id}`);
  }
}