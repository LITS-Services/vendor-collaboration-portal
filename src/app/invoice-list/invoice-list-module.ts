import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InvoiceListRoutingModule } from './invoice-list-routing-module';
import { InvoiceList } from './invoice-list/invoice-list';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgbAccordionModule, NgbDatepickerModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AutoResizeDatatableDirective } from 'app/shared/directives/table-auto-resize.directive';
import { DatatableAutoResizeDirective } from 'app/shared/directives/datatable-auto-resize.directive';
import { FormsModule } from '@angular/forms';


@NgModule({
  schemas: [NO_ERRORS_SCHEMA],
  declarations: [InvoiceList],
  imports: [
    CommonModule,
    InvoiceListRoutingModule,
    NgxDatatableModule,
    NgbAccordionModule,
    NgbDatepickerModule,
    AutoResizeDatatableDirective,
    DatatableAutoResizeDirective,
    FormsModule,
    NgbModule
  ]
})
export class InvoiceListModule { }
