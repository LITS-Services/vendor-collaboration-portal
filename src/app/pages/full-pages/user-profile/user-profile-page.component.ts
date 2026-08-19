import {
  Component, ViewChild, OnInit, OnDestroy, Inject, Renderer2, ChangeDetectorRef, AfterViewInit
} from '@angular/core';
import { Subscription } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { newPasswordValidators } from 'app/shared/auth/password.validators';
import { ConfigService } from 'app/shared/services/config.service';
import { LayoutService } from 'app/shared/services/layout.service';
import { SwiperDirective, SwiperConfigInterface } from 'ngx-swiper-wrapper';
import { CompanyService } from 'app/shared/services/company.service';
import { ToastrService } from 'ngx-toastr'; // 👈 toastr
import { Router } from '@angular/router';
import { UserServiceService } from 'app/shared/services/user-service.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-user-profile-page',
  templateUrl: './user-profile-page.component.html',
  styleUrls: ['./user-profile-page.component.scss'],
  standalone: false
})
export class UserProfilePageComponent implements OnInit, AfterViewInit, OnDestroy {

  public config: any = {};
  layoutSub!: Subscription;

  userProfileForm: FormGroup;
  // profileImage: string | ArrayBuffer | null = null;
  public profileImage: string = 'assets/img/profile/user.png';

  showPasswordResetPopup = false;
  passwordResetForm: FormGroup;

  showOldPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;
  hidePassword: boolean = true;
  hideOldPassword: boolean = true;
  hideConfirmPassword: boolean = true;
  activeTab: 'details' | 'password' = 'password'; // default active tab

  vendorAccountNumber = '';
  public swipeConfig: SwiperConfigInterface = {
    slidesPerView: 'auto',
    centeredSlides: false,
    spaceBetween: 15
  };

  @ViewChild(SwiperDirective, { static: false }) directiveRef?: SwiperDirective;

  constructor(
    private configService: ConfigService,
    private layoutService: LayoutService,
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    private companyService: CompanyService,
    private toastr: ToastrService,
    private router: Router,
    private userService: UserServiceService,
    private spinner: NgxSpinnerService
  ) {
    this.config = this.configService.templateConf;

    this.userProfileForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: [''],
      confirmPassword: ['']
    });

    this.passwordResetForm = this.fb.group({
      oldPassword: ['', Validators.required],
      newPassword: ['', newPasswordValidators],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  passwordMatchValidator(g: FormGroup) {
    const oldPassword = g.get('oldPassword')?.value;
    const newPassword = g.get('newPassword')?.value;
    const confirmPassword = g.get('confirmPassword')?.value;

    const errors: any = {};
    if (newPassword && oldPassword && newPassword === oldPassword) {
      errors.sameAsOld = true;
    }
    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      errors.passwordMismatch = true;
    }
    return Object.keys(errors).length > 0 ? errors : null;
  }

  ngOnInit() {
    this.activeTab = 'details';
    this.generateVendorAccountNumber();
    this.cdr.detectChanges();
    this.loadUserProfile();

    this.layoutSub = this.configService.templateConf$.subscribe(conf => {
      if (conf) this.config = conf;
      this.cdr.markForCheck();
    });
  }

  ngAfterViewInit() {
    let conf = this.config;
    conf.layout.sidebar.collapsed = true;
    this.configService.applyTemplateConfigChange({ layout: conf.layout });
  }

  ngOnDestroy() {
    let conf = this.config;
    conf.layout.sidebar.collapsed = false;
    this.configService.applyTemplateConfigChange({ layout: conf.layout });
    if (this.layoutSub) this.layoutSub.unsubscribe();
  }

  // Navigate back to dashboard
  homePage() {
    this.router.navigate(['/dashboard/dashboard1']);
  }

  generateVendorAccountNumber() {
    const storedSequence = localStorage.getItem('vendorSequence');
    let sequenceNumber = storedSequence ? parseInt(storedSequence, 10) : 0;
    sequenceNumber += 1;
    this.vendorAccountNumber = `lits-vcp-vendor-${sequenceNumber.toString().padStart(5, '0')}`;
    localStorage.setItem('vendorSequence', sequenceNumber.toString());
  }

  loadUserProfile() {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    this.spinner.show();
    this.companyService
      .GetVendoruserByid(userId)
      .pipe(finalize(() => { this.spinner.hide(); }))
      .subscribe({
        next: (res: any) => {
          const userData = res.$values ? res.$values[0] : res;
          this.userProfileForm.patchValue({
            fullName: userData.fullName,
            email: userData.email,
            vendorNo: userData.vendorNo
          });

          if (userData.profilePicture) {
            this.profileImage = this.formatBase64Image(userData.profilePicture);
          }
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error loading user profile:', err);
        }
      });
  }

  // onImageSelected(event: any) {
  //   const file = event.target.files[0];
  //   if (file) {
  //     const reader = new FileReader();
  //     reader.onload = (e) => {
  //       this.profileImage = e.target?.result as string;
  //       this.cdr.detectChanges(); // 🔹 update UI after file load
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // }


  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      this.profileImage = e.target?.result as string;
      this.cdr.detectChanges();

      const userId = localStorage.getItem('userId');
      if (!userId) {
        this.toastr.error('User ID not found. Please login again.');
        return;
      }

      const payload = {
        userId,
        fullName: this.userProfileForm.get('fullName')?.value,
        profilePicture: this.profileImage || ''
      };

      this.spinner.show();
      // this.userService.updateProfilePicture(this.profileImage);
      this.companyService.updateVendoruser(userId, payload)
        .pipe(finalize(() => this.spinner.hide()))
        .subscribe({
          next: (res: string) => {
            this.userService.updateProfilePicture(this.profileImage);
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error('Profile update error:', err);
            this.toastr.error('Failed to update profile picture. Please try again.');
            this.cdr.detectChanges();
          }
        });
    };

    reader.readAsDataURL(file);
  }


  resetForm() {
    this.userProfileForm.reset();
    this.profileImage = null;
    this.cdr.detectChanges(); // 🔹 update UI
  }

  saveProfile() {
    if (!this.userProfileForm.valid) {
      this.toastr.error('Please fill in all required fields correctly.');
      return;
    }

    const userId = localStorage.getItem('userId');
    if (!userId) {
      this.toastr.error('User ID not found. Please login again.');
      return;
    }

    const payload = {
      userId,
      fullName: this.userProfileForm.get('fullName')?.value,
      profilePicture: this.profileImage || ''
    };

    this.companyService.updateVendoruser(userId, payload).subscribe({
      next: res => {
        this.toastr.success('Profile updated successfully!');
        this.cdr.detectChanges(); // 🔹 after API response
      },
      error: err => {
        this.toastr.error('Failed to update profile. Please try again.');
        this.cdr.detectChanges(); // 🔹 after API error
      }
    });
  }

  openPasswordResetPopup() {
    this.passwordResetForm.reset();
    this.showPasswordResetPopup = true;
    this.cdr.detectChanges(); // 🔹 open popup immediately
  }

  closePasswordResetPopup() {
    this.showPasswordResetPopup = false;
    this.cdr.detectChanges(); // 🔹 close popup immediately
  }

  togglePassword(field: string) {
    if (field === 'old') this.showOldPassword = !this.showOldPassword;
    if (field === 'new') this.showNewPassword = !this.showNewPassword;
    if (field === 'confirm') this.showConfirmPassword = !this.showConfirmPassword;
    this.cdr.detectChanges(); // 🔹 update icon visibility
  }

  submitPasswordReset() {
    if (this.passwordResetForm.invalid) {
      this.toastr.error('Please fill all fields correctly.');
      return;
    }

    const { oldPassword, newPassword, confirmPassword } = this.passwordResetForm.value;

    if (newPassword !== confirmPassword) {
      this.toastr.warning('New password and confirmation do not match!');
      return;
    }

    const userId = localStorage.getItem('userId');
    if (!userId) {
      this.toastr.error('User ID not found. Please login again.');
      return;
    }

    const payload = { userId, oldPassword, newPassword };

    this.spinner.show();

    this.companyService
      .resetPassword(payload)
      .pipe(
        finalize(() => {
          this.spinner.hide();
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (res: any) => {
          const successMsg = res?.message || 'Password reset successful!';
          this.toastr.success(successMsg);

          this.passwordResetForm.reset();
          this.activeTab = 'details';
          this.closePasswordResetPopup();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Password reset error:', err);
          const errorMsg = err?.error?.message || err?.message || 'Failed to reset password. Please try again.';
          this.toastr.error(errorMsg);
          this.cdr.detectChanges();
        }
      });
  }

  togglePasswordVisibility(field: string) {
    switch (field) {
      case 'password':
        this.hidePassword = !this.hidePassword;
        break;
      case 'oldPassword':
        this.hideOldPassword = !this.hideOldPassword;
        break;
      case 'confirmPassword':
        this.hideConfirmPassword = !this.hideConfirmPassword;
        break;
    }
  }

  private formatBase64Image(base64: string): string {
    if (!base64 || base64.startsWith('data:image') || base64.startsWith('assets/')) {
      return base64 || 'assets/img/profile/user.png';
    }
    // Default to png, but browser usually auto-detects if it's actually jpeg/etc
    return `data:image/png;base64,${base64}`;
  }
}
