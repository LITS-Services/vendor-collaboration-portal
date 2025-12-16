import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from "@angular/common";

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { QuillModule } from 'ngx-quill'
// import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar'; // Not compatible with Angular Ivy
import { FormsModule } from '@angular/forms';

import { InboxRoutingModule } from "./inbox-routing.module";
import { PipeModule } from 'app/shared/pipes/pipe.module';

import { InboxComponent } from "./inbox.component";


@NgModule({
    schemas: [NO_ERRORS_SCHEMA], // Allow PerfectScrollbar
    imports: [
        CommonModule,
        InboxRoutingModule,
        NgbModule,
        QuillModule.forRoot(),
        FormsModule,
        // PerfectScrollbarModule, // Not compatible with Angular Ivy
        PipeModule
    ],
    declarations: [
        InboxComponent
    ]
})
export class InboxModule { }
