import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { AuthService } from 'app/shared/auth/auth.service';

@Component({
  selector: 'app-verify-forgot-password-otp',
  templateUrl: './verify-forgot-password-otp.component.html',
  styleUrls: ['./verify-forgot-password-otp.component.scss']
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
    private router: Router
  ) {}

  ngOnInit(): void {
    // Get email from local storage
    this.userEmail = localStorage.getItem('forgotEmail');

    if (!this.userEmail) {
      this.toastr.warning('Session expired, please try again.');
      this.router.navigate(['/ForgotPassword']);
      return;
    }

    this.verifyOtpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      password: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/) // At least 1 uppercase, 1 number
      ]],
      confirmPassword: ['', Validators.required]
    }, {
      validators: this.mustMatch('password', 'confirmPassword')
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
      email: this.userEmail,
      otp: Number(this.verifyOtpForm.value.otp),
      newPassword: this.verifyOtpForm.value.password
    };

    this.authService.ConfirmForgotOtp(payload).subscribe({
      next: () => {
        this.toastr.success('Password reset successfully!');
        localStorage.removeItem('forgotEmail');
        this.router.navigate(['/pages/login']);
      },
      error: () => {
        this.toastr.error('Invalid OTP or something went wrong.');
      }
    });
  }

}
