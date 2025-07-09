import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ColumnMode, DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';

@Component({
  selector: 'app-invoice-details-list',
  templateUrl: './invoice-details-list.component.html',
  styleUrls: ['./invoice-details-list.component.scss']
})
export class InvoiceDetailsListComponent implements OnInit {

 public SelectionType = SelectionType;
  public ColumnMode = ColumnMode;
  rfqData = [
    {
      invoiceNo: 'INV-001',
      date: '2025-05-01',
      company: 'TechNova Solutions',
      amountTotal: 1500000
    },
    {
      invoiceNo: 'INV-002',
      date: '2025-05-02',
      company: 'Alpha Traders',
      amountTotal: 2750000
    },
    {
      invoiceNo: 'INV-003',
      date: '2025-05-03',
      company: 'SmartEdge Inc.',
      amountTotal: 980000
    },
    {
      invoiceNo: 'INV-004',
      date: '2025-05-04',
      company: 'GreenTech Ltd.',
      amountTotal: 3200000
    },
    {
      invoiceNo: 'INV-005',
      date: '2025-05-05',
      company: 'Bitzage Pvt. Ltd.',
      amountTotal: 1750000
    },
    {
      invoiceNo: 'INV-006',
      date: '2025-05-06',
      company: 'Oceanic Systems',
      amountTotal: 1345000
    },
    {
      invoiceNo: 'INV-007',
      date: '2025-05-07',
      company: 'NexaCorp',
      amountTotal: 1120000
    },
    {
      invoiceNo: 'INV-008',
      date: '2025-05-08',
      company: 'UraanTech Healthcare',
      amountTotal: 2450000
    },
    {
      invoiceNo: 'INV-009',
      date: '2025-05-09',
      company: 'FutureSoft Labs',
      amountTotal: 870000
    },
    {
      invoiceNo: 'INV-010',
      date: '2025-05-10',
      company: 'Visionary Holdings',
      amountTotal: 1995000
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
