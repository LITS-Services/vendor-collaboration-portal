import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PurchaseOrdersCountVM } from 'app/dashboard/dashboard1/dashboard1.component';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

export interface InvoiceQuery {
  currentPage: number,
  pageSize: number,
  vendorId: string | null,
  status?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class PurchaseOrderService {
  private baseUrl = `${environment.apiUrl}/PurchaseOrder`;
  constructor(private http: HttpClient) { }

  getPurchaseOrderById(id: number) {
    return this.http.get<any>(`${this.baseUrl}/get-purchase-order-by-id?id=${id}`);
  }

  getPurchaseOrdersCount(userId: string): Observable<PurchaseOrdersCountVM> {
    return this.http.get<PurchaseOrdersCountVM>(`${environment.apiUrl}/ProcurementDashboard/purchase-orders-count-for-vendor-portal?userId=${userId}`);
  }

  getPurchaseOrdersByVendorAndStatus(vendorUserId: string, status: string, forPending?: boolean): Observable<any> {
    const params = new HttpParams()
      .set('vendorUserId', vendorUserId)
      .set('status', status)
      .set('forPending', forPending);
    return this.http.get<any>(`${this.baseUrl}/get-purchase-orders-by-vendor`, { params });
  }

  rejectPurchaseOrder(purchaseOrderId: number) {
    const payload = {
      purchaseOrderId: purchaseOrderId
    };
    return this.http.post<any>(`${this.baseUrl}/reject-purchase-order`, payload);
  }

  getGoodsReceiptNoteById(purchaseOrderId: number) {
    return this.http.get<any>(`${this.baseUrl}/get-grn?id=${purchaseOrderId}`);
  }

  requestForPayment(purchaseOrderId: number) {
    return this.http.post<any>(`${this.baseUrl}/request-for-payment`, { purchaseOrderId: purchaseOrderId });
  }

  getAllGoodsReceiptNotes(purchaseOrderId: number, currentPage = 1, pageSize = 100): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/get-all-grn?purchaseOrderId=${purchaseOrderId}&currentPage=${currentPage}&pageSize=${pageSize}`
    );
  }

  createInvoice(payload: any): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/create-invoice`,
      payload
    );
  }

  getInvoiceByPoId(purchaseOrderId: number) {
    return this.http.get<any>(`${this.baseUrl}/get-invoice-by-id?purchaseOrderId=${purchaseOrderId}`);
  }

  downloadInvoicePdf(invoiceId: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/download-pdf/${invoiceId}`, { responseType: 'blob' });
  }

  getAllInvoices(q: InvoiceQuery): Observable<any> {
    let params = new HttpParams()
      .set("currentPage", q.currentPage)
      .set("pageSize", q.pageSize);

    if (q.vendorId) params = params.set("vendorId", q.vendorId);
    if (q.status) params = params.set("status", q.status);

    return this.http.get<any>(`${this.baseUrl}/get-all-invoices`, { params });
  }

  getAllPoInvoices(purchaseOrderId: number, currentPage:number = 1, pageSize:number = 200): Observable<any> {
   let params = new HttpParams()
   .set("poId", purchaseOrderId)
   .set("currentPage", currentPage)
   .set("pageSize", pageSize);

   return this.http.get<any>(`${this.baseUrl}/get-all-invoices-by-ponumber`, { params });
  }
}