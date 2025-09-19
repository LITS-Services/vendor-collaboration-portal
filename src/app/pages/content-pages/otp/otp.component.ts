import { Component, OnInit, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'app/shared/auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-otp',
  templateUrl: './otp.component.html',
  styleUrls: ['./otp.component.scss']
})
export class OtpComponent implements OnInit {
  otpForm!: FormGroup;
  otpFormSubmitted = false;
  isOtpFailed = false;
  pendingRegistration: any = null; // Full registration payload (Username + PortalType)

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private ngZone: NgZone,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit(): void {
    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
    });

    // Load saved registration payload from localStorage (set during registration)
    const regPayload = localStorage.getItem('pendingRegistration');
    if (regPayload) {
      this.pendingRegistration = JSON.parse(regPayload);
    }
  }

  get lf() {
    return this.otpForm.controls;
  }

  // Verify OTP
  onSubmit() {
    this.otpFormSubmitted = true;
    if (this.otpForm.invalid || !this.pendingRegistration) {
      this.toastr.warning('Please enter a valid 6-digit OTP');
      return;
    }

    const otpValue = this.otpForm.value.otp;
    const { Username, PortalType } = this.pendingRegistration;

    this.spinner.show();

    this.authService.verifyOtp(otpValue).subscribe({
      next: (res: any) => {
        this.spinner.hide();
        this.toastr.success('OTP verified successfully ✅');
        console.log('OTP verified successfully:', res);
        localStorage.removeItem('pendingRegistration');
        this.ngZone.run(() => {
          this.router.navigate(['/dashboard/dashboard1']);
        });
      },
      error: (err: any) => {
        this.spinner.hide();
        this.isOtpFailed = true;
        this.toastr.error('Invalid or expired OTP ❌');
        console.error('OTP verification failed:', err);
      }
    });

  }

  // Resend OTP
  resendOtp() {
    if (!this.pendingRegistration) {
      this.toastr.warning('No registration found to resend OTP');
      return;
    }

    const { Username, PortalType } = this.pendingRegistration;

    this.spinner.show();

    this.authService.resendOtp(Username, PortalType).subscribe({
      next: (res: any) => {
        this.spinner.hide();
        this.toastr.info('OTP resent successfully 🔄');
        console.log('OTP resent successfully:', res);
      },
      error: (err) => {
        this.spinner.hide();
        this.toastr.error('Failed to resend OTP ❌');
        console.error('Failed to resend OTP:', err);
      }
    });
  }
}
