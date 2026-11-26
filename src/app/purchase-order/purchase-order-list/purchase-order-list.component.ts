import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ColumnMode, DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import { NewPurchaseOrderComponent } from '../new-purchase-order/new-purchase-order.component';
import { PurchaseOrderService } from 'app/shared/services/purchase-order.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { PdfExportService } from 'app/shared/services/pdf-export.service';

@Component({
  selector: 'app-purchase-order-list',
  templateUrl: './purchase-order-list.component.html',
  styleUrls: ['./purchase-order-list.component.scss'],
  standalone: false
})
export class PurchaseOrderListComponent implements OnInit {
  public SelectionType = SelectionType;
  public ColumnMode = ColumnMode;
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @ViewChild('tableRowDetails') tableRowDetails: any;
  @ViewChild('tableResponsive') tableResponsive: any;
  public chkBoxSelected = [];
  loading = false;
  public rows = [];
  columns = [];
  announcementId: number;
  isEditButtonDisabled: boolean = true;
  isDeleteButtonDisabled: boolean = true;
  isOpenButtonDisabled: boolean = true;
  isAddNewDisable: boolean = true;
  isAllSelected: boolean = false;
  title: string = 'Purchase Orders';
  status: string = '';
  selectedStatus: string = '';
  forPending: boolean = false;
  loadingPdfId: number | null = null;

  vendorUserId!: string;
  purchaseOrders: any[] = [];

  constructor(
    private poService: PurchaseOrderService,
    private toastr: ToastrService,
    private router: Router, private route: ActivatedRoute,
    private modalService: NgbModal, public cdr: ChangeDetectorRef,
    private spinner: NgxSpinnerService,
    private pdfExportService: PdfExportService
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.selectedStatus = params['status'] || '';
      this.forPending = params['forPending'] === 'true' || false;
      this.loadPurchaseOrders();
    });
  }

  loadPurchaseOrders(): void {
    const vendorUserId = localStorage.getItem('userId');
    if (!vendorUserId) {
      this.toastr.error('Vendor user not found. Please login again.');
      return;
    }
    this.loading = true;
    this.spinner.show();
    this.poService.getPurchaseOrdersByVendorAndStatus(vendorUserId, this.selectedStatus, this.forPending)
      .subscribe(res => {
        this.purchaseOrders = res;
        this.loading = false;
        this.spinner.hide();
        this.cdr.detectChanges();
      });
  }
  
  homePage() {
    this.router.navigate(['/dashboard/dashboard1']);
  }
  openEmpDetails() {
    this.modalService.open(NewPurchaseOrderComponent, { size: 'lg', backdrop: 'static', centered: true });
    // modalRef.componentInstance.data = row;
  }
  onSort(event) {
    this.loading = true;
    setTimeout(() => {
      const rows = [...this.rows];
      const sort = event.sorts[0];
      rows.sort((a, b) => {
        return a[sort.prop].localeCompare(b[sort.prop]) * (sort.dir === 'desc' ? -1 : 1);
      });

      this.rows = rows;
      this.loading = false;
    }, 1000);
  }
  customChkboxOnSelect({ selected }) {
    this.chkBoxSelected = [];
    this.chkBoxSelected.splice(0, this.chkBoxSelected.length);
    this.chkBoxSelected.push(...selected);
    this.announcementId = selected[0]?.id;
    this.enableDisableButtons();

  }
  enableDisableButtons() {
    const selectedRowCount = this.chkBoxSelected.length;
    // Disable edit button by default
    // this.isEditButtonDisabled = true;
    // Enable delete button only if at least one row is selected
    this.isDeleteButtonDisabled = selectedRowCount === 0;
    // Enable edit button only if exactly one row is selected
    this.isEditButtonDisabled = selectedRowCount !== 1;
    this.isOpenButtonDisabled = selectedRowCount === 0;

    //this.isDeleteButtonDisabled =true;
    if (this.purchaseOrders.length != this.chkBoxSelected.length) {
      this.isAllSelected = false;
    }
    else {
      this.isAllSelected = true;
    }
  }

  openQuotationBoxModal(row: any): void {
    const modalRef = this.modalService.open(NewPurchaseOrderComponent, { size: 'xl', backdrop: 'static', centered: true, windowClass: 'custom-height-modal' });
    modalRef.componentInstance.data = row;  // Pass selected row data if needed
  }
  onRowClick(event: any) {
    if (event?.column?.name === 'Action') {
      return;
    }
    const poId = event?.row?.id;
    if (poId) {
      this.router.navigate(['/purchase-order/purchase-order-details', poId], { skipLocationChange: true });
    }
  }

  onActivate(event: any) {
    if (event.type === 'click' && event.row && event.column?.name !== 'Action') {
      const id = event.row.id;
      this.router.navigate(['/purchase-order/purchase-order-details', id], { skipLocationChange: true });
    }
  }

  downloadPdf(row: any, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (!row?.id) return;

    this.loadingPdfId = row.id;
    this.poService.downloadPurchaseOrderPdf(row.id).subscribe({
      next: (blob: Blob) => {
        this.loadingPdfId = null;
        const poNo = row.purchaseOrderNo || row.id;
        this.pdfExportService.downloadBlob(blob, `PO_${poNo}.pdf`);
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingPdfId = null;
        this.fallbackPrintPo(row);
        this.cdr.detectChanges();
      }
    });
  }

  private fallbackPrintPo(po: any): void {
    const poNo = po?.purchaseOrderNo || `PO-${po?.id}`;
    const items = po?.items || [];
    let itemsRows = '';
    items.forEach((item: any, idx: number) => {
      const qty = item.quantity || 0;
      const unitRate = Number(item.amount && item.quantity ? item.amount / item.quantity : (item.unitCost || 0)).toFixed(2);
      const totalAmount = Number(item.amount || (qty * Number(unitRate)) || 0).toFixed(2);
      itemsRows += `
        <tr>
          <td class="text-center">${idx + 1}</td>
          <td><strong>${item.itemName || '-'}</strong>${item.itemDescription && item.itemDescription !== item.itemName ? `<br><small style="color:#64748b">${item.itemDescription}</small>` : ''}</td>
          <td>${item.projectName || item.requisitionNo || '-'}</td>
          <td class="text-end">${qty}</td>
          <td class="text-end">${unitRate}</td>
          <td class="text-end">${totalAmount}</td>
        </tr>
      `;
    });

    const createdDate = po?.createdDate ? new Date(po.createdDate).toLocaleDateString() : '-';
    const statusText = po?.requestStatus || 'Active';
    const statusClass = String(statusText).toLowerCase().includes('approv') || String(statusText).toLowerCase().includes('close')
      ? 'status-approved'
      : (String(statusText).toLowerCase().includes('reject')
          ? 'status-rejected'
          : (String(statusText).toLowerCase().includes('prog') || String(statusText).toLowerCase().includes('deliv')
              ? 'status-inprogress'
              : 'status-open'));

    const html = `
      <div class="header-bar">
        <div>
          <h1>Purchase Order</h1>
          <div class="subtitle">${po?.entityName || 'Vendor Collaboration Portal'}</div>
        </div>
        <div class="meta-box">
          <div class="doc-number">ORDER #: ${poNo}</div>
          <div class="doc-date">Date: ${createdDate}</div>
          <div class="status-badge ${statusClass}">${statusText}</div>
        </div>
      </div>

      <div class="info-cards info-cards-3">
        <div class="info-card">
          <div class="info-card-header">Order & Vendor Details</div>
          <div class="info-card-body">
            <div class="info-row"><span class="info-label">Entity</span><span class="info-value">${po?.entityName || '-'}</span></div>
            <div class="info-row"><span class="info-label">Order Date</span><span class="info-value">${createdDate}</span></div>
            <div class="info-row"><span class="info-label">Status</span><span class="info-value">${statusText}</span></div>
          </div>
        </div>
        <div class="info-card">
          <div class="info-card-header">Shipment & Delivery</div>
          <div class="info-card-body">
            <div class="info-row"><span class="info-label">Ship To</span><span class="info-value">${po?.shipToName || po?.receiverName || '-'}</span></div>
            <div class="info-row"><span class="info-label">Location Code</span><span class="info-value">${po?.locationCode || '-'}</span></div>
            <div class="info-row"><span class="info-label">Destination</span><span class="info-value">${[po?.shipToCity, po?.shipToCountry].filter(Boolean).join(', ') || '-'}</span></div>
            <div class="info-row"><span class="info-label">Post Code</span><span class="info-value">${po?.shipToPostCode || '-'}</span></div>
          </div>
        </div>
        <div class="info-card">
          <div class="info-card-header">Procurement References</div>
          <div class="info-card-body">
            <div class="info-row"><span class="info-label">Order Number</span><span class="info-value">${poNo}</span></div>
            <div class="info-row"><span class="info-label">Purchase Request</span><span class="info-value">${po?.requisitionNo || '-'}</span></div>
            <div class="info-row"><span class="info-label">Quotation</span><span class="info-value">${po?.rfqNo || '-'}</span></div>
          </div>
        </div>
      </div>

      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 32px;" class="text-center">#</th>
            <th>Item & Description</th>
            <th>Project / Reference</th>
            <th style="width: 65px;" class="text-end">Qty</th>
            <th style="width: 110px;" class="text-end">Unit Rate (AED)</th>
            <th style="width: 120px;" class="text-end">Total (AED)</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows || '<tr><td colspan="6" class="text-center" style="padding: 20px; color: #94a3b8;">No purchase order items found</td></tr>'}
        </tbody>
      </table>

      <div class="totals-box">
        <div class="totals-card">
          <div class="totals-row">
            <span>Subtotal:</span>
            <span>AED ${Number(po?.totalAmount || 0).toFixed(2)}</span>
          </div>
          <div class="totals-row">
            <span>VAT / Taxes:</span>
            <span>AED 0.00</span>
          </div>
          <div class="totals-row grand-total">
            <span>Grand Total:</span>
            <span>AED ${Number(po?.totalAmount || 0).toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div class="footer-section">
        <div class="signature-block">
          <div class="signature-title">Authorized Buyer</div>
          <div class="signature-line"></div>
          <div class="signature-name">Procurement Authority</div>
          <div class="signature-role">Approved Purchase Order</div>
        </div>
        <div class="signature-block">
          <div class="signature-title">Vendor Acceptance</div>
          <div class="signature-line"></div>
          <div class="signature-name">Vendor Authorized Signatory</div>
          <div class="signature-role">Acknowledgment & Acceptance</div>
        </div>
      </div>
    `;
    this.pdfExportService.printFormattedDocument(`PO_${poNo}`, html);
  }

  mapStatusKey(status: any): string {
    const s = (status ?? '').toString().trim().toLowerCase();

    if (s === 'completed' || s === 'successful' || s === 'accepted' || s === 'paid' || s === 'closed')
      return 'status-pill--completed';

    if (s === 'rejected')
      return 'status-pill--rejected';

    if (s === 'pending for payment' || s === 'pending' || s === 'on hold' || s === 'delivered')
      return 'status-pill--inprogress';

    if (s === 'approved for payment' || s === 'approved' || s === 'new' || s === 'open')
      return 'status-pill--new';

    return 'status-pill--default';
  }
}