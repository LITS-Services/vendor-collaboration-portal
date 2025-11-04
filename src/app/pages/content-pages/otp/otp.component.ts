import { Component, OnInit, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
  pendingRegistration: any = null;
  resetOtp = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private ngZone: NgZone,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit(): void {
    // ✅ Initialize OTP form
    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
    });

    // ✅ Detect reset OTP mode from query params
    this.route.queryParams.subscribe(params => {
      this.resetOtp = params['resetOtp'] === 'true';
      console.log('Reset OTP mode:', this.resetOtp);
    });

    // ✅ Get pending registration details
    const regPayload = localStorage.getItem('pendingRegistration');
    if (regPayload) {
      this.pendingRegistration = JSON.parse(regPayload);
    }
  }

  get lf() {
    return this.otpForm.controls;
  }

  // ✅ Verify OTP submission
  onSubmit() {
    this.otpFormSubmitted = true;

    if (this.otpForm.invalid) {
      this.toastr.warning('Please enter a valid 6-digit OTP');
      return;
    }

    this.spinner.show();

    const otpValue = this.otpForm.value.otp;
    let email: string | null = null;

    if (this.resetOtp) {
      email = localStorage.getItem('forgotEmail');
    } else if (this.pendingRegistration) {
      email = this.pendingRegistration.email;
    }

    if (!email) {
      this.spinner.hide();
      this.toastr.error('Email not found. Please try again.');
      return;
    }

    const navigateEmail = email;

    // ✅ Call verifyOtp API
    this.authService.verifyOtp(otpValue, email, this.resetOtp).subscribe({
      next: (res: any) => {
        this.spinner.hide();
        this.toastr.success('OTP verified successfully ✅');
        console.log('OTP verified successfully:', res);

        // Cleanup
        localStorage.removeItem('pendingRegistration');
        if (this.resetOtp) localStorage.removeItem('forgotEmail');

        this.ngZone.run(() => {
          if (this.resetOtp) {
            // ✅ Navigate to new password screen
            this.router.navigate(['../NewPassword'], {
              relativeTo: this.route,
              queryParams: { userEmail: navigateEmail }
            });
          } else {
            // ✅ Navigate to login
            this.router.navigate(['/pages/login']);
          }
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

  // ✅ Updated Resend OTP logic
  resendOtp() {
    // If reset OTP mode
    if (this.resetOtp) {
      const forgotEmail = localStorage.getItem('forgotEmail');
      if (!forgotEmail) {
        this.toastr.warning('No email found to resend OTP');
        return;
      }

      this.spinner.show();
      const portalType = '1';

      this.authService.resendOtp(forgotEmail, portalType).subscribe({
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
    } else {
      // Registration OTP resend flow
      if (!this.pendingRegistration) {
        this.toastr.warning('No registration found to resend OTP');
        return;
      }

      const { Username} = this.pendingRegistration;
      const portalType = '1';

      this.spinner.show();

      this.authService.resendOtp(Username, portalType).subscribe({
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
}
