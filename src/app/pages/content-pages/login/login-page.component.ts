import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from "@angular/router";
import { AuthService } from 'app/shared/auth/auth.service';
import { NgxSpinnerService } from "ngx-spinner";

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
    private route: ActivatedRoute
  ) { }

  get lf() {
    return this.loginForm.controls;
  }

  public shouldHighlightPasswordField(): boolean {
    return this.loginFormSubmitted && this.lf.password.invalid;
  }

  ngOnInit() {
  console.log("Full URL:", window.location.href);

  // 👇 Handle SSO redirect callback
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  const email = params.get('email');
  const userId = params.get('id'); 
  const username = params.get('username')
  const error = params.get('error');

  if (token) {
    console.log("Token found in URL:", token);
    localStorage.setItem('token', token);
    if (email) localStorage.setItem('userEmail', email);
    if (userId) localStorage.setItem('userId', userId); 
    if (username) localStorage.setItem('username', username); 

    this.router.navigate(['/dashboard/dashboard1'], { replaceUrl: true });
    return;
  }

  if (error) {
    this.isLoginFailed = true;
    this.errorMessage = error;
    console.log('Error from URL:', error);
    return;
  }
}


  // 🔹 Normal login
  onSubmit() {
    this.loginFormSubmitted = true;
    if (this.loginForm.invalid) {
      return;
    }

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
        
        // Save the username for future use (e.g., displaying on the dashboard)
        localStorage.setItem('username', this.loginForm.value.username!);

        this.router.navigate(['/dashboard/dashboard1']);
      },
      error: (err) => {
        this.isLoginFailed = true;
        this.spinner.hide();
        this.errorMessage = err?.error?.message || 'Login failed. Check your credentials.';
        console.error('Login failed:', err);
      }
    });
  }

  rememberMe() { }

  forgotpassword() { }

  // 🔹 SSO login methods
  loginWithSSO() {
    this.isSSOLoading = true;

    this.authService.initiateSSOLogin('').subscribe({
      next: (response: any) => {
        this.isSSOLoading = false;
        if (response.loginUrl) {
          window.location.href = response.loginUrl;  // 👈 redirect directly
        }
      },
      error: () => {
        this.isSSOLoading = false;
        this.errorMessage = 'Failed to connect to SSO service.';
        this.isLoginFailed = true;
      }
    });
  }

  SSO(event: Event) {
    event.preventDefault();
    this.loginWithSSO();
  }
}
