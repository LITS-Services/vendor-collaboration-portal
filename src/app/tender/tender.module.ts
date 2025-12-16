import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TenderRoutingModule } from './tender-routing.module';
import { TenderMasterComponent } from './tender-master/tender-master.component';
import { NewTenderComponent } from './new-tender/new-tender.component';
import { TenderListComponent } from './tender-list/tender-list.component';
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
    TenderMasterComponent,
    NewTenderComponent,
    TenderListComponent
  ],
  imports: [
    CommonModule,
    TenderRoutingModule,
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
    ToastrModule.forRoot(),
    NgxSpinnerModule,
    // AngularResizedEventModule, // Not compatible with Angular Ivy
    NgApexchartsModule,
    // ChartistModule, // Not compatible with Angular Ivy
    MatchHeightModule,
  ]
})
export class TenderModule { }
