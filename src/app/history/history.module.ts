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
// import { CustomFormsModule } from 'ngx-custom-validators'; // Not compatible with Angular Ivy
import { MatchHeightModule } from 'app/shared/directives/match-height.directive';
// import { UiSwitchModule } from 'ngx-ui-switch'; // Not compatible with Angular Ivy
import { PipeModule } from 'app/shared/pipes/pipe.module';
import { QuillModule } from 'ngx-quill';
import { NgSelectModule } from '@ng-select/ng-select';
// import { TagInputModule } from 'ngx-chips'; // Not compatible with Angular Ivy
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ToastrModule } from 'ngx-toastr';
import { NgxSpinnerModule } from 'ngx-spinner';
// import { AngularResizedEventModule } from 'angular-resize-event'; // Not compatible with Angular Ivy
import { NgApexchartsModule } from 'ng-apexcharts';
// import { ChartistModule } from 'ng-chartist'; // Not compatible with Angular Ivy


@NgModule({
  schemas: [NO_ERRORS_SCHEMA], // Allow Chartist and other incompatible components
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
    HistoryRoutingModule,
        NgbModule,
        ReactiveFormsModule,
        FormsModule,
        HttpClientModule,
        // CustomFormsModule, // Not compatible with Angular Ivy
        MatchHeightModule,
        NgbModule,
        // UiSwitchModule, // Not compatible with Angular Ivy
        PipeModule,
        QuillModule.forRoot(),
        NgSelectModule,
        // TagInputModule, // Not compatible with Angular Ivy
        NgxDatatableModule,
        NgbAccordionModule,
        NgbDatepickerModule,
        ToastrModule.forRoot() ,
        NgxSpinnerModule,
        // AngularResizedEventModule, // Not compatible with Angular Ivy
        NgApexchartsModule,
        // ChartistModule, // Not compatible with Angular Ivy
        MatchHeightModule,
  ]
})
export class HistoryModule { }
