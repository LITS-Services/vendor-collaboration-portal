import { Component, OnInit, ViewChild, ChangeDetectorRef, TemplateRef } from '@angular/core';
import { ColumnMode, DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, forkJoin, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { CompanyService } from 'app/shared/services/company.service';
import { NgxSpinner, NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-company-list',
  templateUrl: './company-list.component.html',
  styleUrls: ['./company-list.component.scss'],
  standalone: false
})
export class CompanyListComponent implements OnInit {
  behaviourSubject = new BehaviorSubject<string>('Default');
  @ViewChild('datatable', { static: false }) datatable!: DatatableComponent;
  public SelectionType = SelectionType;
  public ColumnMode = ColumnMode;
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @ViewChild('remarksModal') remarksModal: TemplateRef<any>;

  companyData: any[] = [];
  loading: boolean = false;
  chkBoxSelected: any[] = [];
  isAllSelected: boolean = false;
  title: string = 'Companies';
  status: string = '';


  selectedRemarksEntities: any[] = [];
  loadingRemarks: boolean = false;
  showNoRemarksMessage: boolean = false; // Added for template flag
  showRegisterButton: boolean = false;
  datatableVisible: boolean = true;
  remarksPage: number = 1;
  remarksPageSize: number = 10;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private modalService: NgbModal,
    private companyService: CompanyService,
    private cdr: ChangeDetectorRef,
    private spinner: NgxSpinnerService
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['title']) this.title = params['title'];
      this.status = params['status'] || '';

      if (['completed', 'approve', 'new'].includes(this.status)) {
        this.loadCompanies('completed');
      } else {
        this.loadCompanies('inprocess');
      }
    });
  }

  get isMobile(): boolean {
    return window.innerWidth <= 768;
  }


  goBack() {
    this.router.navigate(['/company/company-list']);
  }


  onAutoResize(): void {
    this.datatableVisible = false;
    this.cdr.detectChanges(); // destroy

    requestAnimationFrame(() => {
      this.datatableVisible = true;
      this.cdr.detectChanges(); // recreate
    });
  }


  newCompany(): void {
    this.router.navigateByUrl("/pages/company-registration");
  }

  loadCompanies(status: string): void {
    this.loading = true;
    this.spinner.show();
    const userId = localStorage.getItem('userId');
    if (!userId) {
      console.error('No userId found in localStorage');
      this.loading = false;
      return;
    }
    this.spinner.show();

    console.log('Loading companies with status:', status, 'for user:', userId);

    this.companyService.getCompanyByVendorId(userId, status).subscribe({
      next: (res: any) => {
        console.log('Raw API response from getCompanyByVendorId:', res);

        const rawCompanies = Array.isArray(res) ? res : res?.$values || [];
        console.log('Processed companies array:', rawCompanies);
        this.showRegisterButton = rawCompanies.length === 0;

        // Base company mapping - IGNORE remarks from getCompanyByVendorId
        this.companyData = rawCompanies.map(c => ({
          id: c.id,
          companyGUID: c.companyGUID,
          name: c.name,
          logo: c.logo,
          createDate: c.createdDate,
          status: c.status || this.getOverallStatus(c.vendorUseCompaniesVM), // Use API status if available
          mainStatus: c.status || this.getMainStatus(c.vendorUseCompaniesVM), // Use API status if available
          vendorId: c.vendorId,
          street: c.addressesVM?.[0]?.street || '',
          city: c.addressesVM?.[0]?.city || '',
          state: c.addressesVM?.[0]?.state || '',
          country: c.addressesVM?.[0]?.country || '',
          contactNumber: c.contactsVM?.[0]?.contactNumber || '',
          contactType: c.contactsVM?.[0]?.type || '',
          entity: c.vendorUseCompaniesVM?.map(vuc => vuc.procurementCompany).join(', ') || '',
          procurementCompanyId: c.vendorUseCompaniesVM?.[0]?.procurementCompanyId || null,
          mainApproverId: c.mainapproverid, // Corrected: key is lowercase in response
          entityDetails: c.vendorUseCompaniesVM?.map(vuc => ({
            id: vuc.id, // Added: Use this as associationId for getsetuphistory
            entity: vuc.procurementCompany,
            status: vuc.status,
            createdDate: vuc.createdDate,
            approverName: vuc.createdBy || '',
            procurementCompanyId: vuc.procurementCompanyId,
            level: 'Loading...', // Initialize level as loading
            approverLevelName: '' // Initialize approver name
          })) || []
        }));

        console.log('Mapped companyData:', this.companyData);

        if (this.companyData.length === 0) {
          console.log('No companies found');
          this.loading = false;
          this.spinner.hide();
          this.cdr.detectChanges();
          return;
        }

        this.loading = false;
        this.spinner.hide();
        this.cdr.detectChanges(); // Render list first

        // Fetch levels for all loaded companies
        this.fetchLevelsForCompanies();

      },
      error: err => {
        console.error('Error fetching companies:', err);
        console.error('Error details:', {
          status: err.status,
          statusText: err.statusText,
          message: err.message,
          error: err.error
        });
        this.spinner.hide();
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  fetchLevelsForCompanies(): void {
    if (!this.companyData || this.companyData.length === 0) return;

    this.companyData.forEach(company => {
      company.level = 'Loading...'; // Placeholder

      this.companyService.GetCompanyApproverLevel(company.id, company.mainApproverId).subscribe({
        next: (response: any) => {
          let approverLevel;
          if (response?.value?.approverLevel !== undefined) {
            approverLevel = response.value.approverLevel;
          } else if (response?.approverLevel !== undefined) {
            approverLevel = response.approverLevel;
          } else if (response?.data?.approverLevel !== undefined) {
            approverLevel = response.data.approverLevel;
          } else if (response?.result?.approverLevel !== undefined) {
            approverLevel = response.result.approverLevel;
          }

          if (approverLevel !== undefined && approverLevel !== null && approverLevel !== '') {
            company.level = `Level ${approverLevel}`;
          } else {
            company.level = 'N/A';
          }
          this.cdr.detectChanges(); // Update UI for this row
        },
        error: (err) => {
          console.error(`Error fetching level for company ${company.id}`, err);
          company.level = 'N/A'; // Fallback
          this.cdr.detectChanges();
        }
      });
    });
  }

  getOverallStatus(entityList: any[]): string {
    if (!entityList || entityList.length === 0) return '';
    const statuses = entityList.map(e => e.status?.toLowerCase());
    if (statuses.includes('inprocess')) return 'InProcess';
    if (statuses.includes('sendback')) return 'SendBack';
    if (statuses.includes('rejected')) return 'Rejected';
    if (statuses.every(s => s === 'completed')) return 'Completed';
    return statuses[0] || '';
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
      queryParams: {
        id: company.id,
        procurementCompanyId: company.procurementCompanyId
      }
    });
  }



  openRemarksPopup(row: any): void {
    this.loadingRemarks = true;
    this.selectedRemarksEntities = [];
    this.showNoRemarksMessage = false;
    this.remarksPage = 1;

    console.log('Row data for remarks:', row);

    // Call the new API to get remarks for the company
    this.companyService.getlatestremarkscompanyId(row.id).subscribe({
      next: (res: any) => {
        console.log('Remarks API response:', res);

        let remarksArray = [];
        // Handle different possible response structures
        if (Array.isArray(res)) {
          remarksArray = res;
        } else if (res?.value && Array.isArray(res.value)) {
          remarksArray = res.value;
        } else if (res?.data && Array.isArray(res.data)) {
          remarksArray = res.data;
        } else if (res?.result && Array.isArray(res.result)) {
          remarksArray = res.result;
        }

        console.log('Processed remarks array:', remarksArray);

        if (remarksArray.length === 0) {
          this.showNoRemarksMessage = true;
          this.selectedRemarksEntities = [];
        } else {


          this.selectedRemarksEntities = [{
            entity: row.name, // Display Company Name as the header
            remarks: remarksArray,
            status: row.status,
            source: 'latest-remarks-api'
          }];
        }

        this.loadingRemarks = false;
        this.cdr.detectChanges();
        this.modalService.open(this.remarksModal, { size: 'lg', backdrop: 'static' });
      },
      error: (err) => {
        console.error('Error fetching remarks:', err);
        this.showNoRemarksMessage = true;
        this.loadingRemarks = false;
        this.cdr.detectChanges();
        this.modalService.open(this.remarksModal, { size: 'lg', backdrop: 'static' });
      }
    });
  }


  getMainStatus(vendorUseCompaniesVM: any[]): string {
    if (!vendorUseCompaniesVM || vendorUseCompaniesVM.length === 0) {
      return 'InProcess'; // Default status if no entities
    }

    // Check if ALL entities have status 'Completed'
    const allCompleted = vendorUseCompaniesVM.every(
      entity => entity.status?.toLowerCase() === 'completed'
    );

    // Check if ANY entity has status 'InProcess' or 'SendBack'
    const hasInProcessOrSendBack = vendorUseCompaniesVM.some(
      entity =>
        entity.status?.toLowerCase() === 'inprocess' ||
        entity.status?.toLowerCase() === 'sendback'
    );

    if (allCompleted) {
      return 'Onboarded';
    } else if (hasInProcessOrSendBack) {
      return 'InProcess';
    } else {
      // If there are other statuses (like Rejected) but no InProcess/SendBack
      return 'InProcess'; // Default fallback
    }
  }

  getStatusClass(status: any): string {
    const s = (status ?? '').toString().trim().toLowerCase();

    if (s === 'new') return 'status-pill--new';
    if (s === 'inprocess' || s === 'in process' || s === 'in_process' || s === 'rejected') return 'status-pill--inprocess';
    if (s === 'onboarded' || s === 'completed' || 'completed') return 'status-pill--completed';

    return 'status-pill--default';
  }

  shouldShowRemarks(entity: any): boolean {
    const status = entity.status?.toLowerCase();
    return ['completed', 'sendback', 'rejected'].includes(status);
  }
}
