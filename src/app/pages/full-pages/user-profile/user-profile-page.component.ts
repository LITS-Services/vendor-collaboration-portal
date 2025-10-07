import {
  Component, ViewChild, OnInit, OnDestroy, Inject, Renderer2, ChangeDetectorRef, AfterViewInit
} from '@angular/core';
import { Subscription } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfigService } from 'app/shared/services/config.service';
import { LayoutService } from 'app/shared/services/layout.service';
import { SwiperDirective, SwiperConfigInterface } from 'ngx-swiper-wrapper';
import { CompanyService } from 'app/shared/services/company.service';
import { ToastrService } from 'ngx-toastr'; // 👈 toastr

@Component({
  selector: 'app-user-profile-page',
  templateUrl: './user-profile-page.component.html',
  styleUrls: ['./user-profile-page.component.scss']
})
export class UserProfilePageComponent implements OnInit, AfterViewInit, OnDestroy {

  public config: any = {};
  layoutSub!: Subscription;

  userProfileForm: FormGroup;
  profileImage: string | ArrayBuffer | null = null;

  showPasswordResetPopup = false;
  passwordResetForm: FormGroup;

  showOldPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

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
    private toastr: ToastrService
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
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });
  }

  ngOnInit() {
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

    this.companyService.GetVendoruserByid(userId).subscribe({
      next: (res: any) => {
        const userData = res.$values ? res.$values[0] : res;
        this.userProfileForm.patchValue({
          fullName: userData.fullName,
          email: userData.email
        });
        this.profileImage = userData.profilePicture || null;

        this.cdr.detectChanges(); // 🔹 after API response
      },
      error: err => console.error('Error loading user profile:', err)
    });
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.profileImage = reader.result;
        this.cdr.detectChanges(); // 🔹 update UI after file load
      };
      reader.readAsDataURL(file);
    }
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

    this.companyService.resetPassword(payload).subscribe({
      next: () => {
        this.toastr.success('Password reset successful!');
        this.closePasswordResetPopup();
        this.cdr.detectChanges(); // 🔹 after API response
      },
      error: () => {
        this.toastr.error('Failed to reset password. Please try again.');
        this.cdr.detectChanges(); // 🔹 after API error
      }
    });
  }
}
