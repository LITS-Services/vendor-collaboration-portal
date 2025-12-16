import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PurchaseOrderRoutingModule } from './purchase-order-routing.module';
import { PurchaseOrderMasterComponent } from './purchase-order-master/purchase-order-master.component';
import { NewPurchaseOrderComponent } from './new-purchase-order/new-purchase-order.component';
import { PurchaseOrderListComponent } from './purchase-order-list/purchase-order-list.component';
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
import { PurchaseOrderDetailsComponent } from './purchase-order-details/purchase-order-details.component';
import { GoogleMapsModule } from "@angular/google-maps";
import { ShipmentDetailsComponent } from './purchase-order-details/shipment-details/shipment-details.component';
import { GrnDetailsComponent } from './purchase-order-details/grn-details/grn-details.component';
import { InvoiceComponent } from './purchase-order-details/invoice/invoice.component';


@NgModule({
  schemas: [NO_ERRORS_SCHEMA], // Allow Chartist and other incompatible components
  declarations: [
    PurchaseOrderMasterComponent,
    NewPurchaseOrderComponent,
    PurchaseOrderListComponent,
    PurchaseOrderDetailsComponent,
    ShipmentDetailsComponent,
    GrnDetailsComponent,
    InvoiceComponent
  ],
  imports: [
    CommonModule,
    PurchaseOrderRoutingModule,
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
    GoogleMapsModule
  ]
})
export class PurchaseOrderModule { }