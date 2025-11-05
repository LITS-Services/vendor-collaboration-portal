import { Component, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'app/shared/auth/auth.service';
import { CountryISO, PhoneNumberFormat, SearchCountryField } from 'ngx-intl-tel-input';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register-vendor',
  templateUrl: './register-vendor.component.html',
  styleUrls: ['./register-vendor.component.scss']
})
export class RegisterVendorComponent implements OnInit {
  public hidePassword: boolean = true;
  public hideConfirmPassword: boolean = true;

  registerVendorFormSubmitted = false;
  isLoginFailed = false;

  CountryISO = CountryISO;
  PhoneNumberFormat = PhoneNumberFormat;
  SearchCountryField = SearchCountryField;

  // Removed the companies and selectedCompanies fields
  countryExtensions = [
    { label: '+1 (USA)', value: '+1' },
    { label: '+44 (UK)', value: '+44' },
    { label: '+91 (India)', value: '+91' },
    { label: '+61 (Australia)', value: '+61' },
  ];

  preferredCountries = [CountryISO.Pakistan, CountryISO.SaudiArabia, CountryISO.UnitedArabEmirates];

  registerVendorForm = new UntypedFormGroup({
    username: new UntypedFormControl('', [Validators.required]),
    businessName: new UntypedFormControl('', [Validators.required]),
    phone: new UntypedFormControl(undefined, [Validators.required]),
    //phoneNo: new UntypedFormControl('', [Validators.required]),
    //phoneExtension: new UntypedFormControl('', [Validators.required]),
    email: new UntypedFormControl('', [Validators.required, Validators.email]),
    password: new UntypedFormControl('', [Validators.required, Validators.minLength(6)]),
    confirmPassword: new UntypedFormControl('', [Validators.required]),
    termsAndConditions: new UntypedFormControl(true, Validators.requiredTrue),
    // Removed selectedCompanies control
  });

  constructor(
    private router: Router,
    private authService: AuthService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    // Removed the fetchCompanies() call
  }

  get lf() {
    return this.registerVendorForm.controls;
  }

  // togglePasswordVisibility() {
  //   this.hidePassword = !this.hidePassword;
  // }

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

    if (this.registerVendorForm.invalid) {
      this.toastr.warning('Please fill all required fields correctly.');
      return;
    }

    // Removed validation for selectedCompanies as it is no longer required

    this.spinner.show();
    const phoneObj = this.registerVendorForm.value.phone;
    const payload = {
      Username: this.lf.username.value,
      FullName: this.lf.businessName.value,
      PhoneNo: phoneObj?.e164Number ?? null,
      Email: this.lf.email.value,
      Password: this.lf.password.value,
      Role: 'User',
      PortalType: 'Vendor',
      // Removed CompanyGUIDs from the payload
    };

    this.authService.registerUser(payload).subscribe({
      next: (res: any) => {
        this.spinner.hide();
        console.log('Registration response:', res);

        // Handle string response
        const message = typeof res === 'string' ? res : res?.message || '';
        if (message.toLowerCase().includes('otp sent')) {
          this.toastr.success('OTP verified successfully');

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

        // If backend returns OTP message in error
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
