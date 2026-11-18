import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Optional, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-company-contact-modal',
  templateUrl: './company-contact-modal.component.html',
  styleUrls: ['./company-contact-modal.component.scss'],
  standalone: false
})
export class CompanyContactModalComponent implements OnInit {
  @Input() contact: any = {
    contactRole: '',
    contactPerson: '',
    designation: '',
    email: '',
    description: '',
    type: 'phoneNo',
    contactNumber: '',
    extension: '',
    primary: false
  };

  @Input() isEditMode: boolean = false;
  @Output() submit = new EventEmitter<any>();

  contactRoleOptions: string[] = [
    'Procurement/Sales',
    'Accounts/Finance',
    'Directors/Partners',
    'General Management'
  ];

  contactLabel: string = 'Mobile / Phone Number';
  contactPlaceholder: string = 'Enter phone number';
  inputType: string = 'tel';
  showExtension: boolean = true;

  constructor(
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
        this.contactLabel = 'Mobile / Phone Number';
        this.contactPlaceholder = 'Enter phone no.';
        this.inputType = 'tel';
        this.showExtension = true;
        break;
      case 'Email':
        this.contactLabel = 'Email Address';
        this.contactPlaceholder = 'Enter email';
        this.inputType = 'email';
        this.showExtension = false;
        break;
      case 'Fax':
        this.contactLabel = 'Fax';
        this.contactPlaceholder = 'Enter fax no.';
        this.inputType = 'tel';
        this.showExtension = false;
        break;
      default:
        this.contactLabel = 'Mobile / Phone Number';
        this.contactPlaceholder = 'Enter phone no.';
        this.inputType = 'tel';
        this.showExtension = true;
    }
  }
}
