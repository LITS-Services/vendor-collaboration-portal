import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'app/shared/auth/auth.service';
import { newPasswordValidators, confirmPasswordMatchValidator } from 'app/shared/auth/password.validators';
import { NgxSpinnerService } from 'ngx-spinner';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-verify-forgot-password-otp',
  templateUrl: './verify-forgot-password-otp.component.html',
  styleUrls: ['./verify-forgot-password-otp.component.scss'],
  standalone: false
})
export class VerifyForgotPasswordOtpComponent implements OnInit {

  verifyOtpForm!: FormGroup;
  submitted = false;
  userEmail: string | null = null;

  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService
  ) { }

  ngOnInit(): void {
    // Get email from query params
    this.route.queryParams.subscribe(params => {
      this.userEmail = params['userEmail'] || null;
    });

    if (!this.userEmail) {
      this.toastr.warning('Email not found. Please try again.');
      this.router.navigate(['/ForgotPassword']);
      return;
    }

    // OTP field kept but no validation (optional)
    this.verifyOtpForm = this.fb.group({
      otp: [''],
      password: ['', newPasswordValidators],
      confirmPassword: ['', Validators.required]
    }, {
      validators: confirmPasswordMatchValidator()
    });
  }

  get f() {
    return this.verifyOtpForm.controls;
  }

  // Custom validator to check if password and confirmPassword match
  mustMatch(controlName: string, matchingControlName: string) {
    return (formGroup: AbstractControl) => {
      const control = formGroup.get(controlName);
      const matchingControl = formGroup.get(matchingControlName);

      if (matchingControl?.errors && !matchingControl.errors['mustMatch']) return;

      if (control?.value !== matchingControl?.value) {
        matchingControl?.setErrors({ mustMatch: true });
      } else {
        matchingControl?.setErrors(null);
      }
    };
  }

  togglePasswordVisibility(field: string) {
    if (field === 'password') this.showPassword = !this.showPassword;
    if (field === 'confirmPassword') this.showConfirmPassword = !this.showConfirmPassword;
  }

  goBack() {
    this.router.navigate(['/ForgotPassword']);
  }

  onSubmit() {
    this.submitted = true;
    if (this.verifyOtpForm.invalid) {
      this.toastr.warning('Please fix form errors.');
      return;
    }

    const payload = {
      email: this.userEmail, // from query param
      otp: Number(this.verifyOtpForm.value.otp),
      newPassword: this.verifyOtpForm.value.password
    };

    this.spinner.show(); //  show spinner before API call

    this.authService
      .ConfirmForgotOtp(payload)
      .pipe(
        finalize(() => {
          this.spinner.hide(); //  always hide spinner on complete/error
        })
      )
      .subscribe({
        next: () => {
          // this.toastr.success('Password reset successfully!');
          this.router.navigate(['/pages/login']);
        },
        error: () => {
          this.toastr.error('Invalid OTP or something went wrong.');
        }
      });
  }

}
