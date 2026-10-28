import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportsRoutingModule } from './reports-routing.module';
import { ReportsComponent } from './reports/reports.component';
import { TranslateModule } from '@ngx-translate/core';


@NgModule({
  declarations: [
    ReportsComponent
  ],
  imports: [
    CommonModule,
    TranslateModule,
    ReportsRoutingModule
  ]
})
export class ReportsModule { }
