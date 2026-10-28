import { TranslateModule } from '@ngx-translate/core';
import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from "@angular/common";
import { PipeModule } from "../shared/pipes/pipe.module";

import { DashboardRoutingModule } from "./dashboard-routing.module";
import { NgApexchartsModule } from 'ng-apexcharts';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MatchHeightModule } from "../shared/directives/match-height.directive";

import { Dashboard1Component } from "./dashboard1/dashboard1.component";
import { Dashboard2Component } from "./dashboard2/dashboard2.component";


@NgModule({
    schemas: [NO_ERRORS_SCHEMA],
    imports: [
        TranslateModule,
        PipeModule,
        CommonModule,
        DashboardRoutingModule,
        NgbModule,
        MatchHeightModule,
        NgApexchartsModule
    ],
    exports: [],
    declarations: [
        Dashboard1Component,
        Dashboard2Component
    ],
    providers: [],
})
export class DashboardModule { }
