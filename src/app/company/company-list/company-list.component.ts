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

      // Load companies based on the status
      if (this.status === 'completed' || this.status === 'approve' || this.status === 'new') {
        this.loadCompanies('completed');
      }  else {
        this.loadCompanies('inprocess');
      }
    });
  }

  loadCompanies(status: string): void {
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

        // Map raw companies data to display on the table
        this.companyData = rawCompanies
          .map(c => ({
            id: c.id,
            companyGUID: c.companyGUID,
            name: c.name,
            logo: c.logo,
            status: (c.status || '').toLowerCase(),
            vendorId: c.vendorId,
            street: c.addressesVM?.[0]?.street || '',  // Fixed this line to access the array directly
            city: c.addressesVM?.[0]?.city || '',     // Same as above
            state: c.addressesVM?.[0]?.state || '',   // Same as above
            country: c.addressesVM?.[0]?.country || '', 
            contactNumber: c.contactsVM?.[0]?.contactNumber || '', // Access contact number correctly
            contactType: c.contactsVM?.[0]?.type || '', // Same as above
            entity: c.vendorUseCompaniesVM?.map(vuc => vuc.procurementCompany).join(', ') // Mapped entity
          }))
          .filter(c =>
            c.vendorId?.toLowerCase() === userId.toLowerCase() &&
            c.status === status
          );

        console.log('Company list:', this.companyData); // Debugging to check the data
        this.loading = false;
        this.cdr.detectChanges(); // Ensure the changes are detected
      },
      error: (err) => {
        console.error('Error fetching companies:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSort(event: any): void {
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

  customChkboxOnSelect({ selected }): void {
    this.chkBoxSelected = [...selected];
    this.isAllSelected = this.companyData.length === this.chkBoxSelected.length;
  }

  toggleSelectAll(event: any): void {
    if (event.target.checked) {
      this.chkBoxSelected = [...this.companyData];
    } else {
      this.chkBoxSelected = [];
    }
    this.isAllSelected = event.target.checked;
  }

  editCompany(company: any): void {
    this.router.navigate(['/pages/company-registration'], {
      queryParams: { id: company.id }
    });
  }
}
