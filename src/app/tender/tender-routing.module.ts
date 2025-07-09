import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TenderMasterComponent } from './tender-master/tender-master.component';
import { NewTenderComponent } from './new-tender/new-tender.component';
import { TenderListComponent } from './tender-list/tender-list.component';

const routes: Routes = [
  {
      path: '',
        children: [
           {
             path: 'tender-master',
             component: TenderMasterComponent,
             data: {
               title: 'Tender Master'
             }
           },
           {
             path: 'new-tender',
             component: NewTenderComponent,
             data: {
               title: 'New Tender'
             }
           },
           {
            path: 'tender-list',
            component: TenderListComponent,
            data: {
              title: 'Tender List'
            }
          },
         ]
    },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TenderRoutingModule { }
