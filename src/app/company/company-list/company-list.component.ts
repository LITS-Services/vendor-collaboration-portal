import { Component, OnInit, ViewChild } from '@angular/core';
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
    private companyService: CompanyService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['title']) this.title = params['title'];
      this.status = params['status'] || '';
      this.loadCompanies(this.status);
    });
  }

  loadCompanies(status?: string) {
    this.loading = true;

    const userId = localStorage.getItem('userId');

    this.companyService.getCompanies(status).subscribe({
      next: (res: any) => {
        const rawCompanies = res?.$values || res || [];

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
          // ✅ Filter only in-progress companies matching vendorUserId
          .filter(c => c.status === 'inprogress' && c.vendorId && c.vendorId === userId);

        console.log('Filtered InProgress Companies (vendor match):', this.companyData);
        this.loading = false;
      },
      error: err => {
        console.error('Error fetching companies:', err);
        this.loading = false;
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

  editSelectedCompany() {
    if (this.chkBoxSelected.length !== 1) {
      alert('Please select exactly one company to edit.');
      return;
    }

    const selectedCompany = this.chkBoxSelected[0];

    // Navigate to registration/edit page
    this.router.navigate(['/pages/company-registration'], {
      queryParams: { id: selectedCompany.id }
    });
  }
}
