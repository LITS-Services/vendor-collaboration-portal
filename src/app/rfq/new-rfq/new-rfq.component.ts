import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbAccordion, NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ColumnMode, DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import { ChatService } from 'app/chat/chat.service';
import { DatatableData } from 'app/data-tables/data/datatables.data';
import { AuthService } from 'app/shared/auth/auth.service';
import { RfqService } from 'app/shared/services/rfq.service';
import { RfqBidAttachmentComponent } from '../rfq-bid-attachment/rfq-bid-attachment.component';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-new-rfq',
  templateUrl: './new-rfq.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./new-rfq.component.scss'],
  providers: [ChatService]
})
export class NewRfqComponent implements OnInit {

  numberOfAttachments = 0;
  newRfqData = [];
  public chkBoxSelected = [];
  loading = false;
  public rows = DatatableData;
  columns = [];
  itemType: string = 'Inventory'; // Default selection

  @Input() data: any;
  @Input() status: string;

  public SelectionType = SelectionType;
  public ColumnMode = ColumnMode;
  newRfqForm: FormGroup;

  @ViewChild('accordion') accordion: NgbAccordion;
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @ViewChild('tableRowDetails') tableRowDetails: any;
  @ViewChild('tableResponsive') tableResponsive: any;

  constructor(
    private router: Router,
    public activeModal: NgbActiveModal,
    private modalService: NgbModal,
    private rfqService: RfqService,
    private authService: AuthService,
    private toastr: ToastrService,
    public cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    if (this.data) {
      const itemList = this.data.qrItems || [];

      // Map quotation items into local structure
      // this.newRfqData = itemList.map(item => ({
      //    quotationRequestId: item.quotationRequestId,
      //   quotationItemId: item.id, 
      //   itemType: item.itemType,
      //   itemId: item.itemId,
      //   itemName: item.itemName,
      //   description: item.itemDescription,
      //   amount: item.amount,
      //   vendorUserId: item.vendorUserId,
      //   comment: '',
      //   hasSubmittedBid,
      //   attachments: item.attachments?.map((a: any) => ({
      //     id: a.id,
      //     fileName: a.fileName,
      //     contentType: a.contentType,
      //     content: a.content,
      //     fromForm: a.fromForm,
      //     isNew: false
      //   })) || []
      // }));
      this.newRfqData = itemList.map(item => {
  const hasSubmittedBid = item.bidSubmissionDetails && item.bidSubmissionDetails.length > 0;

  return {
    quotationRequestId: item.quotationRequestId,
    quotationItemId: item.id,
    itemType: item.itemType,
    itemId: item.itemId,
    itemName: item.itemName,
    description: item.itemDescription,
    amount: item.amount,
    vendorUserId: item.vendorUserId,
    comment: '',
    hasSubmittedBid,
    attachments: item.attachments?.map((a: any) => ({
      id: a.id,
      fileName: a.fileName,
      contentType: a.contentType,
      content: a.content,
      fromForm: a.fromForm,
      isNew: false
    })) || []
  };

});
  this.cdr.detectChanges();
    }
  }

  homePage() {
    this.router.navigate(['/rfq']);
  }

  submitForm() {
    const vendorUserId = localStorage.getItem('userId');

    if (!vendorUserId) {
      this.toastr.error('Unable to retrieve vendor information. Please log in again.');
      return;
    }

    // const submissionList = this.newRfqData
    //  .filter(item => !item.hasSubmittedBid) // ✅ only new bids
    // .map(item => ({
      
    //   quotationRequestId: item.quotationRequestId,
    //   quotationItemId: item.quotationItemId,
    //   vendorUserId: vendorUserId,
    //   biddingAmount: item.amount,
    //   comment: item.comment,
    //   vendorBidAttachments: item.attachments?.filter(att => att.fromForm === "Vendor Upload").map(att => ({
    //     id: att.id || null,
    //     content: att.content || '',
    //     contentType: att.contentType || '',
    //     fileName: att.fileName || '',
    //     fromForm: att.fromForm || '',
    //     createdBy: att.createdBy || '',
    //     isDeleted: false,
    //     bidSubmissionDetailsId: att.bidSubmissionDetailsId || 0,
    //   }))

    // }));
    const submissionList = this.newRfqData
  // 1️⃣ Only items that are NOT already submitted
  .filter(item => !item.hasSubmittedBid)
  // 2️⃣ Only items with actual input from vendor
  .filter(item =>
    (item.amount && item.amount > 0) ||
    (item.comment && item.comment.trim() !== '') ||
    (item.attachments && item.attachments.some(att => att.fromForm === "Vendor Upload"))
  )
  // 3️⃣ Map only valid items into payload
  .map(item => ({
    quotationRequestId: item.quotationRequestId,
    quotationItemId: item.quotationItemId,
    vendorUserId: vendorUserId,
    biddingAmount: item.amount,
    comment: item.comment,
    vendorBidAttachments: item.attachments
      ?.filter(att => att.fromForm === "Vendor Upload")
      .map(att => ({
        id: att.id || null,
        content: att.content || '',
        contentType: att.contentType || '',
        fileName: att.fileName || '',
        fromForm: att.fromForm || '',
        createdBy: att.createdBy || '',
        isDeleted: false,
        bidSubmissionDetailsId: att.bidSubmissionDetailsId || 0,
      })) ?? []
  }));

    console.log('📤 Submitting payload:', submissionList); // helpful debug log
if (submissionList.length === 0) {
    this.toastr.info('Submission of Bid includes an already submitted bid. Please check your bids.');
    return; // stop execution, don’t show SweetAlert
  }
    Swal.fire({
      title: 'Are you sure?',
      text: 'Have you carefully reviewed your bids before submitting?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, submit bids',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33'
    }).then(result => {
      if (result.isConfirmed) {
        this.rfqService.submitBids(submissionList).subscribe({
          next: () => {
            Swal.fire({
              title: 'Submitted!',
              text: 'Your bids have been submitted successfully.',
              icon: 'success',
              confirmButtonColor: '#3085d6'
            });
            this.router.navigate(['/rfq/rfq-list']);
            this.activeModal.close(true);
          },
          error: (err) => {
            console.error('Error submitting bids:', err);
            Swal.fire({
              title: 'Error!',
              text: 'Failed to submit bids. Please try again later.',
              icon: 'error',
              confirmButtonColor: '#d33'
            });
          }
        });
      }
    });
  }

  deleteRow(rowIndex: number): void {
    this.newRfqData.splice(rowIndex, 1);
  }

  closeDialog() {
    this.activeModal.close(false);
  }

  updateValue(event: any, prop: string, rowIndex: number) {
    const newValue = event.target.value || '';
    const row = this.rows[rowIndex];
    row[prop] = newValue;
  }

  openAttachmentModal(rowIndex: number): void {
    const sourceRow = this.newRfqData[rowIndex];

    const modalRef = this.modalService.open(RfqBidAttachmentComponent, {
      backdrop: 'static',
      size: 'lg',
      centered: true
    });

    modalRef.componentInstance.data = {
      bidSubmissionDetailsId: sourceRow?.bidSubmissionDetailsId ?? 0,
      existingAttachment: sourceRow?.attachments?.filter((a: any) => a.fromForm !== 'Vendor Upload') || [], // Procurement
      vendorAttachments: sourceRow?.attachments?.filter((a: any) => a.fromForm === 'Vendor Upload') || []  // Vendor side
    };

    modalRef.result
      .then((newVendorFiles: any[]) => {
        if (newVendorFiles?.length) {
          // Merge new vendor uploads into vendorAttachments only
          const updatedVendorAttachments = [
            ...(sourceRow.vendorAttachments || []),
            ...newVendorFiles.map(f => ({
              ...f,
              bidSubmissionDetailsId: sourceRow?.bidSubmissionDetailsId ?? 0,
              fromForm: 'Vendor Upload',
              isNew: true
            }))
          ];

          // Rebuild a combined attachments list (for display)
          const combinedAttachments = [
            ...(sourceRow.attachments?.filter((a: any) => a.fromForm !== 'Vendor Upload') || []), // procurement
            ...updatedVendorAttachments
          ];

          // Update the row data immutably
          this.newRfqData = this.newRfqData.map((r, i) =>
            i === rowIndex
              ? {
                ...r,
                vendorAttachments: updatedVendorAttachments,
                attachments: combinedAttachments
              }
              : r
          );
        }
      })
      .catch(() => { });
  }

}