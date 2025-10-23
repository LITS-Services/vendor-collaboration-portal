import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ColumnMode, DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import { NewPurchaseOrderComponent } from '../new-purchase-order/new-purchase-order.component';
import { PurchaseOrderService } from 'app/shared/services/purchase-order.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-purchase-order-list',
  templateUrl: './purchase-order-list.component.html',
  styleUrls: ['./purchase-order-list.component.scss']
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
  // constructor(private router: Router, private route: ActivatedRoute,
  //   private modalService: NgbModal) { }

  // ngOnInit(): void {
  //   this.route.queryParams.subscribe(params => {
  //     if (params['title']) {
  //       this.title = params['title'];
  //     }
  //     if (params['status']) {
  //       this.status = params['status'];
  //       this.loadFilteredRFQs(this.status);
  //     }
  //   });
  // }

  vendorUserId!: string;
  purchaseOrders: any[] = [];

  constructor(
    private poService: PurchaseOrderService,
    private toastr: ToastrService,
    private router: Router, private route: ActivatedRoute,
    private modalService: NgbModal, public cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.vendorUserId = localStorage.getItem('userId') || '';
    if (this.vendorUserId) {
      this.loadPurchaseOrders();
    } else {
      this.toastr.warning('Vendor ID not found');
    }
  }

  loadPurchaseOrders(): void {
    this.loading = true;
    this.poService.getPurchaseOrdersByVendor(this.vendorUserId).subscribe({
      next: (res) => {
        this.purchaseOrders = res || []; // because you’re using Ardalis.Result
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.toastr.error(err.error || 'Failed to load purchase orders');
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
  // RFQ List filteration on the basis of QueryParams
  loadFilteredRFQs(status: string) {
    // TODO: Call API or filter data based on status
    console.log('Filter RFQs by status:', status);
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

}
