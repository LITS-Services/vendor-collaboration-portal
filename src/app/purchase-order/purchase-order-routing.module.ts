import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PurchaseOrderMasterComponent } from './purchase-order-master/purchase-order-master.component';
import { NewPurchaseOrderComponent } from './new-purchase-order/new-purchase-order.component';
import { PurchaseOrderListComponent } from './purchase-order-list/purchase-order-list.component';
import { PurchaseOrderDetailsComponent } from './purchase-order-details/purchase-order-details.component';
import { ShipmentDetailsComponent } from './purchase-order-details/shipment-details/shipment-details.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'purchase-order-master',
        component: PurchaseOrderMasterComponent,
        data: {
          title: 'Request for Quotation'
        }
      },
      {
        path: 'new-purchase-order',
        component: NewPurchaseOrderComponent,
        data: {
          title: 'Create RFQ'
        }
      },
      {
        path: 'purchase-order-list',
        component: PurchaseOrderListComponent,
        data: {
          title: 'Purchase Order List'
        }
      },
      {
        path: 'purchase-order-details/:id',
        component: PurchaseOrderDetailsComponent
      },
      // {
      //   path: 'purchase-order-details/:id/shipment',
      //   component: ShipmentDetailsComponent
      // }

      {
        path: "",
        redirectTo: "purchase-order-master",
        pathMatch: "full",
      },
      {
        path: "**",
        redirectTo: "purchase-order-master",
      },


    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PurchaseOrderRoutingModule { }
