import { Component } from '@angular/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';

@Component({
    selector: 'app-collapse',
    templateUrl: './collapse.component.html',
    styleUrls: ['./collapse.component.scss'],
    schemas: [NO_ERRORS_SCHEMA]
})

export class CollapseComponent {
    isCollapsed = false;
}