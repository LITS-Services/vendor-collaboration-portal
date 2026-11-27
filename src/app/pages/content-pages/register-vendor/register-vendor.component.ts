import { Component, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'app/shared/auth/auth.service';
import { newPasswordValidators, confirmPasswordMatchValidator } from 'app/shared/auth/password.validators';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import {
  DEFAULT_PHONE_COUNTRY_ISO,
  PHONE_COUNTRIES,
  PhoneCountryOption,
  getPhoneCountryByIso,
  getPhoneNationalPlaceholder,
  isValidPhoneForCountry,
  splitPhoneNumber
} from 'app/shared/utils/phone-countries';

@Component({
  selector: 'app-register-vendor',
  templateUrl: './register-vendor.component.html',
  styleUrls: ['./register-vendor.component.scss'],
  standalone: false
})
export class RegisterVendorComponent implements OnInit {
  public hidePassword: boolean = true;
  public hideConfirmPassword: boolean = true;

  registerVendorFormSubmitted = false;
  isLoginFailed = false;

  phoneCountries: PhoneCountryOption[] = PHONE_COUNTRIES;
  countryIso: string = DEFAULT_PHONE_COUNTRY_ISO;
  phoneNational: string = '';
  phoneTouched: boolean = false;

  registerVendorForm = new UntypedFormGroup({
    username: new UntypedFormControl('', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(30),
      Validators.pattern(/^[a-zA-Z][a-zA-Z0-9._-]*$/)
    ]),
    fullname: new UntypedFormControl('', [Validators.required]),
    phone: new UntypedFormControl('', [Validators.required]),
    email: new UntypedFormControl('', [Validators.required, Validators.email]),
    password: new UntypedFormControl('', newPasswordValidators),
    confirmPassword: new UntypedFormControl('', [Validators.required]),
    termsAndConditions: new UntypedFormControl(true, Validators.requiredTrue),
  }, { validators: confirmPasswordMatchValidator() });

  constructor(
    private router: Router,
    private authService: AuthService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
  }

  get lf() {
    return this.registerVendorForm.controls;
  }

  get phonePlaceholder(): string {
    return getPhoneNationalPlaceholder(this.countryIso);
  }

  get phoneMaxDigits(): number {
    const exampleDigits = this.phonePlaceholder.replace(/\D/g, '').length;
    return exampleDigits ? exampleDigits + 1 : 15;
  }

  get isPhoneInvalid(): boolean {
    const shouldShow = this.registerVendorFormSubmitted || this.phoneTouched;
    return shouldShow && !this.isPhoneValid();
  }

  isPhoneValid(): boolean {
    const digits = (this.phoneNational || '').replace(/\D/g, '');
    if (!digits) return false;
    return isValidPhoneForCountry(digits, this.countryIso);
  }

  get phoneErrorMessage(): string {
    const digits = (this.phoneNational || '').replace(/\D/g, '');
    if (!digits) return 'Phone is required';
    return 'Please enter a valid phone number for the selected country';
  }

  onCountryIsoChange(iso: string): void {
    this.countryIso = iso || DEFAULT_PHONE_COUNTRY_ISO;
    this.syncPhoneToForm();
  }

  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const raw = input.value || '';
    const trimmed = raw.trim();

    if (trimmed.startsWith('+') || trimmed.startsWith('00')) {
      const parsed = splitPhoneNumber(trimmed, this.countryIso);
      this.countryIso = parsed.countryIso;
      this.phoneNational = parsed.national.slice(0, this.phoneMaxDigits);
      input.value = this.phoneNational;
    } else {
      const digits = raw.replace(/\D/g, '').slice(0, this.phoneMaxDigits);
      input.value = digits;
      this.phoneNational = digits;
    }

    this.phoneTouched = true;
    this.syncPhoneToForm();
  }

  onPhoneBlur(): void {
    this.phoneTouched = true;
    this.syncPhoneToForm();
  }

  private syncPhoneToForm(): void {
    const digits = (this.phoneNational || '').replace(/\D/g, '');
    if (digits && isValidPhoneForCountry(digits, this.countryIso)) {
      const country = getPhoneCountryByIso(this.countryIso);
      const e164 = `${country.code}${digits}`;
      this.registerVendorForm.get('phone')?.setValue(e164);
      this.registerVendorForm.get('phone')?.setErrors(null);
    } else if (!digits) {
      this.registerVendorForm.get('phone')?.setValue('');
      this.registerVendorForm.get('phone')?.setErrors({ required: true });
    } else {
      this.registerVendorForm.get('phone')?.setValue('');
      this.registerVendorForm.get('phone')?.setErrors({ invalidPhone: true });
    }
  }

  togglePasswordVisibility(field: string) {
    switch (field) {
      case 'password':
        this.hidePassword = !this.hidePassword;
        break;
      case 'confirmPassword':
        this.hideConfirmPassword = !this.hideConfirmPassword;
        break;
    }
  }

  shouldHighlightPasswordField(): boolean {
    return this.registerVendorFormSubmitted && this.lf.password.invalid;
  }

  onSubmit() {
    this.registerVendorFormSubmitted = true;
    this.phoneTouched = true;
    this.syncPhoneToForm();

    if (this.registerVendorForm.invalid || !this.isPhoneValid()) {
      this.toastr.warning('Please fill all required fields correctly.');
      return;
    }

    this.spinner.show();
    const digits = (this.phoneNational || '').replace(/\D/g, '');
    const country = getPhoneCountryByIso(this.countryIso);
    const phoneE164 = digits ? `${country.code}${digits}` : null;

    const payload = {
      Username: this.lf.username.value,
      FullName: this.lf.fullname.value,
      PhoneNo: phoneE164,
      Email: this.lf.email.value,
      Password: this.lf.password.value,
      Role: 'User',
      PortalType: 'Vendor',
    };

    this.authService.registerUser(payload).subscribe({
      next: (res: any) => {
        this.spinner.hide();
        console.log('Registration response:', res);

        const message = typeof res === 'string' ? res : res?.message || '';
        if (message.toLowerCase().includes('otp sent')) {
          this.toastr.success('OTP sent successfully.');

          localStorage.setItem('pendingRegistration', JSON.stringify({
            Username: payload.Username,
            PortalType: payload.PortalType,
            email: payload.Email
          }));

          this.router.navigate(['pages/otp']);
        } else {
          this.isLoginFailed = true;
          this.toastr.error('Vendor registration failed');
        }
      },
      error: (err: any) => {
        this.spinner.hide();
        console.error('Registration failed (HTTP error):', err);

        const message = err?.error || '';
        if (typeof message === 'string' && message.toLowerCase().includes('otp sent')) {
          this.toastr.success(message);

          localStorage.setItem('pendingRegistration', JSON.stringify({
            Username: payload.Username,
            PortalType: payload.PortalType,
            email: payload.Email
          }));

          this.router.navigate(['pages/otp']);
        } else {
          this.isLoginFailed = true;
          this.toastr.error('Vendor registration failed');
        }
      }
    });
  }

  rememberMe() { }
  forgotpassword() { }
  SSO(event: Event) { }
}
