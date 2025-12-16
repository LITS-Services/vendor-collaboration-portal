import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from "@angular/common";

import { DashboardRoutingModule } from "./dashboard-routing.module";
// import { ChartistModule } from 'ng-chartist'; // Not compatible with Angular Ivy
import { NgApexchartsModule } from 'ng-apexcharts';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
// import { AngularResizedEventModule } from 'angular-resize-event'; // Not compatible with Angular Ivy
import { MatchHeightModule } from "../shared/directives/match-height.directive";

import { Dashboard1Component } from "./dashboard1/dashboard1.component";
import { Dashboard2Component } from "./dashboard2/dashboard2.component";


@NgModule({
    schemas: [NO_ERRORS_SCHEMA], // Allow incompatible modules
    imports: [
        CommonModule,
        DashboardRoutingModule,
        // ChartistModule, // Not compatible with Angular Ivy
        NgbModule,
        MatchHeightModule,
        NgApexchartsModule,
        // AngularResizedEventModule // Not compatible with Angular Ivy
    ],
    exports: [],
    declarations: [
        Dashboard1Component,
        Dashboard2Component
    ],
    providers: [],
})
export class DashboardModule { }
