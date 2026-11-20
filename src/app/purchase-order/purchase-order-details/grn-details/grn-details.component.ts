import { formatDate } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { PurchaseOrderService } from 'app/shared/services/purchase-order.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { PdfExportService } from 'app/shared/services/pdf-export.service';

@Component({
  selector: 'app-grn-details',
  templateUrl: './grn-details.component.html',
  styleUrls: ['./grn-details.component.scss'],
  standalone: false
})
export class GrnDetailsComponent implements OnInit {
  @Input() poId: number;
  @Input() grnId?: number;
  @Input() inModal = false;
  @Output() stateChange = new EventEmitter<{ ready: boolean }>();
  grnDetails: any;
  loading = true;
  isGeneratingPdf = false;
  itemsExpanded: boolean = true;
  constructor(
    private router: Router,
    private purchaseOrderService: PurchaseOrderService,
    private cdr: ChangeDetectorRef,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private pdfExportService: PdfExportService
  ) { }

  ngOnInit(): void {
    if (this.grnId || this.poId) {
      this.loadGrnDetails();
    }
  }
  loadGrnDetails() {
    this.loading = true;
    this.spinner.show();
    const targetId = this.grnId ?? this.poId;
    this.purchaseOrderService.getGoodsReceiptNoteById(targetId).subscribe({
      next: res => {
        this.grnDetails = res;
        this.loading = false;
        this.spinner.hide();
        this.cdr.detectChanges();
        this.stateChange.emit({ ready: true });
      },
      error: () => {
        this.loading = false;
        this.spinner.hide();
        this.stateChange.emit({ ready: true });
      }
    });
  }

  downloadPdf(): void {
    const targetId = this.poId || this.grnId || this.grnDetails?.purchaseOrderId || this.grnDetails?.id;
    if (!targetId) {
      this.toastr.warning('Please select a GRN first.');
      return;
    }
    this.isGeneratingPdf = true;
    this.spinner.show();
    this.purchaseOrderService.downloadGrnPdf(targetId).subscribe({
      next: (blob: Blob) => {
        this.isGeneratingPdf = false;
        this.spinner.hide();
        const grNo = this.grnDetails?.grNumber || `GRN-${targetId}`;
        this.pdfExportService.downloadBlob(blob, `GRN_${grNo}.pdf`);
        this.cdr.detectChanges();
      },
      error: () => {
        this.isGeneratingPdf = false;
        this.spinner.hide();
        this.fallbackPrintGrn();
        this.cdr.detectChanges();
      }
    });
  }

  fallbackPrintGrn(): void {
    const grn = this.grnDetails;
    const grNo = grn?.grNumber || `GRN-${this.poId || this.grnId || 'Draft'}`;
    const items = grn?.goodsReceiptItems || [];
    let itemsRows = '';
    items.forEach((item: any, idx: number) => {
      itemsRows += `
        <tr>
          <td class="text-center">${idx + 1}</td>
          <td><strong>${item.itemName || item.itemNo || '-'}</strong></td>
          <td class="text-center">${item.locationCode || grn?.locationCode || '-'}</td>
          <td class="text-center">${this.formatDisplayDate(item.plannedReceiptDate) || '-'}</td>
          <td class="text-end font-monospace"><strong>${Number(item.quantity || 0).toFixed(2)}</strong></td>
          <td class="text-end">${Number(item.unitCostExclVat || 0).toFixed(2)}</td>
        </tr>
      `;
    });

    const statusText = grn?.requestStatus || 'Received';
    const postingDate = this.formatDisplayDate(grn?.postingDate) || this.formatDisplayDate(grn?.createdDate) || '-';

    const html = `
      <div class="header-bar">
        <div>
          <h1>Goods Receipt Note (GRN)</h1>
          <div class="subtitle">Vendor Collaboration Portal</div>
        </div>
        <div class="meta-box">
          <div class="doc-number">GRN #: ${grNo}</div>
          <div class="doc-date">Date: ${postingDate}</div>
          <div class="status-badge status-completed">${statusText}</div>
        </div>
      </div>

      <div class="info-cards info-cards-3">
        <div class="info-card">
          <div class="info-card-header">GRN & PO Details</div>
          <div class="info-card-body">
            <div class="info-row"><span class="info-label">GRN Number</span><span class="info-value">${grNo}</span></div>
            <div class="info-row"><span class="info-label">PO Reference</span><span class="info-value">${grn?.purchaseOrderNo || '-'}</span></div>
            <div class="info-row"><span class="info-label">Status</span><span class="info-value">${statusText}</span></div>
            <div class="info-row"><span class="info-label">Posting Date</span><span class="info-value">${postingDate}</span></div>
          </div>
        </div>

        <div class="info-card">
          <div class="info-card-header">Receiving Inspection</div>
          <div class="info-card-body">
            <div class="info-row"><span class="info-label">Receiver</span><span class="info-value">${grn?.receiverName || '-'}</span></div>
            <div class="info-row"><span class="info-label">Location Code</span><span class="info-value">${grn?.locationCode || '-'}</span></div>
            <div class="info-row"><span class="info-label">Vendor</span><span class="info-value">${grn?.vendorName || '-'}</span></div>
            <div class="info-row"><span class="info-label">Remarks</span><span class="info-value">${grn?.remarks || 'Received in good condition'}</span></div>
          </div>
        </div>

        <div class="info-card">
          <div class="info-card-header">Shipment Destination</div>
          <div class="info-card-body">
            <div class="info-row"><span class="info-label">Ship To</span><span class="info-value">${grn?.shipToName || '-'}</span></div>
            <div class="info-row"><span class="info-label">Address</span><span class="info-value">${grn?.shipToAddress || '-'}</span></div>
            <div class="info-row"><span class="info-label">City / Country</span><span class="info-value">${[grn?.shipToCity, grn?.shipToCountry].filter(Boolean).join(', ') || '-'}</span></div>
            <div class="info-row"><span class="info-label">Post Code</span><span class="info-value">${grn?.shipToPostCode || '-'}</span></div>
          </div>
        </div>
      </div>

      <div style="margin-top: 10px; margin-bottom: 6px; display: flex; justify-content: space-between; align-items: baseline;">
        <h4 style="margin: 0; font-size: 11.5px; text-transform: uppercase; letter-spacing: 0.5px; color: #1e3a8a; font-weight: 700;">
          Received Items & Inspection <small style="color: #64748b; font-weight: 500;">(${items.length} Items)</small>
        </h4>
      </div>

      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 32px;" class="text-center">#</th>
            <th>Item & Description</th>
            <th style="width: 90px;" class="text-center">Location</th>
            <th style="width: 100px;" class="text-center">Receipt Date</th>
            <th style="width: 90px;" class="text-end">Received Qty</th>
            <th style="width: 110px;" class="text-end">Unit Rate (AED)</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows || '<tr><td colspan="6" class="text-center" style="padding: 20px; color: #94a3b8;">No receipt items recorded</td></tr>'}
        </tbody>
      </table>

      <div class="footer-section">
        <div class="signature-block">
          <div class="signature-title">Received & Inspected By</div>
          <div class="signature-line"></div>
          <div class="signature-name">${grn?.receiverName || 'Receiving Officer'}</div>
          <div class="signature-role">Quality & Quantity Verified</div>
        </div>
        <div class="signature-block">
          <div class="signature-title">Warehouse Authority</div>
          <div class="signature-line"></div>
          <div class="signature-name">Store / Logistics Manager</div>
          <div class="signature-role">Inventory Receipt Confirmation</div>
        </div>
      </div>
    `;
    this.pdfExportService.printFormattedDocument(`GRN_${grNo}`, html);
  }

  formatDisplayDate(value: string | Date | null | undefined): string {
    if (!value) {
      return '';
    }
    const date = new Date(value);
    if (isNaN(date.getTime()) || date.getFullYear() <= 1) {
      return '';
    }
    return formatDate(date, 'yyyy-MM-dd', 'en-US');
  }

  toggleItems() {
    this.itemsExpanded = !this.itemsExpanded;
  }

  goBack() {
    this.router.navigate(['/purchase-order/purchase-order-list']);
  }
}