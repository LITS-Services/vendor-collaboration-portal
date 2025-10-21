import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from "@angular/router";
import { AuthService } from 'app/shared/auth/auth.service';
import { NgxSpinnerService } from "ngx-spinner";
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent implements OnInit {
  
  public hidePassword: boolean = true;
  loginFormSubmitted = false;
  isLoginFailed = false;
  isSSOLoading = false;
  errorMessage = '';

  loginForm = new UntypedFormGroup({
    username: new UntypedFormControl("", [Validators.required]),
    password: new UntypedFormControl("", [Validators.required]),
    rememberMe: new UntypedFormControl(true)
  });

  constructor(
    private router: Router,
    private authService: AuthService,
    private spinner: NgxSpinnerService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,   // 👈 Added ChangeDetectorRef
    private toastr: ToastrService       
  ) {}

  get lf() {
    return this.loginForm.controls;
  }

  public shouldHighlightPasswordField(): boolean {
    return this.loginFormSubmitted && this.lf.password.invalid;
  }

  // 🔹 Initialization
  ngOnInit() {
          const msg = sessionStorage.getItem('authFlash');
            if (msg) {
                sessionStorage.removeItem('authFlash');
                this.toastr.warning(msg, 'Session expired', { timeOut: 10000 });
            }
    console.log("Full URL:", window.location.href);

    // 👇 Handle SSO redirect callback
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

    if (token) {
      console.log("✅ Token found in URL:", token);
      localStorage.setItem('token', token);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      if (email) localStorage.setItem('userEmail', email);
      if (userId) localStorage.setItem('userId', userId);
      if (username) localStorage.setItem('username', username);

      this.router.navigate(['/dashboard/dashboard1'], { replaceUrl: true });
      return;
    }

    if (error) {
      this.isLoginFailed = true;
      this.errorMessage = error;
      console.error('❌ Error from URL:', error);
      this.cdr.detectChanges(); // 👈 update UI after error
      return;
    }
  }

  // 🔹 Normal login
  onSubmit() {
    this.loginFormSubmitted = true;
    if (this.loginForm.invalid) return;

    // Show Spinner
    this.spinner.show(undefined, {
      type: 'ball-triangle-path',
      size: 'medium',
      bdColor: 'rgba(0, 0, 0, 0.8)',
      color: '#fff',
      fullScreen: true
    });

    this.authService.sgninUser(
      this.loginForm.value.username!,
      this.loginForm.value.password!
    ).subscribe({
      next: (res) => {
        this.spinner.hide();

        if (res && res.token) {
          localStorage.setItem('token', res.token);
        }
        if (res && res.userId) {
          localStorage.setItem('userId', res.userId);
        }

        // Save username for dashboard/navbar
        localStorage.setItem('username', this.loginForm.value.username!);

        console.log("✅ Login successful");
        this.router.navigate(['/dashboard/dashboard1']);

        this.cdr.detectChanges();  // 👈 Force UI update after login
      },
      error: (err) => {
        this.spinner.hide();
        this.isLoginFailed = true;
        this.errorMessage = err?.error?.message || 'Login failed. Check your credentials.';
        console.error('❌ Login failed:', err);

        this.cdr.detectChanges();  
      }
    });
  }

  rememberMe() {}

  forgotpassword() {}

  loginWithSSO() {
    this.isSSOLoading = true;

    this.authService.initiateSSOLogin('').subscribe({
      next: (response: any) => {
        this.isSSOLoading = false;
        if (response.loginUrl) {
          console.log("🔗 Redirecting to SSO:", response.loginUrl);
          window.location.href = response.loginUrl;
        }
        this.cdr.detectChanges();  
      },
      error: () => {
        this.isSSOLoading = false;
        this.errorMessage = 'Failed to connect to SSO service.';
        this.isLoginFailed = true;
        console.error('❌ SSO connection failed');

        this.cdr.detectChanges();  
      }
    });
  }

  SSO(event: Event) {
    event.preventDefault();
    this.loginWithSSO();
  }
}
