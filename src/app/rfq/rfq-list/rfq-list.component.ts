import { ChangeDetectorRef, Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { QuotationRequest } from '../../models/quotation-request.model';
import { RfqService } from 'app/shared/services/rfq.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { skip } from 'rxjs/operators';
import { NgxSpinnerService } from 'ngx-spinner';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { PdfExportService } from 'app/shared/services/pdf-export.service';

@Component({
  selector: 'app-rfq-list',
  templateUrl: './rfq-list.component.html',
  styleUrls: ['./rfq-list.component.scss'],
  standalone: false
})
export class RfqListComponent implements OnInit {
  quotations: QuotationRequest[] = [];
  @ViewChild('datatable', { static: false }) datatable!: DatatableComponent;
  selectedStatus: string = '';
  isFilterOpen = false;
  forPending = false;
  datatableVisible: boolean = true;
  loadingPdfId: number | null = null;
  constructor(private rfqService: RfqService, private modalService: NgbModal,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute,
    public toastr: ToastrService,
    public spinner: NgxSpinnerService,
    private pdfExportService: PdfExportService
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.selectedStatus = params['status'] || '';
      this.forPending = params['forPending'] === 'true' || false;
      this.loadQuotations();
    });
  }


    onAutoResize(): void {
      this.spinner.show();
    this.datatableVisible = false;
    this.cdr.detectChanges(); // destroy

    requestAnimationFrame(() => {
      this.datatableVisible = true;
      this.spinner.hide();
      this.cdr.detectChanges(); // recreate
    });
  }
  loadQuotations(): void {
    const vendorUserId = localStorage.getItem('userId');
    if (!vendorUserId) {
      this.toastr.error('Vendor user not found. Please login again.');
      return;
    }

    this.spinner.show();

    this.rfqService.getQuotationsByVendor(vendorUserId, this.selectedStatus, this.forPending)
      .subscribe(res => {
        this.quotations = res;
        this.spinner.hide();
        this.cdr.detectChanges();
      });
  }

  get isMobile(): boolean {
    return window.innerWidth <= 768;
  }
  

  openBidModal(rfq: QuotationRequest): void {
    if (!rfq.id) {
      this.toastr.error('Unable to open the modal.');
      return;
    }

    this.router.navigate(['/rfq/submit-bid', rfq.id],
      {
        skipLocationChange: true
      }
    );
  }

  toggleFilterDropdown() {
    this.isFilterOpen = !this.isFilterOpen;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown')) {
      this.isFilterOpen = false;
    }
  }

  getStatusClass(status: any): string {
    const s = (status ?? '').toString().trim().toLowerCase();

    if (s === 'new') return 'status-pill--new';
    if (s === 'inprogress' || s === 'in progress' || s === 'in_progress') return 'status-pill--inprogress';
    if (s === 'completed') return 'status-pill--completed';
    if (s === 'rejected') return 'status-pill--rejected';

    return 'status-pill--default';
  }

  downloadPdf(row: QuotationRequest, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (!row?.id) return;

    this.loadingPdfId = row.id;
    this.rfqService.downloadRfqPdf(row.id).subscribe({
      next: (blob: Blob) => {
        this.loadingPdfId = null;
        const rfqNo = row.rfqNo || row.id;
        this.pdfExportService.downloadBlob(blob, `RFQ_${rfqNo}.pdf`);
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingPdfId = null;
        this.fallbackPrintRfq(row);
        this.cdr.detectChanges();
      }
    });
  }

  private fallbackPrintRfq(row: QuotationRequest): void {
    const rfqNo = row.rfqNo || `RFQ-${row.id}`;
    const items = row.qrItems || [];
    let itemsRows = '';
    items.forEach((item: any, idx: number) => {
      const qty = item.orderQuantity || item.quantity || 0;
      const uom = item.unitOfMeasurementCode || item.unitOfMeasurementSymbol || item.uom || 'EA';
      const reqDate = item.reqByDate ? new Date(item.reqByDate).toLocaleDateString() : '-';
      itemsRows += `
        <tr>
          <td class="text-center">${idx + 1}</td>
          <td>
            <strong>${item.itemName || item.itemDescription || '-'}</strong>
            ${item.itemDescription && item.itemDescription !== item.itemName ? `<br><small style="color:#64748b">${item.itemDescription}</small>` : ''}
          </td>
          <td class="text-center">${uom}</td>
          <td class="text-end"><strong>${qty}</strong></td>
          <td>${reqDate}</td>
          <td>${item.remarks || '-'}</td>
        </tr>
      `;
    });

    const statusText = row.requestStatus || 'Open';
    const subDate = row.startDate ? new Date(row.startDate).toLocaleDateString() : '-';
    const deadlineDate = row.endDate ? new Date(row.endDate).toLocaleDateString() : '-';

    const html = `
      <div class="header-bar">
        <div>
          <h1>Request For Quotation</h1>
          <div class="subtitle">Vendor Collaboration Portal</div>
        </div>
        <div class="meta-box">
          <div class="doc-number">QUOTATION #: ${rfqNo}</div>
          <div class="doc-date">Issue Date: ${subDate}</div>
          <div class="status-badge status-open">${statusText}</div>
        </div>
      </div>

      <div class="info-cards info-cards-2">
        <div class="info-card">
          <div class="info-card-header">Quotation Overview</div>
          <div class="info-card-body">
            <div class="info-row"><span class="info-label">Quotation Number</span><span class="info-value">${rfqNo}</span></div>
            <div class="info-row"><span class="info-label">Owner</span><span class="info-value">${row.owner || '-'}</span></div>
            <div class="info-row"><span class="info-label">Quote Start</span><span class="info-value">${subDate}</span></div>
            <div class="info-row"><span class="info-label">Quote End</span><span class="info-value">${deadlineDate}</span></div>
          </div>
        </div>

        <div class="info-card">
          <div class="info-card-header">Status & Scope</div>
          <div class="info-card-body">
            <div class="info-row"><span class="info-label">Status</span><span class="info-value">${statusText}</span></div>
            <div class="info-row"><span class="info-label">Total Items</span><span class="info-value">${items.length}</span></div>
          </div>
        </div>
      </div>

      <div style="margin-top: 10px; margin-bottom: 6px; display: flex; justify-content: space-between; align-items: baseline;">
        <h4 style="margin: 0; font-size: 11.5px; text-transform: uppercase; letter-spacing: 0.5px; color: #1e3a8a; font-weight: 700;">
          Quotation Items <small style="color: #64748b; font-weight: 500;">(${items.length} Items)</small>
        </h4>
      </div>

      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 32px;" class="text-center">#</th>
            <th>Item & Description</th>
            <th style="width: 60px;" class="text-center">UOM</th>
            <th style="width: 65px;" class="text-end">Qty</th>
            <th style="width: 110px;">Required Date</th>
            <th>Remarks</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows || '<tr><td colspan="6" class="text-center" style="padding: 20px; color: #94a3b8;">No RFQ items found</td></tr>'}
        </tbody>
      </table>

      <div class="footer-section">
        <div class="signature-block">
          <div class="signature-title">Procurement Authority</div>
          <div class="signature-line"></div>
          <div class="signature-name">${row.owner || 'Procurement Department'}</div>
          <div class="signature-role">Prepared & Issued</div>
        </div>
        <div class="signature-block">
          <div class="signature-title">Vendor Acknowledgment</div>
          <div class="signature-line"></div>
          <div class="signature-name">Authorized Representative</div>
          <div class="signature-role">Received & Reviewed</div>
        </div>
      </div>
    `;
    this.pdfExportService.printFormattedDocument(`RFQ_${rfqNo}`, html);
  }
}
