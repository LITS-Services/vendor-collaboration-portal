import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Optional,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import {
  DEFAULT_PHONE_COUNTRY_ISO,
  PHONE_COUNTRIES,
  formatPhoneNumber,
  getPhoneNationalPlaceholder,
  isValidPhoneForCountry,
  splitPhoneNumber
} from 'app/shared/utils/phone-countries';

type ContactField = 'contactRole' | 'contactPerson' | 'email' | 'type' | 'contactNumber';

@Component({
  selector: 'app-company-contact-modal',
  templateUrl: './company-contact-modal.component.html',
  styleUrls: ['./company-contact-modal.component.scss'],
  standalone: false
})
export class CompanyContactModalComponent implements OnInit, OnChanges {
  @ViewChild('contactForm') contactForm?: NgForm;

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
  @Output() contactSubmit = new EventEmitter<any>();
  @Output() cancelEdit = new EventEmitter<void>();

  contactRoleOptions: string[] = [
    'Procurement/Sales',
    'Accounts/Finance',
    'Directors/Partners',
    'General Management'
  ];

  readonly phoneCountries = PHONE_COUNTRIES;
  countryIso: string = DEFAULT_PHONE_COUNTRY_ISO;
  phoneNational: string = '';
  phoneTouched: boolean = false;

  contactLabel: string = 'Mobile / Phone Number';
  contactPlaceholder: string = 'Enter phone no.';
  inputType: string = 'tel';
  showExtension: boolean = true;
  submitted: boolean = false;

  private lastContactType: string = 'phoneNo';
  private readonly emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  constructor(
    private cdr: ChangeDetectorRef,
    @Optional() private toastr?: ToastrService
  ) { }

  get isPhoneType(): boolean {
    return (this.contact?.type || 'phoneNo') !== 'Email';
  }

  get phonePlaceholder(): string {
    return getPhoneNationalPlaceholder(this.countryIso, this.contact?.type === 'Fax');
  }

  ngOnInit(): void {
    this.normalizeContactType();
    this.lastContactType = this.contact?.type || 'phoneNo';
    this.syncPhoneFromContact();
    this.updateContactLabel();
    this.cdr.detectChanges();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['contact'] && this.contact) {
      this.normalizeContactType();
      this.lastContactType = this.contact?.type || 'phoneNo';
      this.syncPhoneFromContact();
      this.updateContactLabel();
      this.resetValidationState();
      this.cdr.markForCheck();
    }
  }

  private normalizeContactType(): void {
    if (!this.contact) return;
    if (!this.contact.type || this.contact.type === 'Mobile') {
      this.contact.type = 'phoneNo';
    }
  }

  private syncPhoneFromContact(): void {
    if (this.isPhoneType) {
      const parsed = splitPhoneNumber(this.contact?.contactNumber || '', DEFAULT_PHONE_COUNTRY_ISO);
      this.countryIso = parsed.countryIso;
      this.phoneNational = parsed.national;
    } else {
      this.phoneNational = '';
    }
  }

  private syncContactNumberFromPhone(): void {
    if (!this.contact) return;
    this.contact.contactNumber = formatPhoneNumber(this.countryIso, this.phoneNational);
  }

  onCountryIsoChange(iso: string): void {
    this.countryIso = iso || DEFAULT_PHONE_COUNTRY_ISO;
    this.syncContactNumberFromPhone();
    this.cdr.markForCheck();
  }

  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const raw = input.value || '';
    const trimmed = raw.trim();

    if (trimmed.startsWith('+') || trimmed.startsWith('00')) {
      const parsed = splitPhoneNumber(trimmed, this.countryIso);
      this.countryIso = parsed.countryIso;
      this.phoneNational = parsed.national;
      input.value = parsed.national;
    } else {
      const digits = raw.replace(/\D/g, '');
      input.value = digits;
      this.phoneNational = digits;
    }

    this.phoneTouched = true;
    this.syncContactNumberFromPhone();
    this.cdr.markForCheck();
  }

  onPhoneBlur(): void {
    this.phoneTouched = true;
  }

  onTypeChange(): void {
    const nextType = (this.contact?.type || 'phoneNo').toString().trim();
    const wasEmail = this.lastContactType === 'Email';
    const isNowEmail = nextType === 'Email';

    if (wasEmail !== isNowEmail) {
      if (this.contact) {
        this.contact.contactNumber = '';
      }
      this.phoneNational = '';
      this.phoneTouched = false;
    }

    this.lastContactType = nextType;
    this.updateContactLabel();
    this.cdr.markForCheck();
  }

  private resetValidationState(): void {
    this.submitted = false;
    this.phoneTouched = false;
    if (this.contactForm?.form) {
      Object.values(this.contactForm.controls).forEach((control) => {
        control.markAsPristine();
        control.markAsUntouched();
      });
      this.contactForm.form.markAsPristine();
      this.contactForm.form.markAsUntouched();
    }
  }

  getFieldError(field: ContactField): string | null {
    if (!this.contact) return null;

    switch (field) {
      case 'contactRole': {
        const val = (this.contact.contactRole || '').toString().trim();
        return val ? null : 'Contact role is required.';
      }
      case 'contactPerson': {
        const val = (this.contact.contactPerson || '').toString().trim();
        return val ? null : 'Contact person is required.';
      }
      case 'email': {
        const val = (this.contact.email || '').toString().trim();
        if (!val) return 'Email address is required.';
        if (!this.emailRegex.test(val)) return 'Please enter a valid email address.';
        return null;
      }
      case 'type': {
        const val = (this.contact.type || '').toString().trim();
        return val ? null : 'Contact type is required.';
      }
      case 'contactNumber': {
        const type = (this.contact.type || 'phoneNo').toString().trim();

        if (type === 'Email') {
          const val = (this.contact.contactNumber || '').toString().trim();
          if (!val) return 'Email address is required.';
          return this.emailRegex.test(val) ? null : 'Please enter a valid email address.';
        }

        const digits = (this.phoneNational || '').replace(/\D/g, '');
        if (!digits) {
          return type === 'Fax' ? 'Fax number is required.' : 'Phone number is required.';
        }

        if (!isValidPhoneForCountry(digits, this.countryIso)) {
          return type === 'Fax'
            ? 'Please enter a valid fax number for the selected country.'
            : 'Please enter a valid phone number for the selected country.';
        }
        return null;
      }
      default:
        return null;
    }
  }

  isFieldInvalid(field: ContactField): boolean {
    if (field === 'contactNumber' && this.isPhoneType) {
      const shouldShow = this.submitted || this.phoneTouched || !!this.phoneNational;
      return shouldShow && !!this.getFieldError(field);
    }

    const control = this.contactForm?.controls?.[field];
    const shouldShow = this.submitted || !!control?.touched;
    return shouldShow && !!this.getFieldError(field);
  }

  private hasValidationErrors(): boolean {
    const fields: ContactField[] = ['contactRole', 'contactPerson', 'email', 'type', 'contactNumber'];
    return fields.some((field) => !!this.getFieldError(field));
  }

  submitForm(): void {
    this.submitted = true;
    this.phoneTouched = true;
    this.contactForm?.form.markAllAsTouched();

    if (this.isPhoneType) {
      this.syncContactNumberFromPhone();
    }

    if (this.hasValidationErrors()) {
      this.toastr?.warning('Please fill in all required contact fields correctly.', 'Validation Error');
      this.cdr.detectChanges();
      return;
    }

    const formattedNumber = this.isPhoneType
      ? formatPhoneNumber(this.countryIso, this.phoneNational)
      : (this.contact.contactNumber || '').toString().trim();

    const sanitizedContact = {
      ...this.contact,
      contactRole: (this.contact.contactRole || '').toString().trim(),
      contactPerson: (this.contact.contactPerson || '').toString().trim(),
      designation: (this.contact.designation || '').toString().trim(),
      email: (this.contact.email || '').toString().trim(),
      description: (this.contact.description || '').toString().trim(),
      type: (this.contact.type || 'phoneNo').toString().trim(),
      contactNumber: formattedNumber,
      extension: this.showExtension ? (this.contact.extension || '').toString().trim() : '',
      primary: !!this.contact.primary
    };

    this.contactSubmit.emit(sanitizedContact);
  }

  cancelEditMode(): void {
    this.resetValidationState();
    this.cancelEdit.emit();
  }

  updateContactLabel(): void {
    switch (this.contact?.type) {
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
