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
  companyForm!: FormGroup; // <-- FormGroup for user remarks
  bankList: any[] = [];
  addressList: any[] = [];
  contactList: any[] = [];
  attachedFiles: any[] = [];
  vendorAccountNumber: string = '';
  isLoading: boolean = false;
  companyId: number | null = null;
  remarks: string = '';
  vendorEntities: any[] = []; // For vendorUserCompanies only
  selectedEntity: any; // instead of just ID

  // For entity selection dropdown
  entityDropdownOpen: boolean = false;
  selectedEntityId: number | null = null;
  isReadonlyEntityFields: boolean = false;


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
    // ==================== Bank Form ====================
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

    // ==================== Company Form (User Remarks) ====================
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

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
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

              // Auto-select first vendor entity
              if (this.vendorEntities.length > 0) {
                this.onEntitySelect(this.vendorEntities[0]);
              }

            } else {
              this.vendorEntities = [];
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

              // Auto-select first entity if exists and set form state
              if (this.procurementCompanies.length > 0) {
                this.onEntitySelect(this.procurementCompanies[0]);
              } else {
                // If no entities, ensure form is enabled
                this.isReadonlyEntityFields = false;
                this.bankForm.enable();
                this.companyForm.enable();
              }
            } else {
              // If no vendorUserCompanies, ensure form is enabled
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
          // Ensure form is enabled even on error
          this.isReadonlyEntityFields = false;
          this.bankForm.enable();
          this.companyForm.enable();
        }
      });
  }

  onEntitySelect(entity: any) {
    this.selectedEntityId = entity.procurementCompanyId;
    this.entityDropdownOpen = false;

    this.selectedEntity = entity;
    this.selectedProcurementCompanyIds = [entity.procurementCompanyId];

    this.selectedVendorEntityAssociationId = entity.id;


    // Set readonly fields based on requestStatusId (1 = InProcess, 3 = Approved, etc.)
    this.isReadonlyEntityFields = entity.requestStatusId === 1 || entity.requestStatusId === 3;

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
    console.log('Form disabled:', this.isReadonlyEntityFields);
  }
  hasInProcessEntities(): boolean {
    return this.procurementCompanies.some(entity =>
      entity.requestStatusId === 1 || entity.requestStatus?.toLowerCase() === 'inprocess'
    );
  }
  // getSelectedEntityName(): string {
  //   if (!this.selectedEntityId) return 'Select Entity';
  //   const entity = this.procurementCompanies.find(e => e.procurementCompanyId === this.selectedEntityId);
  //   return entity ? entity.procurementCompany.name : 'Select Entity';
  // }

  getSelectedEntityName(): string {
    if (!this.selectedEntityId) return 'Select Entity';

    // Search in vendorEntities (not procurementCompanies)
    const entity = this.vendorEntities.find(e => e.procurementCompanyId === this.selectedEntityId);

    if (!entity) return 'Select Entity';

    // Return name + optional status
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

  // loadProcurementCompanies() {
  //   this.companyService.getProcurementCompanies().subscribe({
  //     next: (res: any) => {
  //       if (res && Array.isArray(res.result)) {
  //         this.procurementCompanies = res.result;
  //       } else if (Array.isArray(res)) {
  //         this.procurementCompanies = res;
  //       } else if (res?.$values) {
  //         this.procurementCompanies = res.$values;
  //       } else {
  //         this.procurementCompanies = [];
  //       }
  //       this.cdr.detectChanges();
  //     },
  //     error: (err) => {
  //       console.error('Error fetching procurement companies:', err);
  //       this.procurementCompanies = [];
  //     }
  //   });
  // }

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


  // ==================== Address Methods ====================
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

  // ==================== Contact Methods ====================
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

  // ==================== Bank Methods ====================
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

  removeBank(index: number) {
    this.bankList.splice(index, 1);
    this.closeBankPopup();
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


  // ==================== Attachments ====================
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

  // ==================== Payload Helpers ====================
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

  // ==================== Submit ====================
  // async submitForm() {
  //   if (!this.userId) {
  //     this.toastr.error('Vendor ID missing! Please login again.', 'Error');
  //     this.router.navigate(['/auth/login']);
  //     return;
  //   }

  //   // Convert attachments to base64
  //   this.attachedFiles = await Promise.all(this.attachedFiles.map(async f => {
  //     if (f.file && !f.fileContent) {
  //       f.fileContent = await this.convertFileToBase64(f.file);
  //     }
  //     return f;
  //   }));

  //   const vendorCompanyPayload = {
  //     name: this.companyName,
  //     logo: '',
  //     requestStatusId: 1,
  //     procurementCompanyId: [...this.selectedProcurementCompanyIds],
  //     addresses: this.getAddressesForPayload(),
  //     contacts: this.getContactsForPayload(),
  //     bankDetails: this.getBankForPayload(),
  //     purchasingDemographics: this.getPurchasingDemographicsPayload(),
  //     attachments: this.attachedFiles.map(f => ({
  //       fileName: f.fileName,
  //       fileFormat: f.format?.split('/').pop() || f.format || 'unknown',
  //       fileContent: f.fileContent || '',
  //       attachedBy: f.attachedBy,
  //       remarks: f.remarks,
  //       attachedAt: f.attachedAt ? new Date(f.attachedAt).toISOString() : new Date().toISOString()
  //     })),
  //     remarks: this.companyForm?.get('remarks')?.value || this.remarks, // <-- User remarks
  //     createdBy: this.isEditMode ? undefined : this.createdBy,
  //     modifiedBy: this.isEditMode ? this.modifiedBy : undefined
  //   };

  //   // const payload = {
  //   //   vendorCompany: vendorCompanyPayload,
  //   //   SubmitterId: this.userId,
  //   //   procurementCompanyId: [...this.selectedProcurementCompanyIds]
  //   // };

  //   const payload = {
  //     vendorCompany: {
  //       ...vendorCompanyPayload,
  //       procurementCompanyId: [...this.selectedProcurementCompanyIds] // latest IDs
  //     },
  //     SubmitterId: this.userId,
  //     procurementCompanyId: [...this.selectedProcurementCompanyIds] // same here
  //   };


  //   this.isLoading = true;

  //   const apiCall = this.isEditMode
  //     ? this.companyService.updateCompany(this.companyId!, payload)
  //     : this.companyService.registerCompany(payload);

  //   apiCall.subscribe({
  //     next: () => {
  //       this.toastr.success(`Company ${this.isEditMode ? 'Updated' : 'Registered'} Successfully!`);
  //       this.isLoading = false;
  //       this.router.navigate(['/company/company-master']);
  //     },
  //     error: (err) => {
  //       console.error('Error saving company:', err);
  //       this.isLoading = false;
  //       this.toastr.error('Error saving company!');
  //     }
  //   });
  // }


  async submitForm() {
    if (!this.userId) {
      this.toastr.error('Vendor ID missing! Please login again.', 'Error');
      this.router.navigate(['/auth/login']);
      return;
    }

    if (this.isEditMode) {
      this.openRemarksModal();
      return; // Stop here, wait for modal
    }

    // Add mode → direct submit
    this.submitCompanyPayload();
  }


  openRemarksModal() {
    // Reset remarks before opening
    this.remarks = '';

    const modalRef = this.modalService.open(this.remarksModal, { centered: true, size: 'lg' });

    modalRef.result.then(
      (result) => {
        // Modal closed normally
        if (result === 'submit') {
          this.submitCompanyPayload(); // remarks already in this.remarks
        }
      },
      () => {
        // Modal dismissed (e.g., Cancel button or clicking outside)
        this.remarks = ''; // Reset remarks here as well
      }
    );
  }



  submitRemarks(modal: any) {
    if (!this.remarks || this.remarks.trim() === '') {
      this.toastr.error('Please enter remarks before submitting.');
      return;
    }

    // Close modal and trigger submit
    modal.close('submit');
  }


  async submitCompanyPayload() {
    if (!this.userId) {
      this.toastr.error('Vendor ID missing! Please login again.', 'Error');
      this.router.navigate(['/auth/login']);
      return;
    }

    // Convert attachments to base64
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
      // remarks: this.companyForm?.get('remarks')?.value || this.remarks,
      remarks: this.isEditMode ? this.remarks : (this.companyForm?.get('remarks')?.value || this.remarks),
      createdBy: this.isEditMode ? undefined : this.createdBy,
      modifiedBy: this.isEditMode ? this.modifiedBy : undefined
    };

    // const payload = {
    //   vendorCompany: {
    //     ...vendorCompanyPayload,
    //     procurementCompanyId: [...this.selectedProcurementCompanyIds]
    //   },
    //   SubmitterId: this.userId,
    //   procurementCompanyId: [...this.selectedProcurementCompanyIds]
    // };

    const payload = {
      vendorCompany: {
        ...vendorCompanyPayload,
        procurementCompanyId: [...this.selectedProcurementCompanyIds]
      },
      SubmitterId: this.userId,
      procurementCompanyId: [...this.selectedProcurementCompanyIds],
      VendorEntityAssociationId: this.selectedVendorEntityAssociationId   // <-- ADD
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
    this.router.navigate(['/company/company-master']);
  }

  addBank(): void {
    if (this.bankForm.valid) {
      this.bankList = [...this.bankList, this.bankForm.value];
      console.log('Bank List:', this.bankList);
      this.bankForm.reset();
    } else {
      console.warn('Please fill in all required fields.');
      this.bankForm.markAllAsTouched();
    }
  }

  @HostListener('document:click', ['$event.target'])
  onClickOutside(targetElement: HTMLElement) {
    const clickedInside = targetElement.closest('.dropdown');
    if (!clickedInside) {
      this.entityDropdownOpen = false;
    }
  }

}