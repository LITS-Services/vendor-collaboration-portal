// import { Component, OnInit, ViewChild } from '@angular/core';
// import { NewRfqComponent } from '../new-rfq/new-rfq.component';
// import { ActivatedRoute, Router } from '@angular/router';
// import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
// import { ColumnMode, DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';

// @Component({
//   selector: 'app-rfq-list',
//   templateUrl: './rfq-list.component.html',
//   styleUrls: ['./rfq-list.component.scss']
// })
// export class RfqListComponent implements OnInit {
//  public SelectionType = SelectionType;
//   public ColumnMode = ColumnMode;

//   @ViewChild(DatatableComponent) table: DatatableComponent;
//   @ViewChild('tableRowDetails') tableRowDetails: any;
//   @ViewChild('tableResponsive') tableResponsive: any;
//   public chkBoxSelected = [];
//   loading = false;
//   public rows = [];
//   columns = [];
//   title: string = 'Request for Quotation';
//   status: string = '';
//   mailCount = 5;
//   constructor(private router: Router, private route: ActivatedRoute,
//     private modalService: NgbModal) { }

//   ngOnInit(): void {
//     this.route.queryParams.subscribe(params => {
//       if (params['title']) {
//         this.title = params['title'];
//       }
//       if (params['status']) {
//         this.status = params['status'];
  
//         if (this.status === 'in-process') {
//           // You can call an API here to get mailCount if needed
//           this.loadFilteredRFQs('in-process');
//         } else {
//           this.loadFilteredRFQs(this.status);
//         }
//       }
//     });
//   }
//   // RFQ List filteration on the basis of QueryParams
//   loadFilteredRFQs(status: string) {
//     // TODO: Call API or filter data based on status
//     console.log('Filter RFQs by status:', status);
//   }
//   homePage() {
//     this.router.navigate(['/dashboard/dashboard1']);
//   }
//   openEmpDetails() {
//  this.modalService.open(NewRfqComponent, { size: 'lg', backdrop: 'static', centered: true });
//     // modalRef.componentInstance.data = row;
//   }
//   onSort(event) {
//     this.loading = true;
//     setTimeout(() => {
//       const rows = [...this.rows];
//       const sort = event.sorts[0];
//       rows.sort((a, b) => {
//         return a[sort.prop].localeCompare(b[sort.prop]) * (sort.dir === 'desc' ? -1 : 1);
//       });
  
//       this.rows = rows;
//       this.loading = false;
//     }, 1000);
//   }
//   customChkboxOnSelect({ selected }) {
//     this.chkBoxSelected = [];
//     this.chkBoxSelected.splice(0, this.chkBoxSelected.length);
//     this.chkBoxSelected.push(...selected);
//   }


//   openQuotationBoxModal(row: any): void {
//     const modalRef = this.modalService.open(NewRfqComponent, { size: 'xl', backdrop: 'static', centered: true, windowClass: 'custom-height-modal' });
//     modalRef.componentInstance.data = row; 
//     modalRef.componentInstance.status = this.status;
//   }

// }

import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ColumnMode, DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import { NewRfqComponent } from '../new-rfq/new-rfq.component';
import { RfqService } from 'app/shared/services/rfq.service';

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
  { name: 'Status', prop: 'status' },
  { name: 'Date', prop: 'date' },
  { name: 'Owner', prop: 'owner' },
  { name: 'Total Amount', prop: 'amount' }
];
status: string = ''; // Add this line

  public loading = false;

  title: string = 'Request for Quotation';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private modalService: NgbModal,
    private rfqService: RfqService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadQuotationsForVendor();
  }

  loadQuotationsForVendor(): void {
    const vendorUserId = localStorage.getItem('userId'); 

    if (!vendorUserId) {
      console.error('VendorUserId not found in localStorage.');
      return;
    }

    this.loading = true;

    this.rfqService.getQuotationByVendor(vendorUserId).subscribe(response => {
  
        this.rows = response.$values ?? [];
        this.loading = false;
        this.changeDetectorRef.detectChanges();
      })
    };
  

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
