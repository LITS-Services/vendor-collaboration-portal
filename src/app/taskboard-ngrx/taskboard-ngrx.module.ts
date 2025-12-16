import { NgModule, NO_ERRORS_SCHEMA, ModuleWithProviders } from '@angular/core';
import { CommonModule } from "@angular/common";
import { StoreModule } from '@ngrx/store';

import { DragulaModule } from 'ng2-dragula';
import { TaskboardNGRXRoutingModule } from "./taskboard-ngrx-routing.module";

import { TaskboardNGRXComponent } from "./taskboard-ngrx.component";
import { taskReducer } from '../taskboard-ngrx/store/taskboard.reducers';


@NgModule({
    schemas: [NO_ERRORS_SCHEMA], // Allow dragula directives
    imports: [
        CommonModule,
        TaskboardNGRXRoutingModule,
        DragulaModule.forRoot() as ModuleWithProviders<DragulaModule>,
        StoreModule.forFeature('task', taskReducer)
    ],
    declarations: [
        TaskboardNGRXComponent
    ]
})
export class TaskboardNGRXModule { }
