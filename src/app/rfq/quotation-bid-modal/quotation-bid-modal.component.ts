import { Component, OnInit, Input, ChangeDetectorRef, NgZone, ElementRef, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BidSubmissionDetails } from '../../models/bid-submission.model';
import { RfqService } from 'app/shared/services/rfq.service';
import { QuotationItemAttachmentResponse, QuotationRequestWithDetailsResponse } from 'app/models/quotation-request-with-details.model';
import { ToastrService } from 'ngx-toastr';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-quotation-bid-modal',
  templateUrl: './quotation-bid-modal.component.html'
})
export class QuotationBidModalComponent implements OnInit {
  @Input() rfqId!: number;
  @Input() vendorUserId: string = '';

  rfq!: QuotationRequestWithDetailsResponse;
  bidMap: Map<number, BidSubmissionDetails> = new Map();
  showAttachments: { [key: number]: boolean } = {};
  editingBidItemId: number | null = null;

  selectedItem: any;
  private activeModal?: NgbModalRef;

  constructor(
    private rfqService: RfqService,
    private route: ActivatedRoute,
    public router: Router,
    private cdr: ChangeDetectorRef,
    private zone: NgZone,
    private toastr: ToastrService,
    private modalService: NgbModal

  ) { }

  ngOnInit(): void {
    this.vendorUserId = localStorage.getItem('userId');
    if (!this.vendorUserId) {
      console.error('Vendor user ID not found in localStorage. Please login again.');
    }
    const id = Number(this.route.snapshot.paramMap.get('rfqId'));
    if (id) {
      this.loadRfqDetails(id);
    } else {
      console.error('No RFQ ID found in route');
    }
  }

  loadRfqDetails(rfqId: number) {
    this.rfqService.getRfqById(rfqId).subscribe(res => {
      console.log('RFQ API response:', res);
      this.rfq = res;
      // Prefill bidMap with already submitted bids
      this.rfq.quotationItems.forEach(item => {
        if (item.bidSubmissionDetails?.length && item.bidSubmissionDetails.length > 0) {
          const existingBid = item.bidSubmissionDetails[0]; // vendor filtered already on backend

          this.bidMap.set(item.id, {
            id: existingBid.id,
            quotationRequestId: existingBid.quotationRequestId,
            quotationItemId: existingBid.quotationItemId,
            vendorUserId: existingBid.vendorUserId,
            biddingAmount: existingBid.biddingAmount,
            comment: existingBid.comment,
            vendorBidAttachments: existingBid.vendorBidAttachments || []
          });
        }
      });
      this.cdr.detectChanges();
    }, err => console.error('Error loading RFQ:', err));
  }

  getBid(itemId: number): BidSubmissionDetails {
    if (!this.bidMap.has(itemId)) {
      this.bidMap.set(itemId, {
        quotationRequestId: this.rfq.id,
        quotationItemId: itemId,
        vendorUserId: this.vendorUserId,
        vendorBidAttachments: []
      });
    }
    return this.bidMap.get(itemId)!;
  }

  addBid(itemId: number) {
    // Ensure the bid object exists in the map
    this.getBid(itemId);

    // If another item is being edited, close it first
    if (this.editingBidItemId !== null && this.editingBidItemId !== itemId) {
      this.editingBidItemId = null;
    }

    this.editingBidItemId = itemId;
  }

  editBid(itemId: number) {
    this.editingBidItemId = itemId;
  }

  deleteBid(itemId: number) {
    const bid = this.bidMap.get(itemId);
    if (bid) {
      if (bid.id) {
        bid.isDeleted = true;
      } else {
        this.bidMap.delete(itemId);
      }
    }
    this.toastr.success('Bid removed successfully!');
  }

  saveBid(itemId: number) {
    const bid = this.bidMap.get(itemId) || {
      quotationRequestId: this.rfq.id,
      quotationItemId: itemId,
      vendorUserId: this.vendorUserId,
      vendorBidAttachments: []
    };

    // Bind data from form before saving
    bid.biddingAmount = bid.biddingAmount || 0;
    bid.comment = bid.comment || '';

    this.bidMap.set(itemId, bid);
    this.editingBidItemId = null;
  }

  onFileSelected(event: any, bid: BidSubmissionDetails) {
    const files: FileList = event.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        // Ensure UI updates immediately
        this.zone.run(() => {
          bid.vendorBidAttachments!.push({
            fileName: file.name,
            content: (reader.result as string).split(',')[1],
            contentType: file.type
          });
        });
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    });
    event.target.value = '';
  }

  removeAttachment(bid: BidSubmissionDetails, index: number) {
    bid.vendorBidAttachments!.splice(index, 1);
    this.cdr.detectChanges();
  }

  downloadAttachment(att: QuotationItemAttachmentResponse) {
    if (!att.content) return;

    // Create a temporary link
    const a = document.createElement('a');
    a.href = att.content;          // Use the full data URL
    a.download = att.fileName!;    // Set the file name
    a.click();                     // Trigger download
  }

  downloadBidAttachment(att: any) {
    if (!att.content) return;

    // Build full data URL
    const dataUrl = `data:${att.contentType};base64,${att.content}`;

    // Create a temporary link
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = att.fileName || 'download';
    a.click();
  }

  toggleAttachments(itemId: number) {
    this.showAttachments[itemId] = !this.showAttachments[itemId];
  }

  submitBids() {
    const bids = Array.from(this.bidMap.values())
      .filter(b => b.id || !b.isDeleted); // include existing bids even if deleted

    this.rfqService.updateBids(bids).subscribe({
      next: () => {
        this.router.navigate(['/rfq/rfq-list']);
      },
      error: err => console.error(err)
    });
  }

  openAttachmentsModal(item: any, modalTemplate: TemplateRef<any>) {
    this.selectedItem = item;
    this.activeModal = this.modalService.open(modalTemplate, {
      centered: true,
      size: 'lg',
      backdrop: 'static',
      keyboard: true
    });
  }
}