import { Component, OnInit, ViewChild } from '@angular/core';
import { ColumnMode, DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import { NewTenderComponent } from '../new-tender/new-tender.component';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-tender-list',
  templateUrl: './tender-list.component.html',
  styleUrls: ['./tender-list.component.scss']
})
export class TenderListComponent implements OnInit {
 public SelectionType = SelectionType;
  public ColumnMode = ColumnMode;
  tenderData = [
    {
      requisitionNo: 'REQ001', // Requisition No.
      status: 'Pending for Quotation', // Status
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
  announcementId: number;
  isEditButtonDisabled: boolean = true;
  isDeleteButtonDisabled: boolean = true;
  isOpenButtonDisabled: boolean = true;
  isAddNewDisable:boolean= true;
  isAllSelected: boolean = false;
  title: string = 'Request for Quotation';
  status: string = '';
    constructor(private router: Router, private route: ActivatedRoute,
      private modalService: NgbModal) { }
  
    ngOnInit(): void {
      this.route.queryParams.subscribe(params => {
        if (params['title']) {
          this.title = params['title'];
        }
        if (params['status']) {
          this.status = params['status'];
          this.loadFilteredRFQs(this.status);
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
   this.modalService.open(NewTenderComponent, { size: 'lg', backdrop: 'static', centered: true });
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
  if(this.tenderData.length!=this.chkBoxSelected.length){
    this.isAllSelected=false;
  }
  else{
    this.isAllSelected=true;
  }
    }
  
    openQuotationBoxModal(row: any): void {
      const modalRef = this.modalService.open(NewTenderComponent, { size: 'xl', backdrop: 'static', centered: true, windowClass: 'custom-height-modal' });
      modalRef.componentInstance.data = row;  // Pass selected row data if needed
    }

}
