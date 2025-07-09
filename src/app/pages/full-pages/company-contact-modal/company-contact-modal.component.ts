import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-company-contact-modal',
  templateUrl: './company-contact-modal.component.html',
  styleUrls: ['./company-contact-modal.component.scss']
})
export class CompanyContactModalComponent implements OnInit {
  @Output() addContact = new EventEmitter<any>();
  contact = {
    description: '',
    type: 'Mobile',
    contactNumber: '',
    extension: '',
    primary: false
  };
  contactLabel: string = 'Phone Number';
  contactPlaceholder: string = 'Enter Phone number';
  inputType: string = 'number';
  showExtension: boolean = true;

  @Input() isEditMode: boolean = false;
  @Output() saveContact = new EventEmitter<any>();
  constructor(public activeModal: NgbActiveModal, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    console.log('contact received in modal:', this.contact);
    this.updateContactLabel();
    this.cdr.detectChanges();
  }
  // submitForm() {
  //   console.log('Submitting contact:', this.contact);
  //   this.addContact.emit(this.contact);
  //   this.activeModal.close(this.contact);
  // }
  submitForm() {
    if (this.isEditMode) {
      // Emit the edited address
      this.saveContact.emit(this.contact);
    } else {
      // Emit a new address for addition
      this.addContact.emit(this.contact);
    }
    this.activeModal.close(this.contact);
  }
  updateContactLabel(): void {
    switch (this.contact.type) {
      case 'phoneNo':
        this.contactLabel = 'Phone Number';
        this.contactPlaceholder = 'Enter phone no.';
        this.inputType = 'number';
        this.showExtension = true;
        break;
      case 'Email':
        this.contactLabel = 'Email';
        this.contactPlaceholder = 'Enter email';
        this.inputType = 'email';
        this.showExtension = false;
        break;
      case 'Fax':
        this.contactLabel = 'Fax';
        this.contactPlaceholder = 'Enter fax no.';
        this.inputType = 'number';
        this.showExtension = false;
        break;
      default:
        this.contactLabel = 'Phone Number';
        this.contactPlaceholder = 'Enter phone no.';
        this.inputType = 'number';
        this.showExtension = true;
    }
  }
}
