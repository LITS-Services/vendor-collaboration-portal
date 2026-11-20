import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GrnDetailsComponent } from 'app/purchase-order/purchase-order-details/grn-details/grn-details.component';
import { InvoiceComponent } from 'app/purchase-order/purchase-order-details/invoice/invoice.component';
import { ShipmentDetailsComponent } from 'app/purchase-order/purchase-order-details/shipment-details/shipment-details.component';
import { ShipmentLinesModalComponent } from 'app/purchase-order/purchase-order-details/shipment-lines-modal/shipment-lines-modal.component';
import { PurchaseOrderService } from 'app/shared/services/purchase-order.service';
import { ShipmentService } from 'app/shared/services/shipment.service';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { PdfExportService } from 'app/shared/services/pdf-export.service';

@Component({
  selector: 'app-vendor-purchase-order-details',
  templateUrl: './purchase-order-details.component.html',
  styleUrls: ['./purchase-order-details.component.scss'],
  standalone: false
})
export class PurchaseOrderDetailsComponent implements OnInit {
  @ViewChild('detailModal') detailModal!: TemplateRef<any>;
  @ViewChild('acknowledgeOrderModal') acknowledgeOrderModal!: TemplateRef<any>;
  @ViewChild('shipmentDetailComp') shipmentDetailComp?: ShipmentDetailsComponent;
  @ViewChild('grnDetailComp') grnDetailComp?: GrnDetailsComponent;
  @ViewChild('invoiceDetailComp') invoiceDetailComp?: InvoiceComponent;
  poDetails: any;
  loading = true;
  poId!: number;
  isGeneratingPdf: boolean = false;
  itemsExpanded: boolean = true;
  selectedTab: any = 'po-details';
  shipments: any[] = [];
  grnList: any[] = [];
  invoiceList: any[] = [];
  selectedShipmentId?: number;
  selectedGrnId?: number;
  selectedInvoicePoId?: number;
  modalTitle = '';
  modalRef?: NgbModalRef;
  shipmentLoaded = false;
  grnLoaded = false;
  invoiceLoaded = false;
  modalShipmentReady = false;
  modalShipmentIsEdit = false;
  modalShipmentReadyForPosting = false;
  modalInvoiceReady = false;
  modalInvoiceIsEdit = false;
  modalGrnReady = false;
  loadingGrnPdfId: number | null = null;

  // Order Acknowledgment
  acknowledgeForm!: FormGroup;
  isSubmittingAcknowledgment: boolean = false;
  carrierList: string[] = ['DHL Express', 'FedEx', 'UPS', 'Maersk Logistics', 'Local Carrier / Fleet', 'Customer Pickup', 'Other'];
  minDispatchDate: string = new Date().toISOString().split('T')[0];

  constructor(
    private route: ActivatedRoute,
    private purchaseOrderService: PurchaseOrderService,
    private shipmentService: ShipmentService,
    private toastr: ToastrService,
    private router: Router,
    public cdr: ChangeDetectorRef,
    private spinner: NgxSpinnerService,
    private modalService: NgbModal,
    private pdfExportService: PdfExportService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.poId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadPurchaseOrder();
  }

  loadPurchaseOrder() {
    this.loading = true;
    this.spinner.show();
    this.purchaseOrderService.getPurchaseOrderById(this.poId).subscribe({
      next: (res) => {
        this.poDetails = res;
        this.loading = false;
        this.spinner.hide();
        this.cdr.detectChanges();
      },
      error: () => {
        this.spinner.hide();
        this.loading = false;
      }
    });
  }


  goBacktoPOList() {
    this.router.navigate(['/purchase-order/purchase-order-list']);
  }

  toggleItems() {
    this.itemsExpanded = !this.itemsExpanded;
  }

  goToShipment() {
    this.router.navigate(['shipment'], { relativeTo: this.route, skipLocationChange: true });
  }
  goBack() {
    this.router.navigate(['/purchase-order/purchase-order-list']);
  }

  selectTab(tab: any) {
    this.selectedTab = tab;
    this.cdr.detectChanges();

    if (tab === 'shipment-details' && !this.shipmentLoaded) {
      //this.loadShipments();
    }

    if (tab === 'grn-details' && !this.grnLoaded) {
      this.loadGrnList();
    }

    if (tab === 'invoice-details' && !this.invoiceLoaded) {
      this.loadInvoiceList();
    }
  }

  loadShipments() {
    this.loading = true;
    this.spinner.show();
    this.shipmentService.getAllShipmentDetailByPurchaseOrder(this.poId).subscribe({
      next: (res) => {
        this.shipments = this.extractRows(res);
        this.shipmentLoaded = true;
        this.loading = false;
        this.spinner.hide();
        this.cdr.detectChanges();
      },
      error: () => {
        this.shipments = [];
        this.shipmentLoaded = true;
        this.loading = false;
        this.spinner.hide();
        this.cdr.detectChanges();
      }
    });
  }

  loadGrnList() {
    this.loading = true;
    this.spinner.show();
    this.purchaseOrderService.getAllGoodsReceiptNotes(this.poId).subscribe({
      next: (res) => {
        this.grnList = this.extractRows(res);
        this.grnLoaded = true;
        this.loading = false;
        this.spinner.hide();
        this.cdr.detectChanges();
      },
      error: () => {
        this.grnList = [];
        this.grnLoaded = true;
        this.loading = false;
        this.spinner.hide();
        this.cdr.detectChanges();
      }
    });
  }

  loadInvoiceList() {
    this.loading = true;
    this.spinner.show();
    this.purchaseOrderService.getAllPoInvoices(this.poId, 1, 200).subscribe({
      next: (res) => {
        const rows = this.extractRows(res);
        this.invoiceList = rows;
        this.invoiceLoaded = true;
        this.loading = false;
        this.spinner.hide();
        this.cdr.detectChanges();
      },
      error: () => {
        this.invoiceList = [];
        this.invoiceLoaded = true;
        this.loading = false;
        this.spinner.hide();
        this.cdr.detectChanges();
      }
    });
  }

  openShipmentDetail(row: any) {
    this.selectedShipmentId = row.id;
    this.selectedGrnId = undefined;
    this.selectedInvoicePoId = undefined;
    this.modalShipmentReady = false;
    this.modalShipmentIsEdit = false;
    this.modalShipmentReadyForPosting = false;
    this.modalTitle = 'Shipment Detail';
    this.modalRef = this.modalService.open(this.detailModal, { size: 'xl', centered: true, scrollable: true });
  }

  openGrnDetail(row: any) {
    this.selectedGrnId = row.id;
    this.selectedShipmentId = undefined;
    this.selectedInvoicePoId = undefined;
    this.modalGrnReady = false;
    this.modalTitle = 'Goods Receipt Note';
    this.modalRef = this.modalService.open(this.detailModal, { size: 'xl', centered: true, scrollable: true });
  }

  openInvoiceDetail(row: any) {
    this.selectedInvoicePoId = Number(row.purchaseOrderId);
    this.selectedShipmentId = undefined;
    this.selectedGrnId = undefined;
    this.modalInvoiceReady = false;
    this.modalInvoiceIsEdit = false;
    this.modalTitle = 'Invoice Detail';
    this.modalRef = this.modalService.open(this.detailModal, { size: 'xl', centered: true, scrollable: true });
  }

  closeModal() {
    this.modalRef?.close();
  }

  saveShipmentFromModal() {
    this.shipmentDetailComp?.save();
  }

  cancelShipmentFromModal() {
    this.shipmentDetailComp?.deleteShipment();
  }

  downloadGrnFromModal() {
    this.grnDetailComp?.downloadPdf();
  }

  downloadGrnPdf(row: any, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    const targetId = row?.purchaseOrderId || row?.id || this.poId;
    if (!targetId) return;

    this.loadingGrnPdfId = targetId;
    this.purchaseOrderService.downloadGrnPdf(targetId).subscribe({
      next: (blob: Blob) => {
        this.loadingGrnPdfId = null;
        const grNo = row?.grNumber || targetId;
        this.pdfExportService.downloadBlob(blob, `GRN_${grNo}.pdf`);
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingGrnPdfId = null;
        this.toastr.info('Opening GRN details for document preview...');
        this.openGrnDetail(row);
        this.cdr.detectChanges();
      }
    });
  }

  downloadInvoiceFromModal() {
    this.invoiceDetailComp?.downloadInvoice();
  }

  requestInvoiceFromGrn() {
    this.closeModal();
    this.selectTab('invoice-details');
  }

  requestForPayment() {
    this.purchaseOrderService.requestForPayment(this.poId).subscribe({
      next: () => {
        this.toastr.success('Payment request sent successfully');
      },
      error: () => {
        this.toastr.error('Failed to send payment request');
      }
    });
  }



  onShipmentStateChange(event: { ready: boolean; isEdit: boolean; readyForPosting: boolean }) {
    this.modalShipmentReady = event.ready;
    this.modalShipmentIsEdit = event.isEdit;
    this.modalShipmentReadyForPosting = event.readyForPosting;
    this.cdr.detectChanges();
  }

  onGrnStateChange(event: { ready: boolean }) {
    this.modalGrnReady = event.ready;
    this.cdr.detectChanges();
  }

  onInvoiceStateChange(event: { ready: boolean; isEdit: boolean }) {
    this.modalInvoiceReady = event.ready;
    this.modalInvoiceIsEdit = event.isEdit;
    this.cdr.detectChanges();
  }

  // --- Shipment Lines Modal Logic ---
  @ViewChild('shipmentLinesModalComp') shipmentLinesModalComp?: ShipmentLinesModalComponent;
  selectedPoLineId?: number;
  selectedOrderedQty = 0;
  selectedItemName = '';
  modalShipmentLinesReady = false;

  openShipmentLineDetail(row: any) {
    this.selectedPoLineId = row.id || row.purchaseOrderLineId;
    this.selectedOrderedQty = row.quantity ?? row.orderedQuantity ?? row.qty ?? 0;
    this.selectedItemName = row.itemName ?? row.item ?? '-';

    // Reset other modal selections
    this.selectedShipmentId = undefined;
    this.selectedGrnId = undefined;
    this.selectedInvoicePoId = undefined;

    this.modalShipmentLinesReady = false;
    this.modalTitle = 'Shipment Details';
    this.modalRef = this.modalService.open(this.detailModal, { size: 'lg', centered: true, scrollable: true });
  }

  onShipmentLinesStateChange(event: { ready: boolean }) {
    this.modalShipmentLinesReady = event.ready;
    this.cdr.detectChanges();
  }

  saveShipmentLinesFromModal() {
    this.shipmentLinesModalComp?.save();
  }
  // ----------------------------------

  mapStatusKey(status: any): string {
    const s = (status ?? '').toString().trim().toLowerCase();

    if (s === 'completed' || s === 'successful' || s === 'accepted' || s === 'paid' || s === 'closed') {
      return 'status-pill--completed';
    }

    if (s === 'rejected') {
      return 'status-pill--rejected';
    }

    if (s === 'pending for payment' || s === 'pending' || s === 'on hold' || s === 'delivered' || s === 'in process') {
      return 'status-pill--inprogress';
    }

    if (s === 'approved for payment' || s === 'approved' || s === 'new' || s === 'open') {
      return 'status-pill--new';
    }

    return 'status-pill--default';
  }

  private extractRows(res: any): any[] {
    if (Array.isArray(res)) {
      return res;
    }

    return res?.value?.result || res?.result || res?.items || res?.data?.items || res?.value?.items || [];
  }

  openAcknowledgeOrderModal() {
    const todayStr = new Date().toISOString().split('T')[0];

    const lines = this.poDetails?.items || [];
    const itemsArray = this.fb.array(
      lines.map((item: any) =>
        this.fb.group({
          purchaseOrderLineId: [item.purchaseOrderLineId || item.id],
          itemName: [item.itemName || 'Item'],
          itemDescription: [item.itemDescription || ''],
          quantity: [item.quantity || 0],
          estimatedDeliveryDate: [item.deliveryDate ? new Date(item.deliveryDate).toISOString().split('T')[0] : todayStr, Validators.required],
          estimatedDispatchDate: [item.estimatedDispatchDate ? new Date(item.estimatedDispatchDate).toISOString().split('T')[0] : todayStr],
          remarks: ['']
        })
      )
    );

    const defaultSigner = localStorage.getItem('userName') || localStorage.getItem('userEmail') || this.poDetails?.vendorName || '';

    this.acknowledgeForm = this.fb.group({
      estimatedDispatchDate: [todayStr, Validators.required],
      transportCarrier: ['', Validators.required],
      carrierOther: [''],
      contractualAcceptance: [false, Validators.requiredTrue],
      acknowledgedBy: [defaultSigner, Validators.required],
      remarks: [''],
      itemSchedules: itemsArray
    });

    this.modalRef = this.modalService.open(this.acknowledgeOrderModal, {
      size: 'lg',
      backdrop: 'static',
      centered: true,
      scrollable: true
    });
  }

  onCarrierChange() {
    const carrier = this.acknowledgeForm.get('transportCarrier')?.value;
    const otherCtrl = this.acknowledgeForm.get('carrierOther');
    if (carrier === 'Other') {
      otherCtrl?.setValidators([Validators.required]);
    } else {
      otherCtrl?.clearValidators();
    }
    otherCtrl?.updateValueAndValidity();
    this.cdr.detectChanges();
  }

  get itemSchedulesArray(): FormArray {
    return this.acknowledgeForm.get('itemSchedules') as FormArray;
  }

  submitOrderAcknowledgment() {
    if (this.acknowledgeForm.invalid) {
      this.acknowledgeForm.markAllAsTouched();
      return;
    }

    const formVal = this.acknowledgeForm.value;
    const carrier = formVal.transportCarrier === 'Other' && formVal.carrierOther
      ? formVal.carrierOther
      : formVal.transportCarrier;

    const payload = {
      purchaseOrderId: this.poId,
      estimatedDispatchDate: formVal.estimatedDispatchDate,
      transportCarrier: carrier,
      contractualAcceptance: formVal.contractualAcceptance,
      acknowledgedBy: formVal.acknowledgedBy,
      remarks: formVal.remarks,
      itemSchedules: (formVal.itemSchedules || []).map((s: any) => ({
        purchaseOrderLineId: s.purchaseOrderLineId,
        estimatedDeliveryDate: s.estimatedDeliveryDate,
        estimatedDispatchDate: s.estimatedDispatchDate || formVal.estimatedDispatchDate,
        quantity: s.quantity,
        remarks: s.remarks
      }))
    };

    this.isSubmittingAcknowledgment = true;
    this.purchaseOrderService.acknowledgePurchaseOrder(payload).subscribe({
      next: (res: any) => {
        this.isSubmittingAcknowledgment = false;
        this.modalRef?.close();
        Swal.fire({
          icon: 'success',
          title: 'Order Acknowledged',
          text: 'Digital Order Acknowledgment and dispatch schedules have been submitted successfully.',
          confirmButtonColor: '#28a745'
        });
        this.loadPurchaseOrder();
      },
      error: (err: any) => {
        this.isSubmittingAcknowledgment = false;
        const msg = err?.error?.errors?.[0] || err?.error?.message || 'Failed to submit order acknowledgment.';
        this.toastr.error(msg, 'Error');
        this.cdr.detectChanges();
      }
    });
  }

  rejectPurchaseOrder() {
    if (!this.poId) {
      return;
    }

    Swal.fire({
      title: 'Reject Purchase Order?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Reject',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6'
    }).then((result) => {
      if (result.isConfirmed) {
        this.loading = true;
        this.spinner.show();
        this.purchaseOrderService.rejectPurchaseOrder(this.poId)
          .pipe(finalize(() => { this.spinner.hide(); }))
          .subscribe({
            next: () => {
              this.loadPurchaseOrder();
            },
            error: () => {
              this.loading = false;
              this.toastr.error('Failed to reject Purchase Order');
            }
          });
      }
    });
  }

  downloadPdf(): void {
    if (!this.poId) {
      this.toastr.warning('Please select a purchase order first.');
      return;
    }
    this.isGeneratingPdf = true;
    this.spinner.show();
    this.purchaseOrderService.downloadPurchaseOrderPdf(this.poId).subscribe({
      next: (blob: Blob) => {
        this.isGeneratingPdf = false;
        this.spinner.hide();
        const poNo = this.poDetails?.purchaseOrderNo || this.poId;
        this.pdfExportService.downloadBlob(blob, `PO_${poNo}.pdf`);
        this.cdr.detectChanges();
      },
      error: () => {
        this.isGeneratingPdf = false;
        this.spinner.hide();
        this.fallbackPrintPo();
        this.cdr.detectChanges();
      }
    });
  }

  private fallbackPrintPo(): void {
    const po = this.poDetails;
    const poNo = po?.purchaseOrderNo || `PO-${this.poId}`;
    const items = po?.items || [];
    const hasShipping = items.some((it: any) => (it.shippingQuantity || it.shippedQuantity) > 0);
    let itemsRows = '';
    items.forEach((item: any, idx: number) => {
      const qty = item.quantity || 0;
      const shipQty = item.shippingQuantity ?? item.shippedQuantity ?? '-';
      const unitRate = Number(item.amount && item.quantity ? item.amount / item.quantity : (item.unitCost || 0)).toFixed(2);
      const totalAmount = Number(item.amount || (qty * Number(unitRate)) || 0).toFixed(2);
      itemsRows += `
        <tr>
          <td class="text-center">${idx + 1}</td>
          <td><strong>${item.itemName || '-'}</strong>${item.itemDescription && item.itemDescription !== item.itemName ? `<br><small style="color:#64748b">${item.itemDescription}</small>` : ''}</td>
          <td class="text-end">${qty}</td>
          ${hasShipping ? `<td class="text-end font-monospace" style="color: #15803d; font-weight: 600;">${shipQty}</td>` : ''}
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

    const destination = [po?.shipToCity, po?.shipToCountry].filter(Boolean).join(', ') || '-';
    const shipmentsList = this.shipments || [];
    let shipmentsRows = '';
    shipmentsList.forEach((s: any, idx: number) => {
      const sDate = s.shipmentDate || s.postingDate ? new Date(s.shipmentDate || s.postingDate).toLocaleDateString() : '-';
      shipmentsRows += `
        <tr>
          <td class="text-center">${idx + 1}</td>
          <td><strong>${s.shipmentNo || s.shipmentDetailNo || `SH-${s.id || idx + 1}`}</strong></td>
          <td>${sDate}</td>
          <td>${s.transferFromCode || '-'}</td>
          <td>${s.transferToCode || po?.locationCode || '-'}</td>
          <td class="text-end font-monospace">${s.lines?.reduce((sum: number, l: any) => sum + (l.quantity || 0), 0) || s.quantity || '-'}</td>
          <td class="text-center"><span class="status-badge status-inprogress">${s.readyForPosting ? 'Ready' : 'In Transit'}</span></td>
        </tr>
      `;
    });

    const html = `
      <div class="header-bar">
        <div>
          <h1>Purchase Order</h1>
          <div class="subtitle">${po?.entityName || 'Vendor Collaboration Portal'}</div>
        </div>
        <div class="meta-box">
          <div class="doc-number">PO #: ${poNo}</div>
          <div class="doc-date">Date: ${createdDate}</div>
          <div class="status-badge ${statusClass}">${statusText}</div>
        </div>
      </div>

      <div class="info-cards info-cards-3">
        <div class="info-card">
          <div class="info-card-header">Vendor Details</div>
          <div class="info-card-body">
            <div class="info-row"><span class="info-label">Vendor</span><span class="info-value">${po?.vendorCompanyName || po?.vendorName || '-'}</span></div>
            <div class="info-row"><span class="info-label">Order Date</span><span class="info-value">${createdDate}</span></div>
            <div class="info-row"><span class="info-label">Status</span><span class="info-value">${statusText}</span></div>
          </div>
        </div>

        <div class="info-card">
          <div class="info-card-header">Shipment & Delivery</div>
          <div class="info-card-body">
            <div class="info-row"><span class="info-label">Ship To</span><span class="info-value">${po?.shipToName || po?.receiverName || '-'}</span></div>
            <div class="info-row"><span class="info-label">Loc. Code</span><span class="info-value">${po?.locationCode || '-'}</span></div>
            <div class="info-row"><span class="info-label">Destination</span><span class="info-value">${destination}</span></div>
            <div class="info-row"><span class="info-label">Post Code</span><span class="info-value">${po?.shipToPostCode || '-'}</span></div>
            ${po?.shipmentDetailNo ? `<div class="info-row"><span class="info-label">Shipment Ref</span><span class="info-value">${po.shipmentDetailNo}</span></div>` : ''}
          </div>
        </div>

        <div class="info-card">
          <div class="info-card-header">Procurement References</div>
          <div class="info-card-body">
            <div class="info-row"><span class="info-label">PO Number</span><span class="info-value">${poNo}</span></div>
            <div class="info-row"><span class="info-label">PR Reference</span><span class="info-value">${po?.requisitionNo || '-'}</span></div>
            <div class="info-row"><span class="info-label">RFQ Reference</span><span class="info-value">${po?.rfqNo || '-'}</span></div>
          </div>
        </div>
      </div>

      <div style="margin-top: 10px; margin-bottom: 6px; display: flex; justify-content: space-between; align-items: baseline;">
        <h4 style="margin: 0; font-size: 11.5px; text-transform: uppercase; letter-spacing: 0.5px; color: #1e3a8a; font-weight: 700;">
          Purchase Order Items <small style="color: #64748b; font-weight: 500;">(${items.length} Items)</small>
        </h4>
      </div>

      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 32px;" class="text-center">#</th>
            <th>Item & Description</th>
            <th style="width: 65px;" class="text-end">Ord. Qty</th>
            ${hasShipping ? '<th style="width: 65px;" class="text-end">Ship. Qty</th>' : ''}
            <th style="width: 105px;" class="text-end">Unit Rate (AED)</th>
            <th style="width: 115px;" class="text-end">Total (AED)</th>
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

      ${shipmentsRows ? `
        <div style="margin-top: 16px; margin-bottom: 6px;">
          <h4 style="margin: 0; font-size: 11.5px; text-transform: uppercase; letter-spacing: 0.5px; color: #1e3a8a; font-weight: 700;">
            Shipment & Consignment Records <small style="color: #64748b; font-weight: 500;">(${shipmentsList.length} Consignments)</small>
          </h4>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 32px;" class="text-center">#</th>
              <th>Shipment No</th>
              <th>Shipment Date</th>
              <th>From Location</th>
              <th>To Destination</th>
              <th style="width: 70px;" class="text-end">Qty</th>
              <th style="width: 80px;" class="text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            ${shipmentsRows}
          </tbody>
        </table>
      ` : ''}

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
          <div class="signature-name">${po?.vendorCompanyName || 'Authorized Signatory'}</div>
          <div class="signature-role">Acknowledgment & Seal</div>
        </div>
      </div>
    `;
    this.pdfExportService.printFormattedDocument(`PO_${poNo}`, html);
  }
}