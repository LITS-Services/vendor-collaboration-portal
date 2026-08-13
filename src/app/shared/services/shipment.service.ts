import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ShipmentService {
  private baseUrl = `${environment.apiUrl}/Shipment`;

  constructor(private http: HttpClient) { }

  createShipment(data: any) {
    return this.http.post(`${this.baseUrl}/create-shipment-detail`, data);
  }

  updateShipment(data: any) {
    return this.http.post(`${this.baseUrl}/update-shipment-detail`, data);
  }

  getShipmentDetailById(id: number, purchaseOrderId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/shipment-detail-by-id?id=${id}&purchaseOrderId=${purchaseOrderId}`);
  }

  getAllShipmentDetailByPurchaseOrder(purchaseOrderId: number, currentPage = 1, pageSize = 100): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/shipment-detail-all-by-purchase-order?purchaseOrderId=${purchaseOrderId}&currentPage=${currentPage}&pageSize=${pageSize}`
    );
  }

  deleteShipment(shipmentDetailId: number) {
    return this.http.post(`${this.baseUrl}/delete-shipment-detail?id=${shipmentDetailId}`, null);
  }

  getShipmentLinesByPoLineId(purchaseOrderLineId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/shipment-lines-by-po-line-id?purchaseOrderLineId=${purchaseOrderLineId}`);
  }

  saveShipmentLines(payload: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/save-shipment-lines`, payload);
  }
}