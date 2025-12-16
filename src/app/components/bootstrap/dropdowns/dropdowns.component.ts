import { Component } from '@angular/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';

@Component({
    selector: 'app-dropdowns',
    templateUrl: './dropdowns.component.html',
    styleUrls: ['./dropdowns.component.scss'],
    schemas: [NO_ERRORS_SCHEMA]
})

export class DropdownsComponent {
    myDrop: any;
    myDrop1: any;
}