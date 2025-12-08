import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from "@angular/router";
import { AuthService } from 'app/shared/auth/auth.service';
import { NgxSpinnerService } from "ngx-spinner";
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent implements OnInit {
  token: string | undefined;
  public hidePassword: boolean = true;
  loginFormSubmitted = false;
  isLoginFailed = false;
  isSSOLoading = false;
  errorMessage = '';

  loginForm = new UntypedFormGroup({
    username: new UntypedFormControl("", [Validators.required]),
    password: new UntypedFormControl("", [Validators.required]),
    rememberMe: new UntypedFormControl(true),
    recaptcha: new UntypedFormControl('', [Validators.required])
  });

  constructor(
    private router: Router,
    private authService: AuthService,
    private spinner: NgxSpinnerService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService
  ) { }

  get lf() {
    return this.loginForm.controls;
  }

  public shouldHighlightPasswordField(): boolean {
    return this.loginFormSubmitted && this.lf.password.invalid;
  }

  ngOnInit() {
    const msg = sessionStorage.getItem('authFlash');
    if (msg) {
      sessionStorage.removeItem('authFlash');
      this.toastr.warning(msg, 'Session expired', { timeOut: 10000 });
    }
    console.log("Full URL:", window.location.href);

    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    let refreshToken = params.get("refreshToken") ?? undefined;
    if (refreshToken) {
      refreshToken = refreshToken.replace(/ /g, "+");
    }
    const email = params.get('email');
    const userId = params.get('id');
    const username = params.get('username');
    const error = params.get('error');
    const code = params.get('code');
    const company = params.get('company');

    if (token) {
      console.log("Token found in URL:", token);
      localStorage.setItem('token', token);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      if (email) localStorage.setItem('userEmail', email);
      if (userId) localStorage.setItem('userId', userId);
      if (username) localStorage.setItem('username', username);
      if (company) localStorage.setItem('company', company);

      this.router.navigate(['/dashboard/dashboard1'], { replaceUrl: true });
      return;
    }

    if (error) {
      this.isLoginFailed = true;
      this.errorMessage = error;
      console.error('❌ Error from URL:', error);
      this.cdr.detectChanges();
      return;
    }
  }

  onSubmit() {  
    this.loginFormSubmitted = true;
    if (this.loginForm.controls['recaptcha'].invalid) {
      this.toastr.warning('Please verify the CAPTCHA to proceed.');
      return;
    }

    if (this.loginForm.invalid) return;

    this.spinner.show(undefined, {
      type: 'ball-triangle-path',
      size: 'medium',
      bdColor: 'rgba(0, 0, 0, 0.8)',
      color: '#fff',
      fullScreen: true
    });

    const { username, password } = this.loginForm.value;

    this.authService
      .sgninUser(username, password)
      .pipe(finalize(() => this.spinner.hide()))
      .subscribe({
        next: (res: any) => {
          if (res?.token) {
            localStorage.setItem('token', res.token);
          }
          if (res?.userId) {
            localStorage.setItem('userId', res.userId);
          }

          localStorage.setItem('username', username);

          console.log('Login successful');
          this.router.navigate(['/dashboard/dashboard1']);
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.isLoginFailed = true;
          this.errorMessage =
            err?.error?.message || 'Login failed. Check your credentials.';
          this.toastr.error(this.errorMessage);
          console.error(' Login failed:', err);
          this.cdr.detectChanges();
        }
      });
  }

  rememberMe() { }

  forgotpassword() { }

  // Microsoft SSO
  loginWithMicrosoft() {
    this.isSSOLoading = true;
    this.spinner.show();

    this.authService
      .initiateSSOLogin('microsoft')
      .pipe(
        finalize(() => {
          this.isSSOLoading = false;
          this.spinner.hide();
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (response: any) => {
          const loginUrl = response?.loginUrl ?? response;

          if (loginUrl) {
            window.location.href = loginUrl;
          } else {
            this.toastr.warning('Microsoft SSO URL not received.');
          }
        },
        error: () => {
          this.errorMessage = 'Failed to connect to Microsoft SSO service.';
          this.isLoginFailed = true;
          this.toastr.error(this.errorMessage);
          console.error(' Microsoft SSO connection failed');
        }
      });
  }

  // Google SSO
  loginWithGoogle() {
    this.isSSOLoading = true;
    this.spinner.show();

    this.authService
      .GoogleSSOLogin() // Specific Google SSO API call
      .pipe(
        finalize(() => {
          this.isSSOLoading = false;
          this.spinner.hide();
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (response: any) => {
          const loginUrl = response?.loginUrl ?? response?.url ?? response;

          if (loginUrl) {
            window.location.href = loginUrl;
          } else {
            this.toastr.warning('Google SSO URL not received.');
          }
        },
        error: (error) => {
          this.errorMessage = error?.error?.message || 'Failed to connect to Google SSO service.';
          this.isLoginFailed = true;
          this.toastr.error(this.errorMessage);
          console.error(' Google SSO connection failed:', error);
        }
      });
  }

  // Facebook SSO
  loginWithFacebook() {
    this.isSSOLoading = true;
    this.spinner.show();

    this.authService
      .FacebookSSOLogin() // Specific Facebook SSO API call
      .pipe(
        finalize(() => {
          this.isSSOLoading = false;
          this.spinner.hide();
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (response: any) => {
          const loginUrl = response?.loginUrl ?? response?.url ?? response;

          if (loginUrl) {
            window.location.href = loginUrl;
          } else {
            this.toastr.warning('Facebook SSO URL not received.');
          }
        },
        error: (error) => {
          this.errorMessage = error?.error?.message || 'Failed to connect to Facebook SSO service.';
          this.isLoginFailed = true;
          this.toastr.error(this.errorMessage);
          console.error('❌ Facebook SSO connection failed:', error);
        }
      });
  }

  // Generic SSO method for backward compatibility
  loginWithSSO(provider: string = 'microsoft') {
    if (provider === 'google') {
      this.loginWithGoogle();
    } else if (provider === 'facebook') {
      this.loginWithFacebook();
    } else {
      this.loginWithMicrosoft();
    }
  }

  SSO(event: Event, provider: string = 'microsoft') {
    event.preventDefault();
    this.loginWithSSO(provider);
  }

  onCaptchaResolved(token: string) {
    this.token = token;
    this.loginForm.get('recaptcha')?.setValue(token);
  }
}