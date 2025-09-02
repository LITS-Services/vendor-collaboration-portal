import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, Validators, UntypedFormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'app/shared/auth/auth.service'; // ✅ adjust path
import { MustMatch } from '../../../shared/directives/must-match.validator';

@Component({
  selector: 'app-register-page',
  templateUrl: './register-page.component.html',
  styleUrls: ['./register-page.component.scss']
})
export class RegisterPageComponent implements OnInit {
  registerFormSubmitted = false;
  registerForm: UntypedFormGroup;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private authService: AuthService   // ✅ Inject service
  ) {
    this.registerForm = this.formBuilder.group({});
  }

  ngOnInit() {
    this.registerForm = this.formBuilder.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      acceptTerms: [false, Validators.requiredTrue]
    }, {
      validator: MustMatch('password', 'confirmPassword')
    });
  }

  get rf() {
    return this.registerForm.controls;
  }

  onSubmit() {
    this.registerFormSubmitted = true;
    if (this.registerForm.invalid) {
      return;
    }

    // prepare payload
    const payload = {
      name: this.rf['name'].value,
      email: this.rf['email'].value,
      password: this.rf['password'].value
    };

    // ✅ call API
    this.authService.registerUser(payload).subscribe({
      next: (res) => {
        console.log('Registration successful', res);
        this.router.navigate(['/pages/login']);
      },
      error: (err) => {
        console.error('Registration failed', err);
      }
    });
  }
}
