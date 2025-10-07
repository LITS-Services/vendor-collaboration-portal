import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ColumnMode, DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject } from 'rxjs';
import { CompanyService } from 'app/shared/services/company.service';

@Component({
  selector: 'app-company-list',
  templateUrl: './company-list.component.html',
  styleUrls: ['./company-list.component.scss']
})
export class CompanyListComponent implements OnInit {
  behaviourSubject = new BehaviorSubject<string>('Default');
  public SelectionType = SelectionType;
  public ColumnMode = ColumnMode;
  @ViewChild(DatatableComponent) table: DatatableComponent;

  companyData: any[] = [];
  loading: boolean = false;
  chkBoxSelected: any[] = [];
  isAllSelected: boolean = false;
  title: string = 'Companies';
  status: string = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private modalService: NgbModal,
    private companyService: CompanyService,
    private cdr: ChangeDetectorRef          
  ) {}

  ngOnInit(): void {
  this.route.queryParams.subscribe(params => {
    if (params['title']) this.title = params['title'];
    this.status = params['status'] || '';

    if (this.status === 'new') {
      this.loadCompanies('approve');
    } 
    else if (this.status === 'approve') {
      this.loadCompanies('approve');
    } 
    else {
      this.loadCompanies('inprocess');
    }
  });
}


  loadCompanies(status: string) {
    this.loading = true;

    const userId = localStorage.getItem('userId');
    if (!userId) {
      console.error('No userId found in localStorage');
      this.loading = false;
      return;
    }

    this.companyService.getCompanyByVendorId(userId, status).subscribe({
      next: (res: any) => {
        const rawCompanies = Array.isArray(res)
          ? res
          : res?.$values || (res?.vendorId ? [res] : []);

        // Filter companies by status: Only show companies with the given status (approve or inprocess)
        this.companyData = rawCompanies
          .map(c => ({
            id: c.id,
            companyGUID: c.companyGUID,
            name: c.name,
            logo: c.logo,
            status: (c.status || '').toLowerCase(),
            vendorId: c.vendorId,
            street: c.addressesVM?.$values?.[0]?.street || '',
            city: c.addressesVM?.$values?.[0]?.city || '',
            country: c.addressesVM?.$values?.[0]?.country || '',
            contactNumber: c.contactsVM?.$values?.[0]?.contactNumber || '',
            contactType: c.contactsVM?.$values?.[0]?.type || ''
          }))
          // Filter by vendorId and selected status (approve or inprocess)
          .filter(c =>
            c.vendorId?.toLowerCase() === userId.toLowerCase() &&
            c.status === status
          );

        console.log('Company list:', this.companyData);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Error fetching companies:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSort(event: any) {
    this.loading = true;
    setTimeout(() => {
      const rows = [...this.companyData];
      const sort = event.sorts[0];
      rows.sort((a, b) =>
        a[sort.prop]?.toString().localeCompare(b[sort.prop]?.toString()) *
        (sort.dir === 'desc' ? -1 : 1)
      );
      this.companyData = rows;
      this.loading = false;
      this.cdr.detectChanges();
    }, 300);
  }

  customChkboxOnSelect({ selected }) {
    this.chkBoxSelected = [...selected];
    this.isAllSelected = this.companyData.length === this.chkBoxSelected.length;
  }

  toggleSelectAll(event: any) {
    if (event.target.checked) {
      this.chkBoxSelected = [...this.companyData];
    } else {
      this.chkBoxSelected = [];
    }
    this.isAllSelected = event.target.checked;
  }

  editCompany(company: any) {
    this.router.navigate(['/pages/company-registration'], {
      queryParams: { id: company.id }
    });
  }
}
