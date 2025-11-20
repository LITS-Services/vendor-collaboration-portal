import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';

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

  getShipmentDetailById(id: number) {
    return this.http.get<any>(`${this.baseUrl}/shipment-detail-by-purchase-order?purchaseOrderId=${id}`);
  }

    deleteShipment(shipmentDetailId: number) {
    return this.http.post(`${this.baseUrl}/delete-shipment-detail?id=${shipmentDetailId}`, null);
  }
}