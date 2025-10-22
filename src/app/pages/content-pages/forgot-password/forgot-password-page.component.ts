import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from "@angular/router";
import { AuthService } from 'app/shared/auth/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-forgot-password-page',
    templateUrl: './forgot-password-page.component.html',
    styleUrls: ['./forgot-password-page.component.scss']
})
export class ForgotPasswordPageComponent implements OnInit {

    forogtPasswordForm!: FormGroup;
    forgotPasswordFormSubmitted = false;
    isLoading = false;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private toastr: ToastrService,
        private router: Router,
          private route: ActivatedRoute

    ) { }

    ngOnInit(): void {
        this.forogtPasswordForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]]
        });
    }

    get f() {
        return this.forogtPasswordForm.controls;
    }

    onSubmit() {
        this.forgotPasswordFormSubmitted = true;

        if (this.forogtPasswordForm.invalid) {
            this.toastr.warning('Please provide a valid email');
            return;
        }

        this.isLoading = true;

        const email = this.forogtPasswordForm.value.email;

        this.authService.forgetPassword(email).subscribe({
            next: (res) => {
                this.isLoading = false;

                // ✅ Store email in local storage
                localStorage.setItem('forgotEmail', email);

                this.toastr.success('Password reset email sent!');
                debugger;
                // ✅ Navigate immediately to /NewPassword
                this.router.navigate(['../NewPassword'], { relativeTo: this.route });
            },
            error: (err) => {
                this.isLoading = false;
                this.toastr.error('Unable to send reset email. Please try again.');
            }
        });
    }
}
