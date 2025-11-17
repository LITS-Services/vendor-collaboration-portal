import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerModule } from 'ngx-spinner';

import { ContentPagesRoutingModule } from "./content-pages-routing.module";

import { ComingSoonPageComponent } from "./coming-soon/coming-soon-page.component";
import { ErrorPageComponent } from "./error/error-page.component";
import { ForgotPasswordPageComponent } from "./forgot-password/forgot-password-page.component";
import { LockScreenPageComponent } from "./lock-screen/lock-screen-page.component";
import { LoginPageComponent } from "./login/login-page.component";
import { MaintenancePageComponent } from "./maintenance/maintenance-page.component";
import { RegisterPageComponent } from "./register/register-page.component";
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { RegisterVendorComponent } from './register-vendor/register-vendor.component';
import { OtpComponent } from './otp/otp.component';
import { NgSelectModule } from '@ng-select/ng-select'; // <-- Import this
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { VerifyForgotPasswordOtpComponent } from './verify-forgot-password-otp/verify-forgot-password-otp.component';
import { MainLayoutComponent } from './main-layout/main-layout.component';
import { NgHcaptchaModule } from 'ng-hcaptcha';
import { NgOtpInputModule } from 'ng-otp-input';
import { RECAPTCHA_SETTINGS, RecaptchaFormsModule, RecaptchaModule, RecaptchaSettings } from 'ng-recaptcha';
import { environment } from 'environments/environment';

// import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, "./assets/i18n/", ".json");
}

@NgModule({
  imports: [
    CommonModule,
    ContentPagesRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    NgSelectModule,
    NgxIntlTelInputModule,
    BsDropdownModule.forRoot(),
    // NgxIntlTelInputModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
      }
    }),
    NgxSpinnerModule,
    NgHcaptchaModule.forRoot({ siteKey: '1b1afe16-c082-4211-accf-2921906c959b' }),
    NgOtpInputModule,
    RecaptchaFormsModule,
    RecaptchaModule,
  ],
  providers: [
    {
      provide: RECAPTCHA_SETTINGS,
      useValue: {
        siteKey: environment.recaptcha.siteKey,
      } as RecaptchaSettings,
    },
  ],
  declarations: [
    ComingSoonPageComponent,
    ErrorPageComponent,
    ForgotPasswordPageComponent,
    LockScreenPageComponent,
    LoginPageComponent,
    RegisterVendorComponent,
    MaintenancePageComponent,
    RegisterPageComponent,
    OtpComponent,
    VerifyForgotPasswordOtpComponent,
    MainLayoutComponent,

  ]
})
export class ContentPagesModule { }
