

import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { VendorPortalDashboardCountVM } from "app/dashboard/dashboard1/dashboard1.component";
import { environment } from "environments/environment";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class DashboardService {
  constructor(private http: HttpClient) {}

  getVendorPortalDashboardCount(
    userId: string
  ): Observable<VendorPortalDashboardCountVM> {
    return this.http.get<VendorPortalDashboardCountVM>(
      `${environment.apiUrl}/ProcurementDashboard/vendor-dashboard-counts?userId=${userId}`
    );
  }

  getPurchaseOrderAmountGraphData(vendorUserId: string, filterType: number) {
    return this.http.get<any[]>(
      `${environment.apiUrl}/ProcurementDashboard/purchase-order-amount-graph-data`,
      { params: { vendorUserId, filterType } }
    );
  }
}