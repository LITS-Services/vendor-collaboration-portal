// login-page.component.ts
import { Component } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from "@angular/router";
import { AuthService } from 'app/shared/auth/auth.service';
import { NgxSpinnerService } from "ngx-spinner";

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent {
  public hidePassword: boolean = true;
  loginFormSubmitted = false;
  isLoginFailed = false;

  loginForm = new UntypedFormGroup({
    username: new UntypedFormControl( "",[Validators.required]),
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

  // On submit button click
  onSubmit() {
    this.loginFormSubmitted = true;
    if (this.loginForm.invalid) {
      return;
    }

  this.spinner.show(undefined,
      {
        type: 'ball-triangle-path',
        size: 'medium',
        bdColor: 'rgba(0, 0, 0, 0.8)',
        color: '#fff',
        fullScreen: true
      });

    // 🔹 Use API login method (sgninUser)
    this.authService.sgninUser(
      this.loginForm.value.username!,
      this.loginForm.value.password!
    ).subscribe({
      next: (res) => {
        this.spinner.hide();

        // Example: store JWT token if returned from API
        if (res && res.token) {
          localStorage.setItem('token', res.token);
        }

        this.router.navigate(['/dashboard/dashboard1']);
      },
      error: (err) => {
        this.isLoginFailed = true;
        this.spinner.hide();
        console.error('Login failed:', err);
      }
    });
  }

  rememberMe() { }

  forgotpassword() { }

  SSO(event: Event) { }
}
