import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from "@angular/router";
import { AuthService } from 'app/shared/auth/auth.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs/operators';

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
        private route: ActivatedRoute,
        private spinner: NgxSpinnerService


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

        const email = this.forogtPasswordForm.value.email;
        this.spinner.show(); // show spinner before API call

        this.authService
            .forgetPassword(email)
            .pipe(
                finalize(() => {
                    this.spinner.hide(); // hide spinner whether success or error
                })
            )
            .subscribe({
                next: (res) => {
                    localStorage.setItem('forgotEmail', email);
                    // this.toastr.success('Password reset email sent!');
                    this.router.navigate(['../otp'], {
                        relativeTo: this.route,
                        queryParams: { resetOtp: true }
                    });
                },
                error: (err) => {
                    this.toastr.error('Unable to send reset email. Please try again.');
                }
            });
    }
}
