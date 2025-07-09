import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ColumnMode, DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';

@Component({
  selector: 'app-pr-request-list',
  templateUrl: './pr-request-list.component.html',
  styleUrls: ['./pr-request-list.component.scss']
})
export class PrRequestListComponent implements OnInit {
 public SelectionType = SelectionType;
  public ColumnMode = ColumnMode;
  rfqData = [
    {
      requisitionNo: 'REQ001', // Requisition No.
      status: 'Pending for Quotation', // Status
      date: '2024-10-01', // Date (title column)
      owner: 'Mubashir', // Owner (announcementDate)
      companyName: 'LITS Services', 
      department: 'IT', // Department (announcementEndDate)
      title: 'Cleaning Services Contract Renewal', // Title (fileName)
      vendors: "000035", // File path for download
      accounts: '03-63418', // Vendors, Accounts, Total Amount badges
      totalAmount: 2500000
    },
    {
      requisitionNo: 'REQ001', // Requisition No.
      status: 'Pending for Quotation', // Status
      date: '2024-10-01', // Date (title column)
      companyName: 'LITS Services', 
      owner: 'Mubashir', // Owner (announcementDate)
      department: 'IT', // Department (announcementEndDate)
      title: 'Cleaning Services Contract Renewal', // Title (fileName)
      vendors: "000035", // File path for download
      accounts: '03-63418', // Vendors, Accounts, Total Amount badges
      totalAmount: 2500000
    },
    {
      requisitionNo: 'REQ001', // Requisition No.
      status: 'Pending for Approval', // Status
      companyName: 'LITS Services', 
      date: '2024-10-01', // Date (title column)
      owner: 'Mubashir', // Owner (announcementDate)
      department: 'IT', // Department (announcementEndDate)
      title: 'Cleaning Services Contract Renewal', // Title (fileName)
      vendors: "000035", // File path for download
      accounts: '03-63418', // Vendors, Accounts, Total Amount badges
      totalAmount: 2500000
    },
    {
      requisitionNo: 'REQ001', // Requisition No.
      status: 'Pending for Quotation', // Status
      companyName: 'LITS Services', 
      date: '2024-10-01', // Date (title column)
      owner: 'Mubashir', // Owner (announcementDate)
      department: 'IT', // Department (announcementEndDate)
      title: 'Cleaning Services Contract Renewal', // Title (fileName)
      vendors: "000035", // File path for download
      accounts: '03-63418', // Vendors, Accounts, Total Amount badges
      totalAmount: 2500000
    },
    {
      requisitionNo: 'REQ001', // Requisition No.
      status: 'Pending for Quotation', // Status
      companyName: 'LITS Services', 
      date: '2024-10-01', // Date (title column)
      owner: 'Mubashir', // Owner (announcementDate)
      department: 'IT', // Department (announcementEndDate)
      title: 'Cleaning Services Contract Renewal', // Title (fileName)
      vendors: "000035", // File path for download
      accounts: '03-63418', // Vendors, Accounts, Total Amount badges
      totalAmount: 2500000
    },
    {
      requisitionNo: 'REQ001', // Requisition No.
      status: 'Pending for Approval', // Status
      date: '2024-10-01', // Date (title column)
      companyName: 'LITS Services', 
      owner: 'Mubashir', // Owner (announcementDate)
      department: 'IT', // Department (announcementEndDate)
      title: 'Cleaning Services Contract Renewal', // Title (fileName)
      vendors: "000035", // File path for download
      accounts: '03-63418', // Vendors, Accounts, Total Amount badges
      totalAmount: 2500000
    },
    {
      requisitionNo: 'REQ001', // Requisition No.
      status: 'Pending for Quotation', // Status
      date: '2024-10-01', // Date (title column)
      companyName: 'LITS Services', 
      owner: 'Mubashir', // Owner (announcementDate)
      department: 'IT', // Department (announcementEndDate)
      title: 'Cleaning Services Contract Renewal', // Title (fileName)
      vendors: "000035", // File path for download
      accounts: '03-63418', // Vendors, Accounts, Total Amount badges
      totalAmount: 2500000
    },
    {
      requisitionNo: 'REQ001', // Requisition No.
      status: 'Pending for Quotation', // Status
      date: '2024-10-01', // Date (title column)
      owner: 'Mubashir', // Owner (announcementDate)
      companyName: 'LITS Services', 
      department: 'IT', // Department (announcementEndDate)
      title: 'Cleaning Services Contract Renewal', // Title (fileName)
      vendors: "000035", // File path for download
      accounts: '03-63418', // Vendors, Accounts, Total Amount badges
      totalAmount: 2500000
    },
    {
      requisitionNo: 'REQ001', // Requisition No.
      status: 'Pending for Quotation', // Status
      date: '2024-10-01', // Date (title column)
      owner: 'Mubashir', // Owner (announcementDate)
      companyName: 'LITS Services', 
      department: 'IT', // Department (announcementEndDate)
      title: 'Cleaning Services Contract Renewal', // Title (fileName)
      vendors: "000035", // File path for download
      accounts: '03-63418', // Vendors, Accounts, Total Amount badges
      totalAmount: 2500000
    },
    {
      requisitionNo: 'REQ001', // Requisition No.
      status: 'Pending for Quotation', // Status
      date: '2024-10-01', // Date (title column)
      companyName: 'LITS Services', 
      owner: 'Mubashir', // Owner (announcementDate)
      department: 'IT', // Department (announcementEndDate)
      title: 'Cleaning Services Contract Renewal', // Title (fileName)
      vendors: "000035", // File path for download
      accounts: '03-63418', // Vendors, Accounts, Total Amount badges
      totalAmount: 2500000
    },
    {
      requisitionNo: 'REQ001', // Requisition No.
      status: 'Pending for Quotation', // Status
      date: '2024-10-01', // Date (title column)
      owner: 'Mubashir', // Owner (announcementDate)
      companyName: 'LITS Services', 
      department: 'IT', // Department (announcementEndDate)
      title: 'Cleaning Services Contract Renewal', // Title (fileName)
      vendors: "000035", // File path for download
      accounts: '03-63418', // Vendors, Accounts, Total Amount badges
      totalAmount: 2500000
    },
    {
      requisitionNo: 'REQ001', // Requisition No.
      status: 'Pending for Approval' , // Status
      date: '2024-10-01', // Date (title column)
      owner: 'Mubashir', // Owner (announcementDate)
      companyName: 'LITS Services', 
      department: 'IT', // Department (announcementEndDate)
      title: 'Cleaning Services Contract Renewal', // Title (fileName)
      vendors: "000035", // File path for download
      accounts: '03-63418', // Vendors, Accounts, Total Amount badges
      totalAmount: 2500000
    },
   
  ];
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @ViewChild('tableRowDetails') tableRowDetails: any;
  @ViewChild('tableResponsive') tableResponsive: any;
  public chkBoxSelected = [];
  loading = false;
  public rows = [];
  columns = [];
  title: string = 'Request for Quotation';
  constructor(private router: Router, private route: ActivatedRoute,
      private modalService: NgbModal) { }

ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['title']) {
        this.title = params['title'];
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
  }


}
