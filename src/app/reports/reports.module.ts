import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgApexchartsModule } from 'ng-apexcharts';

import { ReportsRoutingModule } from './reports-routing.module';
import { ReportsComponent } from './reports/reports.component';
import { SalesReportComponent } from './sales-report/sales-report.component';
import { BidsWinLossComponent } from './bids-win-loss/bids-win-loss.component';
import { CustomSelectDirective } from 'app/shared/directives/custom-select.directive';

@NgModule({
  schemas: [NO_ERRORS_SCHEMA],
  declarations: [
    ReportsComponent,
    SalesReportComponent,
    BidsWinLossComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    NgApexchartsModule,
    ReportsRoutingModule,
    CustomSelectDirective
  ]
})
export class ReportsModule { }
