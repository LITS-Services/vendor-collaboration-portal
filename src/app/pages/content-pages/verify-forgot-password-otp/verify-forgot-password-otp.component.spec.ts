import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifyForgotPasswordOtpComponent } from './verify-forgot-password-otp.component';

describe('VerifyForgotPasswordOtpComponent', () => {
  let component: VerifyForgotPasswordOtpComponent;
  let fixture: ComponentFixture<VerifyForgotPasswordOtpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VerifyForgotPasswordOtpComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerifyForgotPasswordOtpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
