import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CompanyRoutingModule } from './company-routing.module';
import { CompanyMasterComponent } from './company-master/company-master.component';
import { CompanyListComponent } from './company-list/company-list.component';
import { NewCompanyComponent } from './new-company/new-company.component';
import { NgbAccordionModule, NgbDatepickerModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
// Temporarily commented - not compatible with Angular Ivy:
// import { CustomFormsModule } from 'ngx-custom-validators';
import { MatchHeightModule } from 'app/shared/directives/match-height.directive';
// Temporarily commented - not compatible with Angular Ivy:
// import { UiSwitchModule } from 'ngx-ui-switch';
import { PipeModule } from 'app/shared/pipes/pipe.module';
import { QuillModule } from 'ngx-quill';
import { NgSelectModule } from '@ng-select/ng-select';
// Temporarily commented - not compatible with Angular Ivy:
// import { TagInputModule } from 'ngx-chips';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ToastrModule } from 'ngx-toastr';
import { NgxSpinnerModule } from 'ngx-spinner';
// Temporarily commented - not compatible with Angular Ivy:
// import { AngularResizedEventModule } from 'angular-resize-event';
import { NgApexchartsModule } from 'ng-apexcharts';
// Temporarily commented - not compatible with Angular Ivy:
// import { ChartistModule } from 'ng-chartist';


@NgModule({
  declarations: [
    CompanyMasterComponent,
    CompanyListComponent,
    NewCompanyComponent
  ],
  imports: [
    CommonModule,
    CompanyRoutingModule,
    NgbModule,
        ReactiveFormsModule,
        FormsModule,
        HttpClientModule,
        // CustomFormsModule, // Temporarily commented - not compatible with Angular Ivy
        MatchHeightModule,
        NgbModule,
        // UiSwitchModule, // Temporarily commented - not compatible with Angular Ivy
        PipeModule,
        QuillModule.forRoot(),
        NgSelectModule,
        // TagInputModule, // Temporarily commented - not compatible with Angular Ivy
        NgxDatatableModule,
        NgbAccordionModule,
        NgbDatepickerModule,
        ToastrModule.forRoot() ,
        NgxSpinnerModule,
        // AngularResizedEventModule, // Temporarily commented - not compatible with Angular Ivy
        NgApexchartsModule,
        // ChartistModule, // Temporarily commented - not compatible with Angular Ivy
        MatchHeightModule,
  ],
  schemas: [NO_ERRORS_SCHEMA] // Suppress errors from commented modules
})
export class CompanyModule { }
