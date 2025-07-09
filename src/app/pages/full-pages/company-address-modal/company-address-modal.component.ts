import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-company-address-modal',
  templateUrl: './company-address-modal.component.html',
  styleUrls: ['./company-address-modal.component.scss']
})
export class CompanyAddressModalComponent implements OnInit {
  @Output() addAddress = new EventEmitter<any>();
 address = {
    street: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    primary: false,
  }; // Default values in case address is not passed
  @Input() isEditAddressMode: boolean = false;
  @Output() saveAddress = new EventEmitter<any>();

  constructor(public activeModal: NgbActiveModal) { }

  ngOnInit(): void {

  }
  submitAddress() {
    if (this.isEditAddressMode) {
      // Emit the edited address
      this.saveAddress.emit(this.address);
    } else {
      // Emit a new address for addition
      this.addAddress.emit(this.address);
    }
    this.activeModal.close(this.address);
  }
  
}
