import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RfqRoutingModule } from './rfq-routing.module';
import { RfqMasterComponent } from './rfq-master/rfq-master.component';
import { NewRfqComponent } from './new-rfq/new-rfq.component';
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
import { RfqListComponent } from './rfq-list/rfq-list.component';
// import { AngularResizedEventModule } from 'angular-resize-event'; // Not compatible with Angular Ivy
import { NgApexchartsModule } from 'ng-apexcharts';
// import { ChartistModule } from 'ng-chartist'; // Not compatible with Angular Ivy
import { ChatModule } from 'app/chat/chat.module';
import { RfqBidAttachmentComponent } from './rfq-bid-attachment/rfq-bid-attachment.component';
import { QuotationBidModalComponent } from './quotation-bid-modal/quotation-bid-modal.component';
import { AutoResizeDatatableDirective } from 'app/shared/directives/table-auto-resize.directive';
import { DatatableAutoResizeDirective } from 'app/shared/directives/datatable-auto-resize.directive';


@NgModule({
  schemas: [NO_ERRORS_SCHEMA], // Allow Chartist and other incompatible components
  declarations: [
    RfqMasterComponent,
    NewRfqComponent,
    RfqListComponent,
    RfqBidAttachmentComponent,
    QuotationBidModalComponent
  ],
  imports: [
    CommonModule,
    RfqRoutingModule,
    NgbModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    // CustomFormsModule, // Not compatible with Angular Ivy
    MatchHeightModule,
    ChatModule,
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
    AutoResizeDatatableDirective,
    DatatableAutoResizeDirective
  ]
})
export class RfqModule { }
