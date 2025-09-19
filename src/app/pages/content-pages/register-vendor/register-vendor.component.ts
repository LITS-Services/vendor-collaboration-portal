import { Component, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'app/shared/auth/auth.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register-vendor',
  templateUrl: './register-vendor.component.html',
  styleUrls: ['./register-vendor.component.scss']
})
export class RegisterVendorComponent implements OnInit {
  public hidePassword: boolean = true;
  registerVendorFormSubmitted = false;
  isLoginFailed = false;

  countryExtensions = [
    { label: '+1 (USA)', value: '+1' },
    { label: '+44 (UK)', value: '+44' },
    { label: '+91 (India)', value: '+91' },
    { label: '+61 (Australia)', value: '+61' },
  ];

  companies: any[] = []; 
  selectedCompanies: string[] = [];

  registerVendorForm = new UntypedFormGroup({
    username: new UntypedFormControl('', [Validators.required]),
    businessName: new UntypedFormControl('', [Validators.required]),
    phoneNo: new UntypedFormControl('', [Validators.required]),
    phoneExtension: new UntypedFormControl('', [Validators.required]),
    email: new UntypedFormControl('', [Validators.required, Validators.email]),
    password: new UntypedFormControl('', [Validators.required, Validators.minLength(6)]),
    confirmPassword: new UntypedFormControl('', [Validators.required]),
    termsAndConditions: new UntypedFormControl(true, Validators.requiredTrue),
    selectedCompanies: new UntypedFormControl([], Validators.required)
  });

  constructor(
    private router: Router,
    private authService: AuthService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.fetchCompanies();
  }

  get lf() {
    return this.registerVendorForm.controls;
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  shouldHighlightPasswordField(): boolean {
    return this.registerVendorFormSubmitted && this.lf.password.invalid;
  }

  fetchCompanies() {
    this.authService.getProCompanies().subscribe({
      next: (res: any) => {
        this.companies = res.$values || [];
      },
      error: (err: any) => {
        this.toastr.error('Failed to load companies');
        console.error('Companies fetch error:', err);
      }
    });
  }

  onSubmit() {
    this.registerVendorFormSubmitted = true;

    if (this.registerVendorForm.invalid) {
      this.toastr.warning('Please fill all required fields correctly.');
      return;
    }

    if (!this.lf.selectedCompanies.value || this.lf.selectedCompanies.value.length === 0) {
      this.toastr.warning('Please select at least one company.');
      return;
    }

    this.spinner.show();

    const payload = {
      Username: this.lf.username.value,
      FullName: this.lf.businessName.value,
      PhoneNo: `${this.lf.phoneExtension.value}${this.lf.phoneNo.value}`,
      Email: this.lf.email.value,
      Password: this.lf.password.value,
      Role: 'Vendor',
      PortalType: 'Vendor',
      CompanyGUIDs: this.lf.selectedCompanies.value
    };

    this.authService.registerUser(payload).subscribe({
      next: (res: any) => {
        this.spinner.hide();
        console.log('Registration response:', res);

        // ✅ Handle string response
        const message = typeof res === 'string' ? res : res?.message || '';
        if (message.toLowerCase().includes('otp sent')) {
          this.toastr.success(message);

          localStorage.setItem('pendingRegistration', JSON.stringify({
            Username: payload.Username,
            PortalType: payload.PortalType
          }));

          this.router.navigate(['pages/otp']);
        } else {
          this.isLoginFailed = true;
          this.toastr.error('Vendor registration failed ❌');
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
            PortalType: payload.PortalType
          }));

          this.router.navigate(['pages/otp']);
        } else {
          this.isLoginFailed = true;
          this.toastr.error('Vendor registration failed ❌');
        }
      }
    });
  }

  rememberMe() {}
  forgotpassword() {}
  SSO(event: Event) {}
}
