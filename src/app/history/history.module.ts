import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HistoryRoutingModule } from './history-routing.module';
import { HistoryMasterComponent } from './history-master/history-master.component';
import { PrRequestListComponent } from './pr-request-list/pr-request-list.component';
import { RfqRequestListComponent } from './rfq-request-list/rfq-request-list.component';
import { PoDetailsListComponent } from './po-details-list/po-details-list.component';
import { RecievingDetailsListComponent } from './recieving-details-list/recieving-details-list.component';
import { InvoiceDetailsListComponent } from './invoice-details-list/invoice-details-list.component';
import { PaymentDetailsListComponent } from './payment-details-list/payment-details-list.component';
import { NgbAccordionModule, NgbDatepickerModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MatchHeightModule } from 'app/shared/directives/match-height.directive';
import { PipeModule } from 'app/shared/pipes/pipe.module';
import { QuillModule } from 'ngx-quill';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ToastrModule } from 'ngx-toastr';
import { NgxSpinnerModule } from 'ngx-spinner';
import { NgApexchartsModule } from 'ng-apexcharts';
import { TranslateModule } from '@ngx-translate/core';


@NgModule({
  schemas: [NO_ERRORS_SCHEMA],
  declarations: [
    HistoryMasterComponent,
    PrRequestListComponent,
    RfqRequestListComponent,
    PoDetailsListComponent,
    RecievingDetailsListComponent,
    InvoiceDetailsListComponent,
    PaymentDetailsListComponent
  ],
  imports: [
    CommonModule,
    TranslateModule,
    HistoryRoutingModule,
    NgbModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    MatchHeightModule,
    PipeModule,
    QuillModule.forRoot(),
    NgSelectModule,
    NgxDatatableModule,
    NgbAccordionModule,
    NgbDatepickerModule,
    ToastrModule.forRoot(),
    NgxSpinnerModule,
    NgApexchartsModule
  ]
})
export class HistoryModule { }
