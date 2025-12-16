import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from "@angular/common";
import { FormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';

// Temporarily commented: import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { ChatNGRXRoutingModule } from "./chat-ngrx-routing.module";
import { PipeModule } from 'app/shared/pipes/pipe.module';

import { ChatComponent } from "./chat-ngrx.component";
import { chatReducer } from '../chat-ngrx/store/chat.reducers';


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ChatNGRXRoutingModule,
        NgbModule,
        // Temporarily commented: PerfectScrollbarModule,
        PipeModule,
        StoreModule.forFeature('chat', chatReducer),
    ],
    declarations: [
        ChatComponent
    ],
    schemas: [NO_ERRORS_SCHEMA] // Suppress perfectScrollbar binding errors
})
export class ChatNGRXModule { }
