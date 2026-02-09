import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { AuthService } from 'app/shared/auth/auth.service';
import { InvoiceQuery, PurchaseOrderService } from 'app/shared/services/purchase-order.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-invoice-list',
  templateUrl: './invoice-list.html',
  styleUrl: './invoice-list.scss',
  standalone: false
})
export class InvoiceList implements OnInit {
  @ViewChild('datatable', { static: false }) datatable!: DatatableComponent;
  invoices: any[] = [];
  selectedStatus: string = '';
  totalPages: number = 0;
  totalItems: number = 0;
  loading: boolean = false;
  datatableVisible: boolean = true;

  query: InvoiceQuery = {
    currentPage: 1,
    pageSize: 10,
    vendorId: this.authService.getUserId(),
    status: this.selectedStatus
  };


  constructor(
    private purchaseOrderService: PurchaseOrderService,
    private toastr: ToastrService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private spinner: NgxSpinnerService
  ) { }

  ngOnInit(): void {
    //this.loadInvoices();
    this.cdr.detectChanges();
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
  loadInvoices() {
    this.query.status = this.selectedStatus;
    this.loading = true;
    this.spinner.show();
    this.purchaseOrderService.getAllInvoices(this.query).subscribe({
      next: (res: any) => {
        this.invoices = res?.result;
        this.totalItems = res.totalItems;
        this.loading = false;
        this.spinner.hide();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.toastr.error('Failed to load invoices');
        this.loading = false;
      }
    });
  }

  getStatusClass(status: string) {
    switch (status?.toLowerCase()) {
      case 'new': return 'status-pill--new';
      case 'approved for payment': return 'status-pill--new';
      case 'pending for payment': return 'status-pill--inprogress';
      case 'on hold': return 'status-pill--inprogress';
      case 'paid': return 'status-pill--completed';
      default: return 'status-pill--default';
    }
  }

    onPageChange(event: any) {
    this.query.currentPage = (event?.offset ?? 0) + 1;
    this.loadInvoices();
  }

  downloadInvoice(invoiceId: number, invoiceNo: string) {
    this.purchaseOrderService.downloadInvoicePdf(invoiceId).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Invoice_${invoiceNo}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    });
  }
}