import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ComingSoonPageComponent } from "./coming-soon/coming-soon-page.component";
import { ErrorPageComponent } from "./error/error-page.component";
import { ForgotPasswordPageComponent } from "./forgot-password/forgot-password-page.component";
import { LockScreenPageComponent } from "./lock-screen/lock-screen-page.component";
import { LoginPageComponent } from "./login/login-page.component";
import { MaintenancePageComponent } from "./maintenance/maintenance-page.component";
import { RegisterPageComponent } from "./register/register-page.component";
import { RegisterVendorComponent } from './register-vendor/register-vendor.component';
import { OtpComponent } from './otp/otp.component';
import { VerifyForgotPasswordOtpComponent } from './verify-forgot-password-otp/verify-forgot-password-otp.component';
import { MainLayoutComponent } from './main-layout/main-layout.component';
import { GuestGuard } from 'app/shared/auth/guest.guard';


const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: 'comingsoon',
        component: ComingSoonPageComponent,
        data: {
          title: 'Coming Soon page'
        }
      },
      {
        path: 'error',
        component: ErrorPageComponent,
        data: {
          title: 'Error Page'
        }
      },
      {
        path: 'forgotpassword',
        component: ForgotPasswordPageComponent,
        canActivate: [GuestGuard],
        data: {
          title: 'Forgot Password Page'
        }
      },
      {
        path: 'NewPassword',
        component: VerifyForgotPasswordOtpComponent,
        canActivate: [GuestGuard],
        data: {
          title: 'New Password'
        }
      },
      {
        path: 'lockscreen',
        component: LockScreenPageComponent,
        data: {
          title: 'Lock Screen page'
        }
      },
      {
        path: 'login',
        component: LoginPageComponent,
        canActivate: [GuestGuard],
        data: {
          title: 'Login Page'
        }
      },
      {
        path: 'maintenance',
        component: MaintenancePageComponent,
        data: {
          title: 'Maintenance Page'
        }
      },
      {
        path: 'register',
        component: RegisterPageComponent,
        canActivate: [GuestGuard],
        data: {
          title: 'Register Page'
        }
      },
      {
        path: 'registeration',
        component: RegisterVendorComponent,
        canActivate: [GuestGuard],
        data: {
          title: 'Vendor Registeration'
        }
      },
      {
        path: 'otp',
        component: OtpComponent,
        canActivate: [GuestGuard],
        data: {
          title: 'OTP Verification'
        }
      }

    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ContentPagesRoutingModule { }
