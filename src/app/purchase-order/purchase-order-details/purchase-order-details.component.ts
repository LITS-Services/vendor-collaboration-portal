import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
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

@Component({
  selector: 'app-vendor-purchase-order-details',
  templateUrl: './purchase-order-details.component.html',
  styleUrls: ['./purchase-order-details.component.scss'],
  standalone: false
})
export class PurchaseOrderDetailsComponent implements OnInit {
  @ViewChild('detailModal') detailModal!: TemplateRef<any>;
  @ViewChild('shipmentDetailComp') shipmentDetailComp?: ShipmentDetailsComponent;
  @ViewChild('grnDetailComp') grnDetailComp?: GrnDetailsComponent;
  @ViewChild('invoiceDetailComp') invoiceDetailComp?: InvoiceComponent;
  poDetails: any;
  loading = true;
  poId!: number;
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

  constructor(
    private route: ActivatedRoute,
    private purchaseOrderService: PurchaseOrderService,
    private shipmentService: ShipmentService,
    private toastr: ToastrService,
    private router: Router,
    public cdr: ChangeDetectorRef,
    private spinner: NgxSpinnerService,
    private modalService: NgbModal
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
        this.loading = false; }
    });
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
        this.invoiceList =rows;
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
}