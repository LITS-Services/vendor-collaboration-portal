import { DOCUMENT } from '@angular/common';
import { ChangeDetectorRef, Component, HostListener, Inject, OnInit, Renderer2, TemplateRef, ViewChild } from '@angular/core';
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
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-company-registration',
  templateUrl: './company-registration.component.html',
  styleUrls: ['./company-registration.component.scss']
})
export class CompanyRegistrationComponent implements OnInit {

  @ViewChild('remarksModal') remarksModal!: TemplateRef<any>;
  selectedVendorEntityAssociationId: number | null = null;
  public config: any = {};
  layoutSub: Subscription;
  isEditMode: boolean = false;
  bankForm!: FormGroup;
  companyForm!: FormGroup;
  bankList: any[] = [];
  addressList: any[] = [];
  contactList: any[] = [];
  attachedFiles: any[] = [];
  vendorAccountNumber: string = '';
  isLoading: boolean = false;
  companyId: number | null = null;
  remarks: string = '';
  vendorEntities: any[] = [];
  selectedEntity: any;

  // For entity selection dropdown
  entityDropdownOpen: boolean = false;
  selectedEntityId: number | null = null;
  isReadonlyEntityFields: boolean = false;
  
  // New property to track if all entities have status 7 (Completed)
  allEntitiesCompleted: boolean = false;

  procurementCompanies: any[] = [];
  selectedProcurementCompanyIds: number[] = [];
  dropdownOpen: boolean = false;

  showContactDeletePopup: boolean = false;
  showAddressDeletePopup: boolean = false;
  showBankDeletePopup: boolean = false;
  contactIndexToDelete: number | null = null;
  addressIndexToDelete: number | null = null;
  bankIndexToDelete: number | null = null;

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

  createdBy: string = '';
  modifiedBy: string = '';

  public swipeConfig: SwiperConfigInterface = {
    slidesPerView: 'auto',
    centeredSlides: false,
    spaceBetween: 15
  };

  editingContactIndex: number | null = null;
  editingContact: any = this.createEmptyContact();

  editingAddressIndex: number | null = null;
  editingAddress: any = this.createEmptyAddress();
  editingBankIndex: number | null = null;

  private createEmptyContact() {
    return {
      description: '',
      type: 'Mobile',
      contactNumber: '',
      extension: '',
      primary: false
    };
  }

  private createEmptyAddress() {
    return {
      street: '',
      city: '',
      state: '',
      zip: '',
      country: '',
      primary: false
    };
  }

  companyTabs: Array<'general' | 'addresses' | 'contacts' | 'purchasing' | 'bank' | 'attachments'> = [
    'general',
    'addresses',
    'contacts',
    'purchasing',
    'bank',
    'attachments'
  ];

  selectedTab: 'general' | 'addresses' | 'contacts' | 'purchasing' | 'bank' | 'attachments' = 'general';

  selectTab(tab: 'general' | 'addresses' | 'contacts' | 'purchasing' | 'bank' | 'attachments'): void {
    this.selectedTab = tab;
  }
  
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
    private toastr: ToastrService,
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
  ) {
    this.config = this.configService.templateConf;
  }

  ngOnInit() {
    this.bankForm = this.fb.group({
      bankName: ['', Validators.required],
      accountHolderName: ['', Validators.required],
      accountNumber: ['', Validators.required],
      iban: ['', Validators.required],
      swiftCode: [''],
      branchName: [''],
      branchAddress: [''],
      bankCountry: ['', Validators.required],
      bankCurrency: ['', Validators.required]
    });

    this.companyForm = this.fb.group({
      remarks: ['']
    });

    this.userId = localStorage.getItem('userId') || '';
    this.createdBy = localStorage.getItem('username') || '';
    this.modifiedBy = localStorage.getItem('username') || '';

    if (!this.userId) {
      this.toastr.warning('Vendor not found! Redirecting to login.', 'Warning');
      this.router.navigate(['../']);
      return;
    }
    this.remarks = '';

    this.route.queryParams.subscribe(params => {
      if (params['id']) {
        this.companyId = +params['id'];
        this.loadCompanyById(this.companyId);
      }

      if (params['procurementCompanyId']) {
        const ids = params['procurementCompanyId']
          .split(',')
          .map((id: string) => parseInt(id, 10))
          .filter(id => !isNaN(id));

        this.selectedProcurementCompanyIds = ids;
        console.log('Selected ProcurementCompanyIds from list:', this.selectedProcurementCompanyIds);
      }
    });

    this.generateVendorAccountNumber();

    this.layoutSub = this.configService.templateConf$.subscribe((templateConf) => {
      if (templateConf) this.config = templateConf;
      this.cdr.markForCheck();
    });

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

  private get currentTabIndex(): number {
    return this.companyTabs.indexOf(this.selectedTab);
  }

  isFirstTab(): boolean {
    return this.currentTabIndex === 0;
  }

  isLastTab(): boolean {
    return this.currentTabIndex === this.companyTabs.length - 1;
  }

  goToNextTab(): void {
    const idx = this.currentTabIndex;
    if (idx < this.companyTabs.length - 1) {
      this.selectedTab = this.companyTabs[idx + 1];
    }
  }

  goToPrevTab(): void {
    const idx = this.currentTabIndex;
    if (idx > 0) {
      this.selectedTab = this.companyTabs[idx - 1];
    }
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  openContactEditor(index?: number) {
    if (index !== undefined && index !== null) {
      this.editingContactIndex = index;
      this.editingContact = { ...this.contactList[index] };
    } else {
      this.editingContactIndex = null;
      this.editingContact = this.createEmptyContact();
    }
  }

  onContactSubmit(contact: any) {
    if (this.editingContactIndex === null) {
      this.contactList = [...this.contactList, { ...contact }];
      this.editingContact = this.createEmptyContact();
    } else {
      this.contactList = this.contactList.map((c, i) =>
        i === this.editingContactIndex ? { ...contact } : c
      );
      this.editingContactIndex = null;
      this.editingContact = this.createEmptyContact();
    }
    this.cdr.markForCheck();
  }

  openAddressEditor(index?: number) {
    if (index !== undefined && index !== null) {
      this.editingAddressIndex = index;
      this.editingAddress = { ...this.addressList[index] };
    } else {
      this.editingAddressIndex = null;
      this.editingAddress = this.createEmptyAddress();
    }
  }

  onAddressSubmit(address: any) {
    if (this.editingAddressIndex === null) {
      this.addressList = [...this.addressList, { ...address }];
      this.editingAddress = this.createEmptyAddress();
    } else {
      this.addressList = this.addressList.map((a, i) =>
        i === this.editingAddressIndex ? { ...address } : a
      );
      this.editingAddressIndex = null;
      this.editingAddress = this.createEmptyAddress();
    }
    this.cdr.markForCheck();
  }

  loadCompanyById(companyId: number) {
    this.isLoading = true;
    this.spinner.show();

    this.companyService.getCompanyById(companyId)
      .pipe(finalize(() => {
        this.spinner.hide();
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (res: any) => {
          const company = res?.vendorCompany || res;
          if (company) {
            if (company.vendorUserCompanies && Array.isArray(company.vendorUserCompanies)) {
              this.vendorEntities = company.vendorUserCompanies;
              
              // Check if all entities have status 7 (Completed)
              this.checkAllEntitiesCompleted();
              
              // Auto-select first vendor entity
              if (this.vendorEntities.length > 0) {
                this.onEntitySelect(this.vendorEntities[0]);
              }
            } else {
              this.vendorEntities = [];
              this.allEntitiesCompleted = false;
            }

            // Basic Info
            this.companyName = company.name || '';
            this.companyType = company.companyType || 'Organization';
            this.aboutCompany = company.aboutCompany || '';
            this.remarks = company.remarks || '';
            this.companyForm.patchValue({ remarks: this.remarks });

            // Purchasing Demographics
            const pd = company.purchasingDemographics || {};
            this.vendorCategory = pd.vendorType || '';
            this.primaryCurrency = pd.primaryCurrency || '';
            this.lineOfBusiness = pd.lineOfBusiness || '';
            this.birthCountry = pd.birthCountry || '';
            this.employeeResponsible = pd.employeeResponsible || '';
            this.segment = pd.segment || '';
            this.speciality = pd.speciality || '';
            this.chain = pd.chain || '';
            this.note = pd.note || '';

            // Addresses
            this.addressList = (company.addresses || []).map(a => ({
              street: a.street,
              city: a.city,
              state: a.state,
              zip: a.zip,
              country: a.country,
              isPrimary: a.isPrimary || false
            }));

            // Vendor User Companies (Entities)
            if (company.vendorUserCompanies && Array.isArray(company.vendorUserCompanies)) {
              this.procurementCompanies = company.vendorUserCompanies;
              
              if (this.procurementCompanies.length > 0) {
                this.onEntitySelect(this.procurementCompanies[0]);
              } else {
                this.isReadonlyEntityFields = false;
                this.bankForm.enable();
                this.companyForm.enable();
              }
            } else {
              this.isReadonlyEntityFields = false;
              this.bankForm.enable();
              this.companyForm.enable();
            }

            // Contacts
            this.contactList = (company.contacts || []).map(c => ({
              description: c.description,
              type: c.type,
              contactNumber: c.contactNumber,
              extension: c.extension || '',
              isPrimary: c.isPrimary || false
            }));

            // Bank Details
            this.bankList = (company.bankDetails || []).map(b => ({
              id: b.id,
              vendorCompanyId: b.vendorCompanyId,
              bankName: b.bankName,
              accountHolderName: b.accountHolderName,
              accountNumber: b.accountNumber,
              iban: b.iban,
              swiftCode: b.swifT_BIC_Code,
              branchName: b.branchName,
              branchAddress: b.branchAddress,
              bankCountry: b.country,
              bankCurrency: b.currency,
              isPrimary: b.isPrimary || false,
              createdBy: b.createdBy,
              createdDate: b.createdDate
            }));

            // Initialize bank form state based on current readonly status
            if (this.isReadonlyEntityFields) {
              this.bankForm.disable();
            } else {
              this.bankForm.enable();
            }

            // Attachments
            this.attachedFiles = (company.attachments || []).map(f => ({
              fileName: f.fileName,
              format: f.fileFormat,
              fileContent: f.fileContent,
              attachedBy: f.attachedBy,
              remarks: f.remarks,
              attachedAt: f.attachedAt
            }));

            // Procurement Companies
            if (Array.isArray(company.procurementCompanyId)) {
              this.selectedProcurementCompanyIds = [...company.procurementCompanyId];
            } else if (company.procurementCompanyId) {
              this.selectedProcurementCompanyIds = [company.procurementCompanyId];
            }

            this.isEditMode = true;
          }

          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Error loading company:', err);
          this.isLoading = false;
          this.isReadonlyEntityFields = false;
          this.bankForm.enable();
          this.companyForm.enable();
          this.allEntitiesCompleted = false;
        }
      });
  }

  // New method to check if all entities have status 7 (Completed)
  private checkAllEntitiesCompleted(): void {
    if (!this.vendorEntities || this.vendorEntities.length === 0) {
      this.allEntitiesCompleted = false;
      return;
    }
    
    // Check if ALL entities have requestStatusId === 7
    this.allEntitiesCompleted = this.vendorEntities.every(entity => 
      entity.requestStatusId === 7
    );
    
    console.log('All entities completed status:', this.allEntitiesCompleted);
  }

  onEntitySelect(entity: any) {
    this.selectedEntityId = entity.procurementCompanyId;
    this.entityDropdownOpen = false;
    this.selectedEntity = entity;
    this.selectedProcurementCompanyIds = [entity.procurementCompanyId];
    this.selectedVendorEntityAssociationId = entity.id;

    // Original logic for readonly fields based on InProcess (1) or Approved (3)
    this.isReadonlyEntityFields = entity.requestStatusId === 1 || entity.requestStatusId === 3;

    // NEW LOGIC: If entity status is Completed (7), check if ALL entities are completed
    if (entity.requestStatusId === 7) {
      // Enable fields only if ALL entities have status 7
      this.isReadonlyEntityFields = !this.allEntitiesCompleted;
    }

    // Enable or disable forms based on entity status
    if (this.isReadonlyEntityFields) {
      this.bankForm.disable();
      this.companyForm.disable();
    } else {
      this.bankForm.enable();
      this.companyForm.enable();
    }

    console.log('Entity selected:', entity);
    console.log('Entity Status ID:', entity.requestStatusId);
    console.log('All entities completed:', this.allEntitiesCompleted);
    console.log('Form disabled:', this.isReadonlyEntityFields);
  }

  hasInProcessEntities(): boolean {
    return this.procurementCompanies.some(entity =>
      entity.requestStatusId === 1 || entity.requestStatus?.toLowerCase() === 'inprocess'
    );
  }

  getSelectedEntityName(): string {
    if (!this.selectedEntityId) return 'Select Entity';
    const entity = this.vendorEntities.find(e => e.procurementCompanyId === this.selectedEntityId);
    if (!entity) return 'Select Entity';
    const companyName = entity.procurementCompany?.name || '';
    const status = entity.requestStatus?.status ? ` (${entity.requestStatus.status})` : '';
    return companyName + status;
  }

  toggleCompanySelection(id: number, event: any) {
    if (event.target.checked) {
      if (!this.selectedProcurementCompanyIds.includes(id)) {
        this.selectedProcurementCompanyIds.push(id);
      }
    } else {
      this.selectedProcurementCompanyIds = this.selectedProcurementCompanyIds.filter(i => i !== id);
    }
  }

  getSelectedCompaniesText(): string {
    if (this.selectedProcurementCompanyIds.length === 0) return 'Select Procurement Companies';
    return this.procurementCompanies
      .filter(c => this.selectedProcurementCompanyIds.includes(c.id))
      .map(c => c.name)
      .join(', ');
  }

  generateVendorAccountNumber(): void {
    const storedSequence = localStorage.getItem('vendorSequence');
    let sequenceNumber = storedSequence ? parseInt(storedSequence, 10) : 0;
    sequenceNumber += 1;
    this.vendorAccountNumber = `lits-vcp-vendor-${sequenceNumber.toString().padStart(5, '0')}`;
    localStorage.setItem('vendorSequence', sequenceNumber.toString());
  }

  loadProcurementCompanies() {
    this.companyService.getProcurementCompanies().subscribe({
      next: (res: any) => {
        if (res?.result) this.procurementCompanies = res.result;
        else if (Array.isArray(res)) this.procurementCompanies = res;
        else this.procurementCompanies = [];
        this.cdr.detectChanges();
      }
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
    this.editingAddress = this.createEmptyAddress();
    this.addressList.splice(index, 1);
    this.closeAddressPopup();
  }

  getAddressesForPayload() {
    return this.addressList.map(a => ({
      street: a.street,
      city: a.city,
      state: a.state,
      zip: a.zip,
      country: a.country,
      isPrimary: (a.isPrimary !== undefined ? a.isPrimary : a.primary) || false
    }));
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
    this.editingContact = this.createEmptyContact();
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

  openBankModal(bank?: any, index?: number) {
    const modalRef = this.modalService.open(CompanyContactModalComponent, { centered: true });

    if (bank) {
      modalRef.componentInstance.contact = { ...bank };
      modalRef.componentInstance.isEditMode = true;
      modalRef.componentInstance.saveContact.subscribe((updatedBank: any) => {
        if (index !== undefined) this.bankList[index] = updatedBank;
        this.cdr.markForCheck();
      });
    } else {
      modalRef.componentInstance.addContact.subscribe((newBank: any) => {
        this.bankList.push(newBank);
        this.cdr.markForCheck();
      });
    }
  }

  confirmBankDeletion(index: number) {
    this.showBankDeletePopup = true;
    this.bankIndexToDelete = index;
  }

  closeBankPopup() {
    this.showBankDeletePopup = false;
    this.bankIndexToDelete = null;
  }

  getBankForPayload() {
    const now = new Date().toISOString();
    return this.bankList.map(b => ({
      id: b.id || 0,
      vendorCompanyId: this.companyId || 0,
      bankName: b.bankName || b.description || '',
      accountHolderName: b.accountHolderName || b.contactHolderName || '',
      accountNumber: b.accountNumber || b.contactNumber || '',
      iban: b.iban || b.extension || '',
      swifT_BIC_Code: b.swiftCode || b.type || '',
      branchName: b.branchName || '',
      branchAddress: b.branchAddress || '',
      country: b.bankCountry || '',
      currency: b.bankCurrency || '',
      createdDate: b.createdDate || now,
      modifiedDate: b.modifiedDate || now,
      createdBy: b.createdBy || this.createdBy,
      modifiedBy: b.modifiedBy || this.modifiedBy,
      isDeleted: b.isDeleted || false
    }));
  }

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

  onAttachmentsUpdated(files: any[]) {
    this.attachedFiles = files;
    this.cdr.markForCheck();
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

  async submitForm() {
    if (!this.userId) {
      this.toastr.error('Vendor ID missing! Please login again.', 'Error');
      this.router.navigate(['/auth/login']);
      return;
    }

    if (this.isEditMode) {
      this.openRemarksModal();
      return;
    }

    this.submitCompanyPayload();
  }

  openRemarksModal() {
    this.remarks = '';
    const modalRef = this.modalService.open(this.remarksModal, { centered: true, size: 'lg' });

    modalRef.result.then(
      (result) => {
        if (result === 'submit') {
          this.submitCompanyPayload();
        }
      },
      () => {
        this.remarks = '';
      }
    );
  }

  submitRemarks(modal: any) {
    if (!this.remarks || this.remarks.trim() === '') {
      this.toastr.error('Please enter remarks before submitting.');
      return;
    }
    modal.close('submit');
  }

  async submitCompanyPayload() {
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
      logo: '',
      requestStatusId: 1,
      procurementCompanyId: [...this.selectedProcurementCompanyIds],
      addresses: this.getAddressesForPayload(),
      contacts: this.getContactsForPayload(),
      bankDetails: this.getBankForPayload(),
      purchasingDemographics: this.getPurchasingDemographicsPayload(),
      attachments: this.attachedFiles.map(f => ({
        fileName: f.fileName,
        fileFormat: f.format?.split('/').pop() || f.format || 'unknown',
        fileContent: f.fileContent || '',
        attachedBy: f.attachedBy,
        remarks: f.remarks,
        attachedAt: f.attachedAt ? new Date(f.attachedAt).toISOString() : new Date().toISOString()
      })),
      createdBy: this.isEditMode ? undefined : this.createdBy,
      modifiedBy: this.isEditMode ? this.modifiedBy : undefined
    };

    const payload = {
      vendorCompany: {
        ...vendorCompanyPayload,
        procurementCompanyId: [...this.selectedProcurementCompanyIds]
      },
      SubmitterId: this.userId,
      procurementCompanyId: [...this.selectedProcurementCompanyIds],
      VendorEntityAssociationId: this.selectedVendorEntityAssociationId,
      remarks: this.isEditMode ? this.remarks : (this.companyForm?.get('remarks')?.value || this.remarks),
    };

    this.isLoading = true;

    const apiCall = this.isEditMode
      ? this.companyService.updateCompany(this.companyId, payload)
      : this.companyService.registerCompany(payload);

    apiCall.subscribe({
      next: () => {
        this.toastr.success(`Company ${this.isEditMode ? 'Updated' : 'Registered'} Successfully!`);
        this.isLoading = false;
        this.router.navigate(['/company/company-master']);
      },
      error: () => {
        this.isLoading = false;
        this.toastr.error('Error saving company!');
      }
    });
  }

goBack() {
  if (window.history.length > 1) {
    // Go back to previous page
    window.history.back();
  } else {
    // If no history, navigate to default page
    this.router.navigate(['/company/company-master']);
  }
}
  addBank(): void {
    if (this.bankForm.valid) {
      if (this.editingBankIndex === null) {
        this.bankList = [...this.bankList, this.bankForm.value];
      } else {
        this.bankList = this.bankList.map((b, i) =>
          i === this.editingBankIndex ? { ...this.bankForm.value } : b
        );
        this.editingBankIndex = null;
      }
      console.log('Bank List:', this.bankList);
      this.bankForm.reset();
    } else {
      console.warn('Please fill in all required fields.');
      this.bankForm.markAllAsTouched();
    }
  }

  removeBank(index: number) {
    if (this.editingBankIndex === index) {
      this.editingBankIndex = null;
      this.bankForm.reset();
    }
    this.bankList.splice(index, 1);
    this.closeBankPopup();
  }

  editBank(index: number): void {
    this.editingBankIndex = index;
    this.bankForm.patchValue(this.bankList[index]);
  }

  @HostListener('document:click', ['$event.target'])
  onClickOutside(targetElement: HTMLElement) {
    const clickedInside = targetElement.closest('.dropdown');
    if (!clickedInside) {
      this.entityDropdownOpen = false;
    }
  }
}