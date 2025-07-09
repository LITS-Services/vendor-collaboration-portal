import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PurchaseOrderMasterComponent } from './purchase-order-master/purchase-order-master.component';
import { NewPurchaseOrderComponent } from './new-purchase-order/new-purchase-order.component';
import { PurchaseOrderListComponent } from './purchase-order-list/purchase-order-list.component';

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
              title: 'RFQ List'
            }
          },
         ]
    },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PurchaseOrderRoutingModule { }
