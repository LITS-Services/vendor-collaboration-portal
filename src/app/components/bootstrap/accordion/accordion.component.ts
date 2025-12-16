import { Component } from '@angular/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-accordion',
  templateUrl: './accordion.component.html',
  styleUrls: ['./accordion.component.scss'],
  schemas: [NO_ERRORS_SCHEMA]
})
export class AccordionComponent {
  acc: any;
  // Prevent panel toggle code
  public beforeChange($event: any) {
    if ($event.panelId === 'preventchange-2') {
      $event.preventDefault();
    }
    if ($event.panelId === 'preventchange-3' && $event.nextState === false) {
      $event.preventDefault();
    }
  };

}