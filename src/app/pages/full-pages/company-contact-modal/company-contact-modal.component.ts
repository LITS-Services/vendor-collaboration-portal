import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Optional, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-company-contact-modal',
  templateUrl: './company-contact-modal.component.html',
  styleUrls: ['./company-contact-modal.component.scss']
})
export class CompanyContactModalComponent implements OnInit {
  @Input() contact: any = {
    description: '',
    type: 'Mobile',
    contactNumber: '',
    extension: '',
    primary: false
  };

  @Input() isEditMode: boolean = false;
   @Output() submit = new EventEmitter<any>();

  contactLabel: string = 'Phone Number';
  contactPlaceholder: string = 'Enter Phone number';
  inputType: string = 'number';
  showExtension: boolean = true;

  constructor(
    //@Optional() public activeModal: NgbActiveModal,  // <-- optional
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.updateContactLabel();
    this.cdr.detectChanges();
  }

  submitForm() {
    this.submit.emit(this.contact);

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