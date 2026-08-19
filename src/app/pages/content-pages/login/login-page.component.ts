
import { Component, OnInit, OnDestroy, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'app/shared/auth/auth.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'environments/environment';
import { LoginTurnstileProtectionService } from 'app/shared/auth/login-turnstile-protection.service';
import { Subscription, interval } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss'],
  standalone: false
})
export class LoginPageComponent implements OnInit, OnDestroy, AfterViewChecked {
  public hidePassword: boolean = true;
  loginFormSubmitted = false;
  isLoginFailed = false;
  isSSOLoading = false;
  errorMessage = '';
  captchaRequired = false;
  isLocked = false;
  lockoutRemainingText = '';
  turnstileToken: string | null = null;
  turnstileVisible = false;
  turnstileLoadError = '';
  private pendingTurnstileRender = false;
  private tokenSub?: Subscription;
  private loadErrSub?: Subscription;
  private lockoutTickSub?: Subscription;
  private blockedUntilMs = 0;

  loginForm = new UntypedFormGroup({
    username: new UntypedFormControl('', [Validators.required]),
    password: new UntypedFormControl('', [Validators.required]),
    rememberMe: new UntypedFormControl(true),
  });

  constructor(
    private router: Router,
    private authService: AuthService,
    private spinner: NgxSpinnerService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService,
    private turnstileProtection: LoginTurnstileProtectionService
  ) { }

  get lf() {
    return this.loginForm.controls;
  }

  public shouldHighlightPasswordField(): boolean {
    return this.loginFormSubmitted && this.lf.password.invalid;
  }

  ngOnInit() {
    document.body.classList.add('login-page');

    this.tokenSub = this.turnstileProtection.captchaTokenChanged$.subscribe(token => {
      this.turnstileToken = token;
    });
    this.loadErrSub = this.turnstileProtection.turnstileLoadError$.subscribe(err => {
      this.turnstileLoadError = err ?? '';
    });

    this.authService.getCaptchaConfig().subscribe(cfg => {
      const siteKey = (cfg.siteKey || environment.resolvedTurnstileSiteKey || '').trim();
      if (siteKey) {
        window.config = { ...window.config, turnstileSiteKey: siteKey };
      }
      if (cfg.enabled && siteKey) {
        this.showTurnstile();
      }
    });

    const msg = sessionStorage.getItem('authFlash');
    if (msg) {
      sessionStorage.removeItem('authFlash');
      this.toastr.warning(msg, 'Session expired', { timeOut: 10000 });
    }

    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    let refreshToken = params.get('refreshToken') ?? undefined;
    if (refreshToken) {
      refreshToken = refreshToken.replace(/ /g, '+');
    }
    const email = params.get('email');
    const userId = params.get('id');
    const username = params.get('username');
    const error = params.get('error');
    const company = params.get('company');

    if (token) {
      this.authService.setSSOSession({
        token,
        refreshToken,
        email,
        id: userId,
        username,
        vendorCompanyIds: company ? [company] : [],
      });
      this.router.navigate(['/dashboard/dashboard1'], { replaceUrl: true });
      return;
    }

    if (error) {
      this.isLoginFailed = true;
      this.errorMessage = error;
      this.cdr.detectChanges();
    }
  }

  ngAfterViewChecked(): void {
    if (this.pendingTurnstileRender && this.turnstileVisible && !this.turnstileLoadError) {
      this.pendingTurnstileRender = false;
      void this.turnstileProtection.renderTurnstile('#turnstile-container');
    }
  }

  ngOnDestroy(): void {
    document.body.classList.remove('login-page');
    this.tokenSub?.unsubscribe();
    this.loadErrSub?.unsubscribe();
    this.clearLockoutCountdown();
    this.turnstileProtection.teardownOnNoCaptchaNeeded();
  }

  private showTurnstile(): void {
    if (this.turnstileVisible) return;
    this.turnstileVisible = true;
    this.pendingTurnstileRender = true;
    this.cdr.detectChanges();
  }

  retryCaptcha(): void {
    this.turnstileLoadError = '';
    this.pendingTurnstileRender = true;
    this.turnstileProtection.resetTurnstile('#turnstile-container');
    this.cdr.detectChanges();
  }

  private startLockoutCountdown(remainingSeconds: number): void {
    const seconds = remainingSeconds > 0 ? remainingSeconds : 10 * 60;
    this.blockedUntilMs = Date.now() + seconds * 1000;
    this.lockoutTickSub?.unsubscribe();
    this.updateLockoutRemainingText();
    this.lockoutTickSub = interval(1000).subscribe(() => {
      this.updateLockoutRemainingText();
      if (Date.now() >= this.blockedUntilMs) {
        this.clearLockoutCountdown();
        this.isLocked = false;
        this.errorMessage = 'You can try logging in again.';
        this.cdr.detectChanges();
      }
    });
  }

  private clearLockoutCountdown(): void {
    this.lockoutTickSub?.unsubscribe();
    this.lockoutTickSub = undefined;
    this.blockedUntilMs = 0;
    this.lockoutRemainingText = '';
  }

  private updateLockoutRemainingText(): void {
    const totalSec = Math.max(0, Math.ceil((this.blockedUntilMs - Date.now()) / 1000));
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    this.lockoutRemainingText = `${m}:${s.toString().padStart(2, '0')}`;
    this.cdr.detectChanges();
  }

  onSubmit() {
    this.loginFormSubmitted = true;
    if (this.loginForm.invalid) return;
    if (this.isLocked) return;
    if (this.turnstileVisible && !this.turnstileLoadError && environment.resolvedTurnstileSiteKey && !this.turnstileToken) {
      this.toastr.warning('Please complete the captcha to continue.');
      return;
    }

    this.spinner.show(undefined, {
      type: 'ball-triangle-path',
      size: 'medium',
      bdColor: 'rgba(0, 0, 0, 0.8)',
      color: '#fff',
      fullScreen: true
    });

    const { username, password } = this.loginForm.value;

    this.authService
      .signinUser(username, password, this.turnstileToken)
      .pipe(finalize(() => this.spinner.hide()))
      .subscribe({
        next: () => {
          this.turnstileProtection.recordLoginSuccess();
          if (!this.authService.isAuthenticated()) {
            this.isLoginFailed = true;
            this.errorMessage = 'Login succeeded but the session was not stored. Please try again.';
            this.cdr.detectChanges();
            return;
          }
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard/dashboard1';
          this.router.navigateByUrl(returnUrl);
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.isLoginFailed = true;
          const body = err?.error;
          this.captchaRequired = !!body?.captchaRequired;
          this.isLocked = !!body?.isBlocked || err?.status === 429;
          const fromErrors = Array.isArray(body?.errors) ? body.errors[0] : null;
          const raw = typeof body === 'string' ? body : (body?.message || fromErrors);
          if (this.isLocked) {
            this.startLockoutCountdown(Number(body?.remainingSeconds ?? 0));
            this.errorMessage = raw || 'This account is temporarily locked. Please try again later.';
          } else {
            this.clearLockoutCountdown();
            this.errorMessage = raw || 'Invalid username or password';
          }
          if (this.captchaRequired || this.turnstileVisible) {
            this.showTurnstile();
            this.turnstileProtection.resetTurnstile('#turnstile-container');
          }
          this.toastr.error(this.isLocked
            ? `This account is temporarily locked. Try again in ${this.lockoutRemainingText || '—'}`
            : this.errorMessage);
          this.cdr.detectChanges();
        }
      });
  }

  rememberMe() { }

  forgotpassword() { }

  loginWithMicrosoft() {
    this.isSSOLoading = true;
    this.spinner.show();

    this.authService
      .initiateSSOLogin('microsoft')
      .pipe(finalize(() => {
        this.isSSOLoading = false;
        this.spinner.hide();
        this.cdr.detectChanges();
      }))
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
        }
      });
  }

  loginWithGoogle() {
    this.isSSOLoading = true;
    this.spinner.show();

    this.authService
      .GoogleSSOLogin()
      .pipe(finalize(() => {
        this.isSSOLoading = false;
        this.spinner.hide();
        this.cdr.detectChanges();
      }))
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
        }
      });
  }

  loginWithFacebook() {
    this.isSSOLoading = true;
    this.spinner.show();

    this.authService
      .FacebookSSOLogin()
      .pipe(finalize(() => {
        this.isSSOLoading = false;
        this.spinner.hide();
        this.cdr.detectChanges();
      }))
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
        }
      });
  }

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
}
