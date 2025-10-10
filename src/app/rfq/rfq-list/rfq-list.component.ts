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

  // ngOnInit() {
  //   this.route.paramMap.subscribe(params => {
  //     this.status = this.route.snapshot.queryParamMap.get('status');

  //     const userId = this.route.snapshot.queryParamMap.get('userId') || '';
  //     if (this.status){
  //     this.loadStatusFilteredQuotations(userId, this.status);
  //     }
  //     else{
  //       this.loadQuotationsForVendor(userId);
  //     }
  //   });
  // }
ngOnInit() {
  const vendorUserId = localStorage.getItem('userId');

  if (!vendorUserId) {
    console.error('Vendor user ID is missing in localStorage!');
    // Optionally redirect to login or show a message
    return;
  }

  // Listen to route query params
  this.route.queryParams.subscribe(params => {
    const status = params['status'] || null;
    this.loadQuotations(vendorUserId, status);
  });
}



  // loadQuotationsForVendor(userId): void {
  //   // const vendorUserId = localStorage.getItem('userId');

  //   if (!userId) {
  //     console.error('VendorUserId not found in localStorage.');
  //     return;
  //   }

  //   this.loading = true;

  //   this.rfqService.getQuotationByVendor(userId).subscribe(response => {

  //     this.rows = response.$values ?? [];
  //     this.loading = false;
  //     this.changeDetectorRef.detectChanges();
  //   })
  // }
loadQuotations(vendorUserId: string, status: string | null) {
  this.rfqService.getQuotationsByVendor(vendorUserId, status).subscribe({
    next: (res) => {
      this.rows = res?.$values || [];
      this.changeDetectorRef.detectChanges();
    },
    error: (err) => {
      console.error('Error loading quotations:', err);
    }
  });
}


// loadStatusFilteredQuotations(userId: string, status: string) {
//     this.rfqService.getAllQuotationsByStatus(userId, status).subscribe({
//       next: (response) => {
//         // Handle $values structure from .NET serialization
//         this.rows = response?.$values || [];
//         this.changeDetectorRef.detectChanges();
//       },
//       error: (err) => console.error('Error fetching quotations:', err)
//     });
//   }

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
