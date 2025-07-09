import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PurchaseOrderRoutingModule } from './purchase-order-routing.module';
import { PurchaseOrderMasterComponent } from './purchase-order-master/purchase-order-master.component';
import { NewPurchaseOrderComponent } from './new-purchase-order/new-purchase-order.component';
import { PurchaseOrderListComponent } from './purchase-order-list/purchase-order-list.component';
import { NgbAccordionModule, NgbDatepickerModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CustomFormsModule } from 'ngx-custom-validators';
import { MatchHeightModule } from 'app/shared/directives/match-height.directive';
import { UiSwitchModule } from 'ngx-ui-switch';
import { PipeModule } from 'app/shared/pipes/pipe.module';
import { QuillModule } from 'ngx-quill';
import { NgSelectModule } from '@ng-select/ng-select';
import { TagInputModule } from 'ngx-chips';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ToastrModule } from 'ngx-toastr';
import { NgxSpinnerModule } from 'ngx-spinner';
import { AngularResizedEventModule } from 'angular-resize-event';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ChartistModule } from 'ng-chartist';


@NgModule({
  declarations: [
    PurchaseOrderMasterComponent,
    NewPurchaseOrderComponent,
    PurchaseOrderListComponent
  ],
  imports: [
    CommonModule,
    PurchaseOrderRoutingModule,
     NgbModule,
        ReactiveFormsModule,
        FormsModule,
        HttpClientModule,
        CustomFormsModule,
        MatchHeightModule,
        NgbModule,
        UiSwitchModule,
        PipeModule,
        QuillModule.forRoot(),
        NgSelectModule,
        TagInputModule,
        NgxDatatableModule,
        NgbAccordionModule,
        NgbDatepickerModule,
        ToastrModule.forRoot() ,
        NgxSpinnerModule,
        AngularResizedEventModule,
        NgApexchartsModule,
        ChartistModule,MatchHeightModule,
  ]
})
export class PurchaseOrderModule { }
