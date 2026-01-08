import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InvoiceList } from './invoice-list/invoice-list';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'invoice-list',
        component: InvoiceList,
        data: { title: 'Invoices' }
      },
      {
        path: '',
        redirectTo: 'invoice-list',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'invoice-list'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InvoiceListRoutingModule { }