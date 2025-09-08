import { Component, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'app/shared/auth/auth.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-register-vendor',
  templateUrl: './register-vendor.component.html',
  styleUrls: ['./register-vendor.component.scss']
})
export class RegisterVendorComponent implements OnInit {
  public hidePassword: boolean = true;
  registerVendorFormSubmitted = false;
  isLoginFailed = false;

  public shouldHighlightPasswordField(): boolean {
    return this.registerVendorFormSubmitted && this.lf.password.invalid;
  }

  public togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  countryExtensions = [
    { label: '+1 (USA)', value: '+1' },
    { label: '+44 (UK)', value: '+44' },
    { label: '+91 (India)', value: '+91' },
    { label: '+61 (Australia)', value: '+61' },
    // Add more countries as needed
  ];

  registerVendorForm = new UntypedFormGroup({
    username: new UntypedFormControl('', [Validators.required]),
    businessName: new UntypedFormControl('', [Validators.required]),
    phoneNo: new UntypedFormControl('', [Validators.required]),
    email: new UntypedFormControl('', [Validators.required, Validators.email]),
    password: new UntypedFormControl('', [Validators.required, Validators.minLength(6)]),
    confirmPassword: new UntypedFormControl('', [Validators.required]),
    termsAndConditions: new UntypedFormControl(true, Validators.requiredTrue),
  });

  constructor(
    private router: Router,
    private authService: AuthService,
    private spinner: NgxSpinnerService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {}

  get lf() {
    return this.registerVendorForm.controls;
  }

  // On submit button click
  onSubmit() {
    this.registerVendorFormSubmitted = true;

    if (this.registerVendorForm.invalid) {
      return;
    }

    this.spinner.show(undefined, {
      type: 'ball-triangle-path',
      size: 'medium',
      bdColor: 'rgba(0, 0, 0, 0.8)',
      color: '#fff',
      fullScreen: true
    });

    // Build request payload
    const payload = {
      username: this.lf['username'].value,
      fullName: this.lf['businessName'].value,
      phoneNo: this.lf['phoneNo'].value,
      email: this.lf['email'].value,
      password: this.lf['password'].value,
      role: 'User'
    };

    // Call registerVendor API instead of signinUser
this.authService.registerUser(payload).subscribe({
  next: (res: any) => {   // use "res" here
    this.spinner.hide();
    this.router.navigate(['/pages/login'], { state: { vendorId: res.vendorId } });
  },
  error: (err) => {
    this.isLoginFailed = true;
    this.spinner.hide();
    console.error('error: ', err);
  }
});

  }

  rememberMe() {
    // keep your logic
  }

  forgotpassword() {
    // keep your logic
  }

  SSO(event: Event) {
    // keep your logic
  }
}
