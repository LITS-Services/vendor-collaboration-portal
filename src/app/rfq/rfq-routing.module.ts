import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RfqMasterComponent } from './rfq-master/rfq-master.component';
import { NewRfqComponent } from './new-rfq/new-rfq.component';
import { RfqListComponent } from './rfq-list/rfq-list.component';

const routes: Routes = [
  {
    path: '',
      children: [
         {
           path: 'rfq-master',
           component: RfqMasterComponent,
           data: {
             title: 'Request for Quotation'
           }
         },
         {
           path: 'new-rfq',
           component: NewRfqComponent,
           data: {
             title: 'Create RFQ'
           }
         },
         {
          path: 'rfq-list',
          component: RfqListComponent,
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
export class RfqRoutingModule { }
