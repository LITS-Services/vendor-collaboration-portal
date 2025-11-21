import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-company-address-modal',
  templateUrl: './company-address-modal.component.html',
  styleUrls: ['./company-address-modal.component.scss']
})
export class CompanyAddressModalComponent implements OnInit {
  @Output() addAddress = new EventEmitter<any>();

    @Input() address: any = {
    street: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    primary: false
  };

  @Input() isEditAddressMode: boolean = false;
  @Output() submit = new EventEmitter<any>();


  constructor() { }

  ngOnInit(): void {

  }
  submitAddress() {
    this.submit.emit(this.address);
  }
  
}
