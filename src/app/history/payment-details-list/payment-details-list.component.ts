import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ColumnMode, DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';

@Component({
  selector: 'app-payment-details-list',
  templateUrl: './payment-details-list.component.html',
  styleUrls: ['./payment-details-list.component.scss']
})
export class PaymentDetailsListComponent implements OnInit {

 public SelectionType = SelectionType;
  public ColumnMode = ColumnMode;
  transformedRfqData = [
    {
      paymentID: 'REQ001',
      paymentMethod: 'IT',
      customerEmail: 'mubashir@example.com',
      status: 'Pending for Quotation',
      date: '2024-10-01',
      amount: 2500000
    },
    {
      paymentID: 'REQ002',
      paymentMethod: 'Finance',
      customerEmail: 'ahmed@example.com',
      status: 'Approved',
      date: '2024-10-03',
      amount: 1200000
    },
    {
      paymentID: 'REQ003',
      paymentMethod: 'Procurement',
      customerEmail: 'sara@example.com',
      status: 'Rejected',
      date: '2024-10-05',
      amount: 1750000
    },
    {
      paymentID: 'REQ004',
      paymentMethod: 'Marketing',
      customerEmail: 'ali@example.com',
      status: 'Pending for Approval',
      date: '2024-10-07',
      amount: 950000
    },
    {
      paymentID: 'REQ005',
      paymentMethod: 'HR',
      customerEmail: 'fariha@example.com',
      status: 'Pending for Quotation',
      date: '2024-10-09',
      amount: 3000000
    },
    {
      paymentID: 'REQ006',
      paymentMethod: 'Legal',
      customerEmail: 'junaid@example.com',
      status: 'Approved',
      date: '2024-10-11',
      amount: 1100000
    },
    {
      paymentID: 'REQ007',
      paymentMethod: 'Operations',
      customerEmail: 'nida@example.com',
      status: 'Pending for Quotation',
      date: '2024-10-13',
      amount: 2100000
    },
    {
      paymentID: 'REQ008',
      paymentMethod: 'Admin',
      customerEmail: 'haris@example.com',
      status: 'Rejected',
      date: '2024-10-15',
      amount: 900000
    },
    {
      paymentID: 'REQ009',
      paymentMethod: 'Engineering',
      customerEmail: 'maheen@example.com',
      status: 'Approved',
      date: '2024-10-17',
      amount: 2600000
    },
    {
      paymentID: 'REQ010',
      paymentMethod: 'Support',
      customerEmail: 'waqas@example.com',
      status: 'Pending for Approval',
      date: '2024-10-19',
      amount: 800000
    }
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
