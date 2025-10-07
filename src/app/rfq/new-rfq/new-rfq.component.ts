import { ChangeDetectionStrategy, Component, Input, OnInit, ViewChild } from '@angular/core';
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
  @Input() data: any; // Row data passed to the modal
  @Input() status: string;
  public SelectionType = SelectionType;
  public ColumnMode = ColumnMode;
  newRfqForm: FormGroup;
  @ViewChild('accordion') accordion: NgbAccordion;
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @ViewChild('tableRowDetails') tableRowDetails: any;
  @ViewChild('tableResponsive') tableResponsive: any;
  constructor(private router: Router, public activeModal: NgbActiveModal,
    private modalService: NgbModal,
    private rfqService: RfqService,
    private authService: AuthService,
  private toastr: ToastrService) { }

  ngOnInit(): void {
    if (this.data) {
      // Use items if available (convert from $values)
      const itemList = this.data.qrItems?.$values || [];

      this.newRfqData = itemList.map(item => ({
        quotationRequestId: item.quotationRequestId,
        quotationItemId: item.id, // <-- Make sure this is added
        itemType: item.itemType,
        itemId: item.itemId,
        itemName: item.itemName,
        description: item.itemDescription,
        amount: item.amount,
        vendorUserId: item.vendorUserId,
        comment: '',

attachments: item.attachments?.$values?.map((a: any) => ({
    id: a.id,
    fileName: a.fileName,
    contentType: a.contentType,
    content: a.content,
    isNew: false // important to differentiate already-saved files
  })) || []      }));
      console.log("RFQ Data: ", this.newRfqData);

    }
  }
  homePage() {
    this.router.navigate(['/rfq']);
  }
  submitForm() {
    const vendorUserId = localStorage.getItem('userId');

    if (!vendorUserId) {
      alert('Unable to retrieve vendor information. Please log in again.');
      return;
    }

    const submissionList = this.newRfqData.map(item => ({
      quotationRequestId: item.quotationRequestId,
      quotationItemId: item.quotationItemId,
      vendorUserId: vendorUserId,
      biddingAmount: item.amount,
      comment: item.comment,
      createdBy: vendorUserId
    }));

    this.rfqService.submitBids(submissionList).subscribe({
      next: () => {
        this.toastr.success('Bid submitted successfully!');
        this.router.navigate(['/rfq/rfq-list']);
        this.activeModal.close(true);
      },
      error: (err) => {
        console.error('Error submitting bids:', err);
        alert('Failed to submit bids.');
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
    const newValue = event.target.value || ''; // Capture the new value or empty string if cleared
    const row = this.rows[rowIndex]; // Get the corresponding row

    // Update the property value in the row
    row[prop] = newValue;

    // Check if the property being updated is 'ExpiryDate' and call updateExpiryDate
    if (prop === 'ExpiryDate') {
      // this.updateExpiryDate(row, newValue); // Trigger the API call to update expiry date
    }

    // Disable editing mode for this row's expiry field
    // this.editing[rowIndex + '-expiry'] = false;
  }

  openAttachmentModal(rowIndex: number): void {
  const sourceRow = rowIndex !== null
    ? this.newRfqData[rowIndex]
    : this.newRfqForm.value; // for new item

  const modalRef = this.modalService.open(RfqBidAttachmentComponent, {
    backdrop: 'static',
    size: 'lg',
    centered: true
  });

  // Pass inputs to modal
  // modalRef.componentInstance.viewMode = this.viewMode;
  modalRef.componentInstance.data = {
    quotationItemId: sourceRow?.id ?? 0,
    existingAttachment: sourceRow?.attachments || []
  };

  // Handle modal close (attachments returned)
  modalRef.result.then((newFiles: any[]) => {
    if (newFiles?.length) {
      const merged = [
        ...(sourceRow.attachments || []),
        ...newFiles.map(a => ({
          fileName: a.fileName,
          contentType: a.contentType,
          content: a.content,
          fromForm: a.fromForm,
          quotationItemId: sourceRow?.id ?? 0,
          isNew: true
        }))
      ];

      if (rowIndex !== null) {
        this.newRfqData = this.newRfqData.map((r, i) =>
          i === rowIndex ? { ...r, attachments: merged } : r
        );
      } else {
        this.newRfqForm.patchValue({ attachments: merged });
      }
    }
  }).catch(() => { });
}

}
