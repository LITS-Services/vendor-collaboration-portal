import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef, TemplateRef } from '@angular/core';
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
  @ViewChild('searchInput') searchInputElement?: ElementRef;

  companyData: any[] = [];
  allCompanyData: any[] = [];
  loading: boolean = false;
  chkBoxSelected: any[] = [];
  isAllSelected: boolean = false;
  title: string = 'Companies';
  status: string = '';

  // Search & Filter & Sort state
  searchTerm: string = '';
  isSearchOpen: boolean = false;
  currentSort: { prop: string; dir: 'asc' | 'desc' } = { prop: '', dir: 'asc' };
  filterStatus: string = 'ALL';
  filterLevel: string = 'ALL';
  filterDatePeriod: string = 'ALL';
  filterDateFrom: string = '';
  filterDateTo: string = '';
  availableStatuses: string[] = ['Onboarded', 'InProgress', 'SendBack', 'Rejected'];
  availableLevels: string[] = [];

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
        this.loadCompanies('inprogress');
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

        this.allCompanyData = rawCompanies.map(c => ({
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
          isAssigned: c.isAssigned, // Store assignment status
          mainApproverId: (c.status?.toLowerCase() === 'rejected' && c.rejectedApproverId)
            ? c.rejectedApproverId
            : c.mainapproverid, // Use rejectedApproverId if status is Rejected
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

        this.updateAvailableOptions();
        this.applyFiltersAndSort();

        if (this.allCompanyData.length === 0) {
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
    if (!this.allCompanyData || this.allCompanyData.length === 0) return;

    this.allCompanyData.forEach(company => {
      // If company is assigned, it should show Level 0
      if (company.isAssigned === true) {
        company.level = 'Level 0';
        this.updateAvailableLevels();
        return;
      }

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
          this.updateAvailableLevels();
          this.cdr.detectChanges(); // Update UI for this row
        },
        error: (err) => {
          console.error(`Error fetching level for company ${company.id}`, err);
          company.level = 'N/A'; // Fallback
          this.updateAvailableLevels();
          this.cdr.detectChanges();
        }
      });
    });
  }

  getOverallStatus(entityList: any[]): string {
    if (!entityList || entityList.length === 0) return '';
    const statuses = entityList.map(e => e.status?.toLowerCase());
    if (statuses.includes('inprogress')) return 'InProgress';
    if (statuses.includes('sendback')) return 'SendBack';
    if (statuses.includes('rejected')) return 'Rejected';
    if (statuses.every(s => s === 'completed')) return 'Completed';
    return statuses[0] || '';
  }

  // --- Search, Sort & Filter Functionality ---

  toggleSearch(): void {
    this.isSearchOpen = !this.isSearchOpen;
    if (this.isSearchOpen) {
      setTimeout(() => {
        this.searchInputElement?.nativeElement?.focus();
      }, 50);
    } else {
      this.closeSearch();
    }
  }

  closeSearch(): void {
    this.isSearchOpen = false;
    if (this.searchTerm) {
      this.clearSearch();
    }
  }

  handleSearchAction(): void {
    if (this.searchTerm) {
      this.clearSearch();
      setTimeout(() => {
        this.searchInputElement?.nativeElement?.focus();
      }, 50);
    } else {
      this.closeSearch();
    }
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.applyFiltersAndSort();
  }

  onSearchChange(): void {
    this.applyFiltersAndSort();
  }

  setSort(prop: string, dir: 'asc' | 'desc'): void {
    if (this.currentSort.prop === prop && this.currentSort.dir === dir) {
      this.clearSort();
      return;
    }
    this.currentSort = { prop, dir };
    this.applyFiltersAndSort();
  }

  clearSort(): void {
    this.currentSort = { prop: '', dir: 'asc' };
    this.applyFiltersAndSort();
  }

  isCurrentSort(prop: string, dir: 'asc' | 'desc'): boolean {
    return this.currentSort.prop === prop && this.currentSort.dir === dir;
  }

  getSortLabel(): string {
    if (!this.currentSort.prop) return '';
    const dirLabel = this.currentSort.dir === 'asc' ? 'A-Z' : 'Z-A';
    switch (this.currentSort.prop) {
      case 'name':
        return `Company Name (${dirLabel})`;
      case 'createDate':
        return `Date (${this.currentSort.dir === 'desc' ? 'Newest' : 'Oldest'})`;
      case 'mainStatus':
        return `Status (${dirLabel})`;
      case 'level':
        return `Level (${this.currentSort.dir === 'asc' ? 'Asc' : 'Desc'})`;
      default:
        return `${this.currentSort.prop} (${dirLabel})`;
    }
  }

  onDatePeriodChange(): void {
    if (this.filterDatePeriod !== 'CUSTOM') {
      this.filterDateFrom = '';
      this.filterDateTo = '';
    }
    this.applyFiltersAndSort();
  }

  getDatePeriodLabel(): string {
    switch (this.filterDatePeriod) {
      case 'TODAY': return 'Today';
      case 'LAST_7_DAYS': return 'Last 7 Days';
      case 'LAST_30_DAYS': return 'Last 30 Days';
      case 'THIS_MONTH': return 'This Month';
      case 'THIS_YEAR': return 'This Year';
      case 'CUSTOM':
        if (this.filterDateFrom && this.filterDateTo) {
          return `${this.filterDateFrom} to ${this.filterDateTo}`;
        } else if (this.filterDateFrom) {
          return `From ${this.filterDateFrom}`;
        } else if (this.filterDateTo) {
          return `To ${this.filterDateTo}`;
        }
        return 'Custom';
      default:
        return '';
    }
  }

  get activeFilterCount(): number {
    let count = 0;
    if (this.filterStatus && this.filterStatus !== 'ALL') count++;
    if (this.filterLevel && this.filterLevel !== 'ALL') count++;
    if (this.filterDatePeriod && this.filterDatePeriod !== 'ALL') count++;
    return count;
  }

  resetFilters(): void {
    this.filterStatus = 'ALL';
    this.filterLevel = 'ALL';
    this.filterDatePeriod = 'ALL';
    this.filterDateFrom = '';
    this.filterDateTo = '';
    this.applyFiltersAndSort();
  }

  resetAll(): void {
    this.searchTerm = '';
    this.isSearchOpen = false;
    this.clearSort();
    this.resetFilters();
  }

  updateAvailableOptions(): void {
    const statuses = new Set<string>();
    this.allCompanyData.forEach(c => {
      const s = c.mainStatus || c.status;
      if (s) statuses.add(s);
    });
    if (statuses.size > 0) {
      this.availableStatuses = Array.from(statuses);
    } else {
      this.availableStatuses = ['Onboarded', 'InProgress', 'SendBack', 'Rejected'];
    }

    this.updateAvailableLevels();
  }

  updateAvailableLevels(): void {
    const levels = new Set<string>();
    this.allCompanyData.forEach(c => {
      if (c.level && c.level !== 'Loading...' && c.level !== 'N/A') {
        levels.add(c.level);
      }
    });
    if (levels.size > 0) {
      this.availableLevels = Array.from(levels).sort();
    }
  }

  applyFiltersAndSort(): void {
    let result = [...this.allCompanyData];

    // 1. Search filter
    if (this.searchTerm && this.searchTerm.trim() !== '') {
      const q = this.searchTerm.trim().toLowerCase();
      result = result.filter(item => {
        const name = (item.name || '').toLowerCase();
        const status = (item.mainStatus || item.status || '').toLowerCase();
        const level = (item.level || '').toLowerCase();
        const entity = (item.entity || '').toLowerCase();
        const city = (item.city || '').toLowerCase();
        const country = (item.country || '').toLowerCase();
        let dateStr = '';
        if (item.createDate) {
          const d = new Date(item.createDate);
          if (!isNaN(d.getTime())) {
            dateStr = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toLowerCase();
          }
        }
        const dateIso = (item.createDate || '').toString().toLowerCase();

        return (
          name.includes(q) ||
          status.includes(q) ||
          level.includes(q) ||
          entity.includes(q) ||
          city.includes(q) ||
          country.includes(q) ||
          dateStr.includes(q) ||
          dateIso.includes(q)
        );
      });
    }

    // 2. Status filter
    if (this.filterStatus && this.filterStatus !== 'ALL') {
      result = result.filter(item =>
        (item.mainStatus || item.status || '').toLowerCase() === this.filterStatus.toLowerCase()
      );
    }

    // 3. Level filter
    if (this.filterLevel && this.filterLevel !== 'ALL') {
      result = result.filter(item =>
        (item.level || '').toLowerCase() === this.filterLevel.toLowerCase()
      );
    }

    // 4. Date period filter
    if (this.filterDatePeriod && this.filterDatePeriod !== 'ALL') {
      const now = new Date();
      result = result.filter(item => {
        if (!item.createDate) return false;
        const itemDate = new Date(item.createDate);
        if (isNaN(itemDate.getTime())) return false;

        switch (this.filterDatePeriod) {
          case 'TODAY':
            return itemDate.toDateString() === now.toDateString();
          case 'LAST_7_DAYS': {
            const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return itemDate >= sevenDaysAgo && itemDate <= now;
          }
          case 'LAST_30_DAYS': {
            const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return itemDate >= thirtyDaysAgo && itemDate <= now;
          }
          case 'THIS_MONTH':
            return itemDate.getFullYear() === now.getFullYear() && itemDate.getMonth() === now.getMonth();
          case 'THIS_YEAR':
            return itemDate.getFullYear() === now.getFullYear();
          case 'CUSTOM': {
            let matches = true;
            if (this.filterDateFrom) {
              const from = new Date(this.filterDateFrom);
              from.setHours(0, 0, 0, 0);
              matches = matches && itemDate >= from;
            }
            if (this.filterDateTo) {
              const to = new Date(this.filterDateTo);
              to.setHours(23, 59, 59, 999);
              matches = matches && itemDate <= to;
            }
            return matches;
          }
          default:
            return true;
        }
      });
    }

    // 5. Sorting
    if (this.currentSort.prop) {
      const prop = this.currentSort.prop;
      const dir = this.currentSort.dir === 'desc' ? -1 : 1;

      result.sort((a, b) => {
        if (prop === 'createDate') {
          const timeA = a.createDate ? new Date(a.createDate).getTime() : 0;
          const timeB = b.createDate ? new Date(b.createDate).getTime() : 0;
          return (timeA - timeB) * dir;
        }
        if (prop === 'level') {
          const numA = parseInt((a.level || '').replace(/\D/g, ''), 10);
          const numB = parseInt((b.level || '').replace(/\D/g, ''), 10);
          if (!isNaN(numA) && !isNaN(numB)) {
            return (numA - numB) * dir;
          }
        }
        const valA = (a[prop] ?? '').toString().toLowerCase();
        const valB = (b[prop] ?? '').toString().toLowerCase();
        return valA.localeCompare(valB) * dir;
      });
    }

    this.companyData = result;
    this.cdr.detectChanges();
  }

  onSort(event: any): void {
    const sort = event.sorts[0];
    if (sort) {
      this.currentSort = { prop: sort.prop, dir: sort.dir };
      this.applyFiltersAndSort();
    }
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
      return 'InProgress'; // Default status if no entities
    }

    // Check if ALL entities have status 'Completed'
    const allCompleted = vendorUseCompaniesVM.every(
      entity => entity.status?.toLowerCase() === 'completed'
    );

    // Check if ANY entity has status 'InProgress' or 'SendBack'
    const hasInProgressOrSendBack = vendorUseCompaniesVM.some(
      entity =>
        entity.status?.toLowerCase() === 'inprogress' ||
        entity.status?.toLowerCase() === 'sendback'
    );

    if (allCompleted) {
      return 'Onboarded';
    } else if (hasInProgressOrSendBack) {
      return 'InProgress';
    } else {
      // If there are other statuses (like Rejected) but no InProgress/SendBack
      return 'InProgress'; // Default fallback
    }
  }

  getStatusClass(status: any): string {
    const s = (status ?? '').toString().trim().toLowerCase();

    if (s === 'new') return 'status-pill--new';
    if (s === 'inprogress' || s === 'in progress' || s === 'in_progress' || s === 'rejected') return 'status-pill--inprogress';
    if (s === 'sendback') return 'status-pill--sendback';
    if (s === 'onboarded' || s === 'completed' || 'completed') return 'status-pill--completed';

    return 'status-pill--default';
  }

  shouldShowRemarks(entity: any): boolean {
    const status = entity.status?.toLowerCase();
    return ['completed', 'sendback', 'rejected'].includes(status);
  }
}
