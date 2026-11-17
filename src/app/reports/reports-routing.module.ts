import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SalesReportComponent } from './sales-report/sales-report.component';
import { BidsWinLossComponent } from './bids-win-loss/bids-win-loss.component';
import { ReportsComponent } from './reports/reports.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'sales-report',
        component: SalesReportComponent,
        data: {
          title: 'Sales Report'
        }
      },
      {
        path: 'bids-win-loss-report',
        component: BidsWinLossComponent,
        data: {
          title: 'Bids Win/Loss Analysis'
        }
      },
      {
        path: 'reports-master',
        redirectTo: 'sales-report',
        pathMatch: 'full'
      },
      {
        path: '',
        redirectTo: 'sales-report',
        pathMatch: 'full'
      },
      {
        path: '**',
        redirectTo: 'sales-report'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportsRoutingModule { }
