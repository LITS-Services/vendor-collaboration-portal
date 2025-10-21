import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ColumnMode, DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import { NewRfqComponent } from '../new-rfq/new-rfq.component';
import { RfqService } from 'app/shared/services/rfq.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-rfq-list',
  templateUrl: './rfq-list.component.html',
  styleUrls: ['./rfq-list.component.scss']
})
export class RfqListComponent implements OnInit {
  public SelectionType = SelectionType;
  public ColumnMode = ColumnMode;

  @ViewChild(DatatableComponent) table: DatatableComponent;
  public chkBoxSelected = [];
  public rows: any[] = [];
  public columns = [
    { name: 'Sr. No.', prop: 'srNo' }, // optional if you add index
    { name: 'RFQ No.', prop: 'rfqNo' },
    { name: 'Company Name', prop: 'companyName' },
    { name: 'Status', prop: 'requestStatus' },
    { name: 'Start Date', prop: 'startDate' },
    { name: 'End Date', prop: 'endDate' },
    { name: 'Owner', prop: 'owner' },
    { name: 'Total Amount', prop: 'amount' }
  ];

  public loading = false;

  title: string = 'Request for Quotation';
  rfqData: any[] = [];
  userId: string | null = '';
  status: string = null;
  isVendorPortal: boolean = false;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private modalService: NgbModal,
    private rfqService: RfqService,
    private changeDetectorRef: ChangeDetectorRef,
    public toastr: ToastrService
  ) { }

  ngOnInit() {
    const vendorUserId = localStorage.getItem('userId');
    if (!vendorUserId) {
      console.error('Vendor user ID is missing in localStorage!');
      return;
    }

    // Listen to query params and reload quotations whenever they change
    this.route.queryParams.subscribe(params => {
      // Only use query params for filtering
      const status = params['status'] || null;
      this.loadQuotations(vendorUserId, status);
    });
  }

  loadQuotations(vendorUserId: string, status: string | null) {
    this.rfqService.getQuotationsByVendor(vendorUserId, status).subscribe({
      next: (res: any) => {
        if (res) {
          this.rows = res || [];
        } else {
          console.error('Failed to load quotations:', res.errors || res.validationErrors);
          this.rows = [];
        }
        this.changeDetectorRef.detectChanges();
      },
      error: (err) => {
        console.error('Error loading quotations:', err);
        this.rows = [];
      }
    });
  }

  onSort(event): void {
    const sort = event.sorts[0];
    this.rows.sort((a, b) => {
      return a[sort.prop].localeCompare(b[sort.prop]) * (sort.dir === 'desc' ? -1 : 1);
    });
  }

  customChkboxOnSelect({ selected }): void {
    this.chkBoxSelected = [...selected];
  }

  openQuotationBoxModal(row: any): void {
    // Check if RFQ has expired
    if (row.requestStatus === 'Completed' || row.requestStatus === 'InProcess') {
      this.toastr.warning('Bidding is closed for this RFQ.');
      return;
    }

    if (row.endDate && new Date(row.endDate) < new Date()) {
      this.toastr.warning('The end date has passed for submission of Bids.');
      return; // Stop execution, don’t open modal
    }
    const modalRef = this.modalService.open(NewRfqComponent, {
      size: 'xl',
      backdrop: 'static',
      centered: true,
      windowClass: 'custom-height-modal'
    });

    modalRef.componentInstance.data = row;
  }

  homePage(): void {
    this.router.navigate(['/dashboard/dashboard1']);
  }

  openEmpDetails(): void {
    this.modalService.open(NewRfqComponent, { size: 'lg', backdrop: 'static', centered: true });
  }
}
