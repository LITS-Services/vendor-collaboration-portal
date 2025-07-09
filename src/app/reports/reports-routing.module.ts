import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReportsComponent } from './reports/reports.component';

const routes: Routes = [
   {
        path: '',
          children: [
             {
               path: 'reports-master',
               component: ReportsComponent,
               data: {
                 title: 'Tender Master'
               }
             },
           ]
      },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportsRoutingModule { }
