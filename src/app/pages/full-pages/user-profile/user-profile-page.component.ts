import { Component, ViewChild, OnInit, OnDestroy, Inject, Renderer2, ChangeDetectorRef, AfterViewInit, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import { ConfigService } from 'app/shared/services/config.service';
import { LayoutService } from 'app/shared/services/layout.service';

import { SwiperDirective, SwiperConfigInterface } from 'ngx-swiper-wrapper';
import { CompanyAddressModalComponent } from '../company-address-modal/company-address-modal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CompanyContactModalComponent } from '../company-contact-modal/company-contact-modal.component';
import { CompanyProfileAttachmentComponent } from '../company-profile-attachment/company-profile-attachment.component';


@Component({
    selector: 'app-user-profile-page',
    templateUrl: './user-profile-page.component.html',
    styleUrls: ['./user-profile-page.component.scss']
})

export class UserProfilePageComponent implements OnInit, AfterViewInit, OnDestroy {
  public config: any = {};
  layoutSub: Subscription;
 addressList= [];
  contactList = [];
  attachedFiles: any[] = [];
  showContactDeletePopup: boolean = false;
  showAddressDeletePopup: boolean = false;
  contactIndexToDelete: number | null = null;
  addressIndexToDelete: number | null = null;
  vendorAccountNumber: string = '';
  public swipeConfig: SwiperConfigInterface = {
    slidesPerView: 'auto',
    centeredSlides: false,
    spaceBetween: 15
  };


  @ViewChild(SwiperDirective, { static: false }) directiveRef?: SwiperDirective;

  constructor(private configService: ConfigService,
    private modalService: NgbModal,
    private layoutService: LayoutService,
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2, private cdr: ChangeDetectorRef
  ) {
    this.config = this.configService.templateConf;
  }

    ngOnInit() {
      this.generateVendorAccountNumber();
      this.cdr.detectChanges();
      this.layoutSub = this.configService.templateConf$.subscribe((templateConf) => {
        if (templateConf) {
          this.config = templateConf;
        }
        this.cdr.markForCheck();

      })
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
      if (this.layoutSub) {
        this.layoutSub.unsubscribe();
      }
    }

    generateVendorAccountNumber(): void {
      // Simulating a sequence number generator.
      // Ideally, this would be fetched from an API or database.
      const storedSequence = localStorage.getItem('vendorSequence');
      let sequenceNumber = storedSequence ? parseInt(storedSequence, 10) : 0;
  
      // Increment and format the sequence number.
      sequenceNumber += 1;
      this.vendorAccountNumber = `lits-vcp-vendor-${sequenceNumber.toString().padStart(5, '0')}`;
  
      // Store the updated sequence number.
      localStorage.setItem('vendorSequence', sequenceNumber.toString());
    }

    //Logic for adding address
    openAddressModal() {
      const modalRef = this.modalService.open(CompanyAddressModalComponent , { centered: true });
      modalRef.componentInstance.addAddress.subscribe((address) => {
        this.addAddress(address);
      });
    }
    //Logic for editing address
    editAddress(index: number): void {
      const modalRef = this.modalService.open(CompanyAddressModalComponent, { centered: true });
    
      // Pass a copy of the address to prevent mutation
      modalRef.componentInstance.address = { ...this.addressList[index] };
      modalRef.componentInstance.isEditAddressMode = true;
    
      // Handle saveAddress event from modal
      modalRef.componentInstance.saveAddress.subscribe((updatedAddress: any) => {
        // Create a new array reference to trigger change detection
        const updatedAddressList = [...this.addressList];
        updatedAddressList[index] = updatedAddress;
        this.addressList = updatedAddressList;
    
        // Manually trigger change detection
        this.cdr.markForCheck();
      });
    }
    

    
    confirmAddressDeletion(index: number): void {
      this.showAddressDeletePopup = true;
      this.addressIndexToDelete = index; // Save the index to delete after confirmation

    }
  
    closeAddressPopup(): void {
      this.showAddressDeletePopup = false;
      this.addressIndexToDelete = null;
    }
    removeAddress(index: number) {
      this.addressList.splice(index, 1);
      this.closeAddressPopup();
    }
  
    // Method to add a new address to the list
    addAddress(address) {
      this.addressList.push(address);
    }
  
    // Method to map data to main form for submission
    getAddressesForPayload() {
      return this.addressList;
    }




    // Logic to add a new contact to the list
    openContactModal() {
      const modalRef = this.modalService.open(CompanyContactModalComponent, { centered: true });
      modalRef.componentInstance.addContact.subscribe((contact) => {
        this.addContact(contact);
      });
    }

    //Edit contact
    editContact(index: number): void {
      const modalRef = this.modalService.open(CompanyContactModalComponent, { centered: true });
      modalRef.componentInstance.contact = { ...this.contactList[index] }; // Pass a copy of the contact
      modalRef.componentInstance.isEditMode = true;
  
      // Save the edited contact back to the list
      modalRef.componentInstance.saveContact.subscribe((updatedContact: any) => {
        // this.contactList[index] = updatedContact; // Update the specific index
        // this.cdr.markForCheck();
        // this.cdr.detectChanges();

        const updatedAddressList = [...this.contactList];
    updatedAddressList[index] = updatedContact;
    this.contactList = updatedAddressList;

    // Manually trigger change detection
    this.cdr.markForCheck();
      });
    }


    // Add new contact to the list
    addContact(contact) {
      this.contactList.push(contact);
    }
    confirmContactDeletion(index: number): void {
      this.showContactDeletePopup = true;
      this.contactIndexToDelete = index; // Save the index to delete after confirmation
    }
  
    closeContactPopup(): void {
      this.showContactDeletePopup = false;
      this.contactIndexToDelete = null;
    }
    // Remove contact by index
    removeContact(index: number) {
      this.contactList.splice(index, 1);
      this.closeContactPopup();
    }
  
    // Method to map contact data for payload
    getContactsForPayload() {
      return this.contactList;
    }


    //Logic for attachement modal
    openAttachmentModal(): void {
      const modalRef = this.modalService.open(CompanyProfileAttachmentComponent, { centered: true });
      modalRef.componentInstance.attachedFiles = [...this.attachedFiles]; // Pass a copy of the attached files
  
      // Handle the save event from the modal
      modalRef.componentInstance.saveAttachment.subscribe((updatedFiles: any[]) => {
        this.attachedFiles = [...updatedFiles]; // Update parent component with the new file list
      });
    }
  
    // For demonstration, log the saved attachments
    saveAttachments(): void {
      console.log('Final Attached Files:', this.attachedFiles);
    }

   // Logic for payload

    submitForm() {
      const payload = {
        // ...this.formValues,
        addresses: this.getAddressesForPayload(),
      };
      // Send payload to backend
    }
}
