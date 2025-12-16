import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from "@angular/common";
import { FormsModule } from '@angular/forms';

// import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar'; // Not compatible with Angular Ivy
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { ChatRoutingModule } from "./chat-routing.module";
import { PipeModule } from 'app/shared/pipes/pipe.module';

import { ChatComponent } from "./chat.component";


@NgModule({
    schemas: [NO_ERRORS_SCHEMA], // Allow PerfectScrollbar
    imports: [
        CommonModule,
        ChatRoutingModule,
        NgbModule,
        FormsModule,
        // PerfectScrollbarModule, // Not compatible with Angular Ivy
        PipeModule
    ],
    declarations: [
        ChatComponent
    ],
    exports:[
        ChatComponent
    ]
})
export class ChatModule { }
