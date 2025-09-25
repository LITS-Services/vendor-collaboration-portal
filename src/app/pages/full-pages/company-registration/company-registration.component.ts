import { DOCUMENT } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CompanyService } from 'app/shared/services/company.service';
import { ConfigService } from 'app/shared/services/config.service';
import { LayoutService } from 'app/shared/services/layout.service';
import { SwiperConfigInterface, SwiperDirective } from 'ngx-swiper-wrapper';
import { Subscription } from 'rxjs';
import { CompanyContactModalComponent } from '../company-contact-modal/company-contact-modal.component';
import { CompanyAddressModalComponent } from '../company-address-modal/company-address-modal.component';
import { CompanyProfileAttachmentComponent } from '../company-profile-attachment/company-profile-attachment.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-company-registration',
  templateUrl: './company-registration.component.html',
  styleUrls: ['./company-registration.component.scss']
})
export class CompanyRegistrationComponent implements OnInit {
  public config: any = {};
  layoutSub: Subscription;
  isEditMode: boolean = false;

  // ===== DATA =====
  addressList: any[] = [];
  contactList: any[] = [];
  attachedFiles: any[] = [];
  vendorAccountNumber: string = '';
  isLoading: boolean = false;
  companyId: number | null = null;
  remarks: string = '';

  // Procurement companies
  procurementCompanies: any[] = [];
  selectedprocurementCompanyGUID: string[] = [];
  dropdownOpen: boolean = false;

  // Delete modal states
  showContactDeletePopup: boolean = false;
  showAddressDeletePopup: boolean = false;
  contactIndexToDelete: number | null = null;
  addressIndexToDelete: number | null = null;

  // ===== FORM FIELDS =====
  aboutCompany: string = '';
  companyType: string = 'Organization';
  companyName: string = '';
  primaryCurrency: string = '';
  vendorCategory: string = '';
  lineOfBusiness: string = '';
  birthCountry: string = '';
  employeeResponsible: string = '';
  segment: string = '';
  speciality: string = '';
  chain: string = '';
  note: string = '';
  userId: string = '';

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
    private router: Router,
    private route: ActivatedRoute,
     private toastr: ToastrService 
  ) {
    this.config = this.configService.templateConf;
  }

  ngOnInit() {
    this.userId = localStorage.getItem('userId') || '';

    if (!this.userId) {
    this.toastr.warning('Vendor not found! Redirecting to login.', 'Warning');
      this.router.navigate(['../']);
      return;
    }

    // Load companyId from query params
    this.route.queryParams.subscribe(params => {
      if (params['id']) {
        this.companyId = +params['id'];
        this.loadCompanyById(this.companyId);
      }
    });

    this.generateVendorAccountNumber();

    this.layoutSub = this.configService.templateConf$.subscribe((templateConf) => {
      if (templateConf) this.config = templateConf;
      this.cdr.markForCheck();
    });

    // Load Procurement Companies
    this.loadProcurementCompanies();
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

  // ===== TOGGLE DROPDOWN =====
  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  // ===== LOAD COMPANY =====
  loadCompanyById(companyId: number) {
    this.isLoading = true;
    this.companyService.getCompanyById(companyId).subscribe({
      next: (res: any) => {
        const company = res?.vendorCompany || res;
        if (company) {
          this.companyName = company.name || '';
          this.companyType = company.companyType || 'Organization';
          this.aboutCompany = company.aboutCompany || '';
          this.remarks = company.remarks || '';

          this.vendorCategory = company.purchasingDemographics?.vendorType || '';
          this.primaryCurrency = company.purchasingDemographics?.primaryCurrency || '';
          this.lineOfBusiness = company.purchasingDemographics?.lineOfBusiness || '';
          this.birthCountry = company.purchasingDemographics?.birthCountry || '';
          this.employeeResponsible = company.purchasingDemographics?.employeeResponsible || '';
          this.segment = company.purchasingDemographics?.segment || '';
          this.speciality = company.purchasingDemographics?.speciality || '';
          this.chain = company.purchasingDemographics?.chain || '';
          this.note = company.purchasingDemographics?.note || '';

          // Collections
          this.addressList = (company.addresses?.$values || []).map(a => ({
            street: a.street,
            city: a.city,
            state: a.state,
            zip: a.zip,
            country: a.country,
            isPrimary: a.isPrimary
          }));

          this.contactList = (company.contacts?.$values || []).map(c => ({
            description: c.description,
            type: c.type,
            contactNumber: c.contactNumber,
            extension: c.extension,
            isPrimary: c.isPrimary
          }));

          this.attachedFiles = (company.attachments?.$values || []).map(f => ({
            fileName: f.fileName,
            format: f.fileFormat,
            fileContent: f.fileContent,
            attachedBy: f.attachedBy,
            remarks: f.remarks,
            attachedAt: f.attachedAt
          }));

          this.userId = company.vendorId || this.userId;

          // Set previously selected procurement companies if they exist
          if (company.procurementCompanyGUID) {
            this.selectedprocurementCompanyGUID = [...company.procurementCompanyGUID];
          }

          this.isEditMode = true;
        }
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error loading company:', err);
        this.isLoading = false;
      }
    });
  }

  // ===== HANDLE MULTI-SELECT SELECTION =====
  toggleCompanySelection(guid: string, event: any) {
    if (event.target.checked) {
      if (!this.selectedprocurementCompanyGUID.includes(guid)) {
        this.selectedprocurementCompanyGUID.push(guid);
      }
    } else {
      this.selectedprocurementCompanyGUID = this.selectedprocurementCompanyGUID.filter(id => id !== guid);
    }
  }

  // ===== DISPLAY SELECTED COMPANIES TEXT =====
  getSelectedCompaniesText(): string {
    if (this.selectedprocurementCompanyGUID.length === 0) return 'Select Procurement Companies';
    const selectedNames = this.procurementCompanies
      .filter(c => this.selectedprocurementCompanyGUID.includes(c.companyGUID))
      .map(c => c.name);
    return selectedNames.join(', ');
  }

  // ===== GENERATE VENDOR ACCOUNT NUMBER =====
  generateVendorAccountNumber(): void {
    const storedSequence = localStorage.getItem('vendorSequence');
    let sequenceNumber = storedSequence ? parseInt(storedSequence, 10) : 0;
    sequenceNumber += 1;
    this.vendorAccountNumber = `lits-vcp-vendor-${sequenceNumber.toString().padStart(5, '0')}`;
    localStorage.setItem('vendorSequence', sequenceNumber.toString());
  }

  // ===== LOAD PROCUREMENT COMPANIES =====
  loadProcurementCompanies() {
    this.companyService.getProcurementCompanies().subscribe({
      next: (res: any) => {
        this.procurementCompanies = res?.$values || res || [];
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error fetching procurement companies:', err);
        this.procurementCompanies = [];
      }
    });
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

  // ===== ATTACHMENTS =====
  openAttachmentModal() {
    const modalRef = this.modalService.open(CompanyProfileAttachmentComponent, { centered: true });
    modalRef.componentInstance.attachedFiles = [...this.attachedFiles];

    modalRef.componentInstance.saveAttachment.subscribe(async (updatedFiles: any[]) => {
      this.attachedFiles = await Promise.all(updatedFiles.map(async f => {
        if (f.file) {
          f.fileContent = await this.convertFileToBase64(f.file);
        }
        return f;
      }));
      this.cdr.markForCheck();
    });
  }

  convertFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!file) return reject('No file provided');
      const reader = new FileReader();

      reader.readAsDataURL(file);

      reader.onload = () => {
        const result = reader.result;
        if (typeof result === 'string') {
          const base64 = result.split(',')[1];
          resolve(base64);
        } else {
          reject('FileReader result is not a string');
        }
      };

      reader.onerror = (error) => reject(error);
    });
  }

  // ===== PAYLOAD =====
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

  // ===== SUBMIT FORM =====
  async submitForm() {
    if (!this.userId) {
this.toastr.error('Vendor ID missing! Please login again.', 'Error');    
  this.router.navigate(['/auth/login']);
      return;
    }

    this.attachedFiles = await Promise.all(this.attachedFiles.map(async f => {
      if (f.file && !f.fileContent) {
        f.fileContent = await this.convertFileToBase64(f.file);
      }
      return f;
    }));

    const vendorCompanyPayload = {
      name: this.companyName,
      vendorId: this.userId,
      logo: '',
      requestStatusId: 1,
  ProcurementCompanyGUID: [...this.selectedprocurementCompanyGUID], // note capital P
      addresses: this.getAddressesForPayload(),
      contacts: this.getContactsForPayload(),
      purchasingDemographics: this.getPurchasingDemographicsPayload(),
      attachments: this.attachedFiles.map(f => ({
        fileName: f.fileName,
        fileFormat: f.format?.split('/').pop() || f.format || 'unknown',
        fileContent: f.fileContent || '',
        attachedBy: f.attachedBy,
        remarks: f.remarks,
        attachedAt: f.attachedAt ? new Date(f.attachedAt).toISOString() : new Date().toISOString()
      }))
    };

    const payload = {
      vendorCompany: vendorCompanyPayload,
      vendorUserId: this.userId,
      ProcurementCompanyGUID: [...this.selectedprocurementCompanyGUID] // exact casing

    };

    this.isLoading = true;

    const apiCall = this.isEditMode
      ? this.companyService.updateCompany(this.companyId!, payload)
      : this.companyService.registerCompany(payload);

    apiCall.subscribe({
      next: () => {
        this.toastr.success(`Company ${this.isEditMode ? 'Updated' : 'Registered'} Successfully!`);
        this.isLoading = false;
        this.router.navigate(['/company/company-master']);
      },
      error: (err) => {
        console.error('Error saving company:', err);
        this.isLoading = false;
        this.toastr.error('Error saving company!');
      }
    });
  }

  goBack() {
    this.router.navigate(['/company/company-master']);
  }
}
