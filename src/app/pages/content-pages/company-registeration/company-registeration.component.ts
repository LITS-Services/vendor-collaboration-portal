import { DOCUMENT } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, OnInit, Renderer2, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CompanyAddressModalComponent } from 'app/pages/full-pages/company-address-modal/company-address-modal.component';
import { CompanyContactModalComponent } from 'app/pages/full-pages/company-contact-modal/company-contact-modal.component';
import { CompanyProfileAttachmentComponent } from 'app/pages/full-pages/company-profile-attachment/company-profile-attachment.component';
import { ConfigService } from 'app/shared/services/config.service';
import { LayoutService } from 'app/shared/services/layout.service';
import { SwiperConfigInterface, SwiperDirective } from 'ngx-swiper-wrapper';
import { Subscription } from 'rxjs';
import { CompanyService } from 'app/shared/services/company.service';

@Component({
  selector: 'app-company-registeration',
  templateUrl: './company-registeration.component.html',
  styleUrls: ['./company-registeration.component.scss']
})
export class CompanyRegisterationComponent implements OnInit {
  public config: any = {};
  layoutSub: Subscription;

  // ===== DATA =====
  addressList: any[] = [];
  contactList: any[] = [];
  attachedFiles: any[] = [];
  vendorAccountNumber: string = '';
  isLoading: boolean = false;

  // Delete modal states
  showContactDeletePopup: boolean = false;
  showAddressDeletePopup: boolean = false;
  contactIndexToDelete: number | null = null;
  addressIndexToDelete: number | null = null;

  // ===== FORM FIELDS =====
  aboutCompany: string = '';
  companyType: string = 'Organization';
  paymentPriority: string = '';
  companyName: string = '';
  searchName: string = '';
  group: string = '';
  numEmployees: number | null = null;
  organizationNumber: number | null = null;
  abcCode: string = '';
  dunsNumber: string = '';
  registrationNumber: number | null = null;
  taxNumber: number | null = null;
  addressBook: string = '';
  knownAs: string = '';
  phoneticName: string = '';
  primaryCurrency: string = '';
  vendorCategory: string = '';
  lineOfBusiness: string = '';
  birthCountry: string = '';
  employeeResponsible: string = '';
  segment: string = '';
  speciality: string = '';
  chain: string = '';
  note: string = '';
  vendorUserId: string = ''; // <-- will be loaded from localStorage

  public swipeConfig: SwiperConfigInterface = {
    slidesPerView: 'auto',
    centeredSlides: false,
    spaceBetween: 15
  };

  @ViewChild(SwiperDirective, { static: false }) directiveRef?: SwiperDirective;

  constructor(
    private configService: ConfigService,
    private modalService: NgbModal,
    private layoutService: LayoutService,
    @Inject(DOCUMENT) private document: Document, 
    private renderer: Renderer2,
    private cdr: ChangeDetectorRef,
    private companyService: CompanyService,
    private router: Router
  ) {
    this.config = this.configService.templateConf;
  }

  ngOnInit() {
    // ✅ Load vendorUserId from localStorage (set during login)
    const storedVendorUserId = localStorage.getItem('vendorUserId');
    this.vendorUserId = storedVendorUserId || '';

    // Fallback: also check if passed in navigation state
    const state = history.state;
    if (!this.vendorUserId && state.vendorUserId) {
      this.vendorUserId = state.vendorUserId;
    }

    // If vendorUserId is missing, force redirect to login
    if (!this.vendorUserId) {
      alert('Vendor not found! Redirecting to login.');
      this.router.navigate(['/auth/login']);
      return;
    }

    this.generateVendorAccountNumber();
    this.cdr.detectChanges();

    this.layoutSub = this.configService.templateConf$.subscribe((templateConf) => {
      if (templateConf) this.config = templateConf;
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

  goBack() {
    this.router.navigate(['/company/company-master']);
  }

  generateVendorAccountNumber(): void {
    const storedSequence = localStorage.getItem('vendorSequence');
    let sequenceNumber = storedSequence ? parseInt(storedSequence, 10) : 0;
    sequenceNumber += 1;
    this.vendorAccountNumber = `lits-vcp-vendor-${sequenceNumber.toString().padStart(5, '0')}`;
    localStorage.setItem('vendorSequence', sequenceNumber.toString());
  }

  // ===== ADDRESS LOGIC =====
  openAddressModal() {
    const modalRef = this.modalService.open(CompanyAddressModalComponent, { centered: true });
    modalRef.componentInstance.addAddress.subscribe((address) => this.addAddress(address));
  }

  editAddress(index: number) {
    const modalRef = this.modalService.open(CompanyAddressModalComponent, { centered: true });
    modalRef.componentInstance.address = { ...this.addressList[index] };
    modalRef.componentInstance.isEditAddressMode = true;
    modalRef.componentInstance.saveAddress.subscribe((updatedAddress: any) => {
      this.addressList[index] = updatedAddress;
      this.cdr.markForCheck();
    });
  }

  confirmAddressDeletion(index: number) {
    this.showAddressDeletePopup = true;
    this.addressIndexToDelete = index;
  }

  closeAddressPopup() {
    this.showAddressDeletePopup = false;
    this.addressIndexToDelete = null;
  }

  removeAddress(index: number) {
    this.addressList.splice(index, 1);
    this.closeAddressPopup();
  }

  addAddress(address: any) {
    this.addressList.push(address);
  }

  getAddressesForPayload() {
    return this.addressList.map(a => ({
      street: a.street,
      city: a.city,
      state: a.state,
      zip: a.zip,
      country: a.country,
      isPrimary: a.isPrimary || false
    }));
  }

  // ===== CONTACT LOGIC =====
  openContactModal() {
    const modalRef = this.modalService.open(CompanyContactModalComponent, { centered: true });
    modalRef.componentInstance.addContact.subscribe((contact) => this.addContact(contact));
  }

  editContact(index: number) {
    const modalRef = this.modalService.open(CompanyContactModalComponent, { centered: true });
    modalRef.componentInstance.contact = { ...this.contactList[index] };
    modalRef.componentInstance.isEditMode = true;
    modalRef.componentInstance.saveContact.subscribe((updatedContact: any) => {
      this.contactList[index] = updatedContact;
      this.cdr.markForCheck();
    });
  }

  addContact(contact: any) {
    this.contactList.push(contact);
  }

  confirmContactDeletion(index: number) {
    this.showContactDeletePopup = true;
    this.contactIndexToDelete = index;
  }

  closeContactPopup() {
    this.showContactDeletePopup = false;
    this.contactIndexToDelete = null;
  }

  removeContact(index: number) {
    this.contactList.splice(index, 1);
    this.closeContactPopup();
  }

  getContactsForPayload() {
    return this.contactList.map(c => ({
      description: c.description,
      type: c.type,
      contactNumber: c.contactNumber,
      extension: c.extension || '',
      isPrimary: c.isPrimary || false
    }));
  }

  // ===== ATTACHMENT LOGIC =====
  openAttachmentModal() {
    const modalRef = this.modalService.open(CompanyProfileAttachmentComponent, { centered: true });
    modalRef.componentInstance.attachedFiles = [...this.attachedFiles];
    modalRef.componentInstance.saveAttachment.subscribe((updatedFiles: any[]) => {
      this.attachedFiles = [...updatedFiles];
    });
  }

  saveAttachments() {
    console.log('Final Attached Files:', this.attachedFiles);
  }

  // ===== PAYLOAD PREPARATION =====
  getPurchasingDemographicsPayload() {
    return {
      primaryCurrency: this.primaryCurrency,
      vendorType: this.vendorCategory,
      lineOfBusiness: this.lineOfBusiness,
      birthCountry: this.birthCountry,
      employeeResponsible: this.employeeResponsible,
      segment: this.segment,
      speciality: this.speciality,
      chain: this.chain,
      note: this.note
    };
  }

  // ===== FORM SUBMISSION =====
  submitForm() {
    // ✅ Always refresh vendorUserId from localStorage before submit
    const storedVendorUserId = localStorage.getItem('vendorUserId');
    this.vendorUserId = storedVendorUserId || this.vendorUserId;

    if (!this.vendorUserId) {
      alert('Vendor ID missing! Please login again.');
      this.router.navigate(['/auth/login']);
      return;
    }

    const payload = {
      vendorUserId: this.vendorUserId, 
      vendorCompany: {
        name: this.companyName,
        vendorId: this.vendorUserId, 
        logo: '', // optional logo
        status: 'Inprogress',
        addresses: this.getAddressesForPayload(),
        contacts: this.getContactsForPayload(),
        purchasingDemographics: this.getPurchasingDemographicsPayload()
      }
    };

    console.log('Final Payload:', payload);

    this.isLoading = true;

    this.companyService.registerCompany(payload).subscribe({
      next: (response) => {
        console.log('Company Registered Successfully:', response);
        this.isLoading = false;
        alert('Company Registered Successfully!');
        this.router.navigate(['company/company-master']); 
      },
      error: (error) => {
        console.error('Error registering company:', error);
        this.isLoading = false;
        alert('Error registering company!');
      }
    });
  }
}
