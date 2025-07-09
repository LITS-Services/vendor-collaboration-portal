import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ColumnMode, DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';

@Component({
  selector: 'app-po-details-list',
  templateUrl: './po-details-list.component.html',
  styleUrls: ['./po-details-list.component.scss']
})
export class PoDetailsListComponent implements OnInit {

 public SelectionType = SelectionType;
  public ColumnMode = ColumnMode;
  rfqData = [
    {
      purchaseOrderNo: 'PO-1001',
      status: 'Won',
      date: '2024-10-01'
    },
    {
      purchaseOrderNo: 'PO-1002',
      status: 'Lost',
      date: '2024-10-02'
    },
    {
      purchaseOrderNo: 'PO-1003',
      status: 'In Progress',
      date: '2024-10-03'
    },
    {
      purchaseOrderNo: 'PO-1004',
      status: 'Won',
      date: '2024-10-04'
    },
    {
      purchaseOrderNo: 'PO-1005',
      status: 'Lost',
      date: '2024-10-05'
    },
    {
      purchaseOrderNo: 'PO-1006',
      status: 'In Progress',
      date: '2024-10-06'
    },
    {
      purchaseOrderNo: 'PO-1007',
      status: 'Won',
      date: '2024-10-07'
    },
    {
      purchaseOrderNo: 'PO-1008',
      status: 'In Progress',
      date: '2024-10-08'
    },
    {
      purchaseOrderNo: 'PO-1009',
      status: 'Lost',
      date: '2024-10-09'
    },
    {
      purchaseOrderNo: 'PO-1010',
      status: 'Won',
      date: '2024-10-10'
    },
    {
      purchaseOrderNo: 'PO-1011',
      status: 'Lost',
      date: '2024-10-11'
    },
    {
      purchaseOrderNo: 'PO-1012',
      status: 'In Progress',
      date: '2024-10-12'
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
