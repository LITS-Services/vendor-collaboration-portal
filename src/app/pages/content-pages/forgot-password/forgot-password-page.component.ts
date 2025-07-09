import { Component, ViewChild } from '@angular/core';
import { NgForm, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from "@angular/router";

@Component({
    selector: 'app-forgot-password-page',
    templateUrl: './forgot-password-page.component.html',
    styleUrls: ['./forgot-password-page.component.scss']
})

export class ForgotPasswordPageComponent {
    @ViewChild('f') forogtPasswordForm: NgForm;
    public hidePassword: boolean = true;
    forgotPasswordFormSubmitted = false;
    isLoginFailed = false;
    public shouldHighlightPasswordField(): boolean {
      return this.forgotPasswordFormSubmitted && this.lf.passwordHash.invalid;
    }
    loginForm = new UntypedFormGroup({
      username: new UntypedFormControl('guest@apex.com', [Validators.required]),
      password: new UntypedFormControl('Password', [Validators.required]),
      rememberMe: new UntypedFormControl(true)
    });
  
    constructor(private router: Router,
        private route: ActivatedRoute) { }
        get lf() {
            return this.loginForm.controls;
          }
    // On submit click, reset form fields
    onSubmit() {
        this.forogtPasswordForm.reset();
    }

    // On login link click
    onLogin() {
        this.router.navigate(['login'], { relativeTo: this.route.parent });
    }

    // On registration link click
    onRegister() {
        this.router.navigate(['register'], { relativeTo: this.route.parent });
    }
}
