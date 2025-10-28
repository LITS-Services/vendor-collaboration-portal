// import { NgModule } from '@angular/core';
// import { RouterModule, Routes } from '@angular/router';
// import { RfqMasterComponent } from './rfq-master/rfq-master.component';
// import { NewRfqComponent } from './new-rfq/new-rfq.component';
// import { RfqListComponent } from './rfq-list/rfq-list.component';

// const routes: Routes = [
//   {
//     path: '',
//       children: [
//          {
//            path: 'rfq-master',
//            component: RfqMasterComponent,
//            data: {
//              title: 'Request for Quotation'
//            }
//          },
//          {
//            path: 'new-rfq',
//            component: NewRfqComponent,
//            data: {
//              title: 'Create RFQ'
//            }
//          },
//          {
//           path: 'rfq-list',
//           component: RfqListComponent,
//           data: {
//             title: 'RFQ List'
//           }
//         },
//        ]
//   },
// ];

// @NgModule({
//   imports: [RouterModule.forChild(routes)],
//   exports: [RouterModule]
// })
// export class RfqRoutingModule { }

// today's work - 25 oct
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RfqMasterComponent } from './rfq-master/rfq-master.component';
import { NewRfqComponent } from './new-rfq/new-rfq.component';
import { RfqListComponent } from './rfq-list/rfq-list.component';
import { QuotationBidModalComponent } from './quotation-bid-modal/quotation-bid-modal.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'rfq-master',
        component: RfqMasterComponent,
        data: { title: 'Request for Quotation' }
      },
      {
        path: 'new-rfq',
        component: NewRfqComponent,
        data: { title: 'Create RFQ' }
      },
      {
        path: 'rfq-list',
        component: RfqListComponent,
        data: { title: 'RFQ List' }
      },
      // {
      //   path: 'vendor-rfq-list',
      //   component: VendorRfqListComponent,
      //   data: { title: 'Vendor RFQ List' } // Lists RFQs assigned to logged-in vendor
      // },
      {
        path: 'submit-bid/:rfqId',
        component: QuotationBidModalComponent,
        data: { title: 'Submit Bid' }
      },
      {
        path: '',
        redirectTo: 'rfq-list',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'rfq-list'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RfqRoutingModule { }
