import { Component, OnInit, Input, ChangeDetectorRef, NgZone, ElementRef, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BidSubmissionDetails } from '../../models/bid-submission.model';
import { RfqService } from 'app/shared/services/rfq.service';
import { QuotationItemAttachmentResponse, QuotationRequestWithDetailsResponse } from 'app/models/quotation-request-with-details.model';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs/operators';
import { FormBuilder, Validators } from '@angular/forms';

import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

enum CreatedByType {
  Procurement = 1,
  Vendor = 2,
}
@Component({
  selector: "app-quotation-bid-modal",
  templateUrl: "./quotation-bid-modal.component.html",
  styleUrls: ["./quotation-bid-modal.component.scss"],
})
export class QuotationBidModalComponent implements OnInit {
  @Input() rfqId!: number;
  @Input() vendorUserId: string = "";

  rfq!: QuotationRequestWithDetailsResponse;
  bidMap: Map<number, BidSubmissionDetails> = new Map();
  showAttachments: { [key: number]: boolean } = {};
  editingBidItemId: number | null = null;
  companyId: string = "";
  selectedItem: any;
  private activeModal?: NgbModalRef;

  dataComments: any[] = [];
  loading = false;
  CreatedByType = CreatedByType;
  activeIds = ["static-1", "static-2"];

  private focusComments = false;

  form = this.fb.group({
    comment: ["", [Validators.required, Validators.maxLength(1000)]],
  });
  constructor(
    private rfqService: RfqService,
    private route: ActivatedRoute,
    public router: Router,
    private cdr: ChangeDetectorRef,
    private zone: NgZone,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.vendorUserId = localStorage.getItem("userId");
     this.companyId = localStorage.getItem("company");
    if (!this.vendorUserId) {
      console.error(
        "Vendor user ID not found in localStorage. Please login again."
      );
    }
    this.route.queryParamMap.subscribe(qp => {
    this.focusComments = qp.get('focus') === 'comments';
  });

   this.route.paramMap.subscribe(params => {
    const id = Number(params.get("rfqId"));
    if (id) {
      this.loadRfqDetails(id);
    } else {
      console.error("No RFQ ID found in route");
    }
  });
}

  loadRfqDetails(rfqId: number) {
    const vendorUserId = localStorage.getItem("userId");
    this.rfqService.getRfqById(rfqId, true, vendorUserId).subscribe(
      (res) => {
        console.log("RFQ API response:", res);
        this.rfq = res;
        // Prefill bidMap with already submitted bids
        this.rfq.quotationItems.forEach((item) => {
          if (
            item.bidSubmissionDetails?.length &&
            item.bidSubmissionDetails.length > 0
          ) {
            const existingBid = item.bidSubmissionDetails[0]; // vendor filtered already on backend

            this.bidMap.set(item.id, {
              id: existingBid.id,
              quotationRequestId: existingBid.quotationRequestId,
              quotationItemId: existingBid.quotationItemId,
              vendorUserId: existingBid.vendorUserId,
              biddingAmount: existingBid.biddingAmount,
              comment: existingBid.comment,
              vendorBidAttachments: existingBid.vendorBidAttachments || [],
            });
          }
        });
        this.loadRfqComments();
        this.cdr.detectChanges();
      },
      (err) => console.error("Error loading RFQ:", err)
    );
  }

  loadRfqComments() {
    //this.loading = true;

    this.rfqService
      .getRFQComments(
        this.vendorUserId,
        this.rfq.id,
        this.companyId
      )
      .pipe(finalize(() =>
      {
        setTimeout(() => {
          this.loading = false
          this.cdr.detectChanges()  
        }, 1250);
      }))
      .subscribe({
        next: (res: any) => {
           const list: any[] = Array.isArray(res) ? res : [];
          this.dataComments = list.reverse().map((c: any) => ({
            //vendor: this.vendorName,
            comments: c?.commentText ?? "",
            createdByType: c?.createdByType as number,
            createdByLabel:
              (c?.createdByType as number) === CreatedByType.Procurement
                ? "Procurement"
                : "Vendor",
            createdOn: c?.createdOn,
            createdBy: c?.createdBy,
          }));
            this.cdr.markForCheck();
          this.scrollToBottom();
          this.scrollToCommentsOnNotif();
        },
        error: (err: any) => {
          console.error("Error loading RFQ comments", err);
          this.dataComments = [];
          this.cdr.detectChanges();
        },
      });
  }

  insertComment() {
    if (this.form.invalid) return;

    this.loading = true;
    const commentText = this.form.value.comment?.trim();
    if (!commentText) return;

    const payload: any = {
      quotationId: this.rfq.id,
      vendorId: this.vendorUserId,
      vendorCompanyId: this.companyId,
      commentText,
      createdByType: CreatedByType.Vendor,
    };

    this.rfqService
      .addRfqComment(payload)
      .pipe(
        finalize(() => {
            this.loading = false;
              this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (saved: any) => {
          this.form.reset();
          this.loadRfqComments();
        },
        error: (err: any) => {
          console.error("Error posting RFQ comment", err);
        },
      });
  }

  private scrollToBottom() {
    setTimeout(() => {
      const el = document.getElementById("threadScroll");
      if (el) el.scrollTop = el.scrollHeight;
    }, 0);
  }

  private scrollToCommentsOnNotif(): void {
  if (!this.focusComments) return;

  // Open Comments panel
  this.activeIds = ['static-3']; // or ['static-1','static-3'] if you want items also open
  this.cdr.detectChanges();

    setTimeout(() => {
    const anchor = document.getElementById('commentsSectionAnchor');
    if (anchor) {
      anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      // fallback: scroll to bottom of page
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
      });
    }

    // don’t repeat on later opens
    this.focusComments = false;
  }, 0);
}

  getBid(itemId: number): BidSubmissionDetails {
    if (!this.bidMap.has(itemId)) {
      this.bidMap.set(itemId, {
        quotationRequestId: this.rfq.id,
        quotationItemId: itemId,
        vendorUserId: this.vendorUserId,
        vendorBidAttachments: [],
      });
    }
    return this.bidMap.get(itemId)!;
  }

  private isBidClosed(): boolean {
    if (!this.rfq) return false;
    const today = new Date();
    const endDate = new Date(this.rfq.endDate);
    return this.rfq.requestStatus === "Completed" || endDate < today;
  }

  addBid(itemId: number) {
    if (this.isBidClosed()) {
      this.toastr.info("Bid submission is closed for this RFQ.");
      return;
    }
    // Ensure the bid object exists in the map
    this.getBid(itemId);

    // If another item is being edited, close it first
    if (this.editingBidItemId !== null && this.editingBidItemId !== itemId) {
      this.editingBidItemId = null;
    }

    this.editingBidItemId = itemId;
  }

  editBid(itemId: number) {
    if (this.isBidClosed()) {
      this.toastr.info("Bid submission is closed for this RFQ.");
      return;
    }
    this.editingBidItemId = itemId;
  }

  deleteBid(itemId: number) {
    if (this.isBidClosed()) {
      this.toastr.info("Bid submission is closed for this RFQ.");
      return;
    }
    const bid = this.bidMap.get(itemId);
    if (bid) {
      if (bid.id) {
        bid.isDeleted = true;
      } else {
        this.bidMap.delete(itemId);
      }
    }
    this.toastr.success("Bid removed successfully!");
  }

  saveBid(itemId: number) {
    const bid = this.bidMap.get(itemId) || {
      quotationRequestId: this.rfq.id,
      quotationItemId: itemId,
      vendorUserId: this.vendorUserId,
      vendorBidAttachments: [],
    };

    // Bind data from form before saving
    bid.biddingAmount = bid.biddingAmount || 0;
    bid.comment = bid.comment || "";

    this.bidMap.set(itemId, bid);
    this.editingBidItemId = null;
  }

  onFileSelected(event: any, bid: BidSubmissionDetails) {
    const files: FileList = event.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        // Ensure UI updates immediately
        this.zone.run(() => {
          bid.vendorBidAttachments!.push({
            fileName: file.name,
            content: (reader.result as string).split(",")[1],
            contentType: file.type,
          });
        });
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    });
    event.target.value = "";
  }

  removeAttachment(bid: BidSubmissionDetails, index: number) {
    bid.vendorBidAttachments!.splice(index, 1);
    this.cdr.detectChanges();
  }

  downloadAttachment(att: QuotationItemAttachmentResponse) {
    if (!att.content) return;

    // Create a temporary link
    const a = document.createElement("a");
    a.href = att.content; // Use the full data URL
    a.download = att.fileName!; // Set the file name
    a.click(); // Trigger download
  }

  downloadBidAttachment(att: any) {
    if (!att.content) return;

    // Build full data URL
    const dataUrl = `data:${att.contentType};base64,${att.content}`;

    // Create a temporary link
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = att.fileName || "download";
    a.click();
  }

  toggleAttachments(itemId: number) {
    this.showAttachments[itemId] = !this.showAttachments[itemId];
  }

  submitBids() {
    if (this.isBidClosed()) {
      this.toastr.info("Bid submission is closed for this RFQ.");
      return;
    }
    const bids = Array.from(this.bidMap.values()).filter(
      (b) => b.id || !b.isDeleted
    ); // include existing bids even if deleted

    this.rfqService.updateBids(bids).subscribe({
      next: () => {
        this.router.navigate(["/rfq/rfq-list"]);
      },
      error: (err) => console.error(err),
    });
  }

  openAttachmentsModal(item: any, modalTemplate: TemplateRef<any>) {
    this.selectedItem = item;
    this.activeModal = this.modalService.open(modalTemplate, {
      centered: true,
      size: "lg",
      backdrop: "static",
      keyboard: true,
    });
  }

    timeSince(date: Date): string {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

    if (seconds < 30) return 'just now';

    const units = [
      { label: 'y', secs: 31536000 },
      { label: 'mo', secs: 2592000 },
      { label: 'w', secs: 604800 },
      { label: 'd', secs: 86400 },
      { label: 'h', secs: 3600 },
      { label: 'm', secs: 60 },
    ];

    for (const u of units) {
      const v = Math.floor(seconds / u.secs);
      if (v >= 1) return `${v}${u.label} ago`;
    }

    return '1m ago';
  }

   get lastMessageAgo(): string | null {
    if (!this.dataComments || this.dataComments.length === 0) {
      return null;
    }

    const latest = this.dataComments.reduce((latest, current) => {
      if (!latest) return current;
      const latestDate = new Date(latest.createdOn);
      const currentDate = new Date(current.createdOn);
      return currentDate > latestDate ? current : latest;
    }, null as any);

    if (!latest?.createdOn) {
      return null;
    }

    const createdOn = new Date(latest.createdOn);
    if (isNaN(createdOn.getTime())) {
      return null;
    }

    return this.timeSince(createdOn);
  }
}