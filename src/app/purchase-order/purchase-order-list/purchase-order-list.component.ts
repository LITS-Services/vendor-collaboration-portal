import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ColumnMode, DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import { NewPurchaseOrderComponent } from '../new-purchase-order/new-purchase-order.component';

@Component({
  selector: 'app-purchase-order-list',
  templateUrl: './purchase-order-list.component.html',
  styleUrls: ['./purchase-order-list.component.scss']
})
export class PurchaseOrderListComponent implements OnInit {
 public SelectionType = SelectionType;
  public ColumnMode = ColumnMode;
  rfqData = [
    {
      requisitionNo: 'REQ-1001',
      status: 'Pending',
      date: '2025-04-15',
      owner: 'John Smith',
      department: 'Procurement',
      title: 'Office Supplies',
      account: 'AC-2045',
      totalAmount: '$1,200.00'
    },
    {
      requisitionNo: 'REQ-1002',
      status: 'Approved',
      date: '2025-04-18',
      owner: 'Sarah Johnson',
      department: 'IT',
      title: 'Laptop Purchase',
      account: 'AC-3055',
      totalAmount: '$3,500.00'
    },
    {
      requisitionNo: 'REQ-1003',
      status: 'Rejected',
      date: '2025-04-20',
      owner: 'Mark Davis',
      department: 'HR',
      title: 'Training Materials',
      account: 'AC-1099',
      totalAmount: '$850.00'
    },
    {
      requisitionNo: 'REQ-1004',
      status: 'Pending',
      date: '2025-04-22',
      owner: 'Emily White',
      department: 'Finance',
      title: 'Stationery Refill',
      account: 'AC-4001',
      totalAmount: '$300.00'
    },
    {
      requisitionNo: 'REQ-1005',
      status: 'Approved',
      date: '2025-04-24',
      owner: 'David Brown',
      department: 'Legal',
      title: 'Subscription Renewal',
      account: 'AC-6200',
      totalAmount: '$1,100.00'
    },
    {
      requisitionNo: 'REQ-1006',
      status: 'On Hold',
      date: '2025-04-25',
      owner: 'Olivia Martin',
      department: 'Operations',
      title: 'Cleaning Services',
      account: 'AC-7383',
      totalAmount: '$2,000.00'
    },
    {
      requisitionNo: 'REQ-1007',
      status: 'Approved',
      date: '2025-04-26',
      owner: 'James Wilson',
      department: 'Engineering',
      title: 'Tool Kits',
      account: 'AC-8852',
      totalAmount: '$4,750.00'
    },
    {
      requisitionNo: 'REQ-1008',
      status: 'Pending',
      date: '2025-04-28',
      owner: 'Sophia Lee',
      department: 'R&D',
      title: 'Prototype Components',
      account: 'AC-9100',
      totalAmount: '$5,200.00'
    },
    {
      requisitionNo: 'REQ-1009',
      status: 'Approved',
      date: '2025-04-29',
      owner: 'Michael Clark',
      department: 'Admin',
      title: 'Conference Setup',
      account: 'AC-1190',
      totalAmount: '$1,750.00'
    },
    {
      requisitionNo: 'REQ-1010',
      status: 'Rejected',
      date: '2025-04-30',
      owner: 'Emma Scott',
      department: 'Marketing',
      title: 'Ad Campaign',
      account: 'AC-5210',
      totalAmount: '$6,000.00'
    }
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
 if(this.rfqData.length!=this.chkBoxSelected.length){
   this.isAllSelected=false;
 }
 else{
   this.isAllSelected=true;
 }
   }
 
   openQuotationBoxModal(row: any): void {
     const modalRef = this.modalService.open(NewPurchaseOrderComponent, { size: 'xl', backdrop: 'static', centered: true, windowClass: 'custom-height-modal' });
     modalRef.componentInstance.data = row;  // Pass selected row data if needed
   }

}
