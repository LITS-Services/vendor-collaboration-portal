import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HistoryMasterComponent } from './history-master/history-master.component';
import { PrRequestListComponent } from './pr-request-list/pr-request-list.component';
import { RfqRequestListComponent } from './rfq-request-list/rfq-request-list.component';
import { PoDetailsListComponent } from './po-details-list/po-details-list.component';
import { RecievingDetailsListComponent } from './recieving-details-list/recieving-details-list.component';
import { InvoiceDetailsListComponent } from './invoice-details-list/invoice-details-list.component';
import { PaymentDetailsListComponent } from './payment-details-list/payment-details-list.component';

const routes: Routes = [
  {
    path: "",
    children: [
      {
        path: "history-master",
        component: HistoryMasterComponent,
        data: {
          title: "History Master",
        },
      },
      {
        path: "PR-Request",
        component: PrRequestListComponent,
        data: {
          title: "PR-Request",
        },
      },
      {
        path: "RFQ-Request",
        component: RfqRequestListComponent,
        data: {
          title: "RFQ-Request",
        },
      },
      {
        path: "PO-Details",
        component: PoDetailsListComponent,
        data: {
          title: "PO-Details",
        },
      },
      {
        path: "Recieving-Details",
        component: RecievingDetailsListComponent,
        data: {
          title: "Recieving-Details",
        },
      },
      {
        path: "Invoice-Details",
        component: InvoiceDetailsListComponent,
        data: {
          title: "Invoice-Details",
        },
      },
      {
        path: "Payment-Details",
        component: PaymentDetailsListComponent,
        data: {
          title: "Payment-Details",
        },
      },

      {
        path: "",
        redirectTo: "history-master",
        pathMatch: "full",
      },
      {
        path: "**",
        redirectTo: "history-master",
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HistoryRoutingModule { }
