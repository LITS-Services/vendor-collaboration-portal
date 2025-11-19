import { Component, OnInit, ViewChild, ChangeDetectorRef, TemplateRef } from '@angular/core';
import { ColumnMode, DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, forkJoin, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
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
  @ViewChild('statusModal') statusModal: TemplateRef<any>;
  @ViewChild('remarksModal') remarksModal: TemplateRef<any>;

  companyData: any[] = [];
  loading: boolean = false;
  chkBoxSelected: any[] = [];
  isAllSelected: boolean = false;
  title: string = 'Companies';
  status: string = '';

  selectedStatusEntities: any[] = [];
  selectedRemarksEntities: any[] = [];
  loadingRemarks: boolean = false;
  loadingStatus: boolean = false;
  showNoRemarksMessage: boolean = false; // Added for template flag

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

      if (['completed', 'approve', 'new'].includes(this.status)) {
        this.loadCompanies('completed');
      } else {
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

    console.log('Loading companies with status:', status, 'for user:', userId);

    this.companyService.getCompanyByVendorId(userId, status).subscribe({
      next: (res: any) => {
        console.log('Raw API response from getCompanyByVendorId:', res);
        
        const rawCompanies = Array.isArray(res) ? res : res?.$values || [];
        console.log('Processed companies array:', rawCompanies);

        // Base company mapping - IGNORE remarks from getCompanyByVendorId
     this.companyData = rawCompanies.map(c => ({
  id: c.id,
  companyGUID: c.companyGUID,
  name: c.name,
  logo: c.logo,
  createDate: c.createdDate,
  status: this.getOverallStatus(c.vendorUseCompaniesVM),
  mainStatus: this.getMainStatus(c.vendorUseCompaniesVM), // ADD THIS LINE
  vendorId: c.vendorId,
  street: c.addressesVM?.[0]?.street || '',
  city: c.addressesVM?.[0]?.city || '',
  state: c.addressesVM?.[0]?.state || '',
  country: c.addressesVM?.[0]?.country || '',
  contactNumber: c.contactsVM?.[0]?.contactNumber || '',
  contactType: c.contactsVM?.[0]?.type || '',
  entity: c.vendorUseCompaniesVM?.map(vuc => vuc.procurementCompany).join(', ') || '',
  procurementCompanyId: c.vendorUseCompaniesVM?.[0]?.procurementCompanyId || null,
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
          this.cdr.detectChanges();
          return;
        }

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Error fetching companies:', err);
        console.error('Error details:', {
          status: err.status,
          statusText: err.statusText,
          message: err.message,
          error: err.error
        });
        this.loading = false;
        this.cdr.detectChanges();
      }
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

  openStatusPopup(row: any): void {
    this.loadingStatus = true;
    this.selectedStatusEntities = [...row.entityDetails]; // Copy entity details
    
    console.log('Opening status popup for company:', row);
    console.log('Entity details:', row.entityDetails);

    // If no entities found, show empty
    if (!this.selectedStatusEntities || this.selectedStatusEntities.length === 0) {
      this.loadingStatus = false;
      this.modalService.open(this.statusModal, { size: 'lg', backdrop: 'static' });
      return;
    }

    // Create API calls for each entity to get approver level
    const levelRequests = this.selectedStatusEntities.map(entity => 
      this.companyService.GetCompanyApproverLevel(row.id, entity.procurementCompanyId).pipe(
        tap(response => {
          console.log(`✅ Approver level response for entity ${entity.entity}:`, response);
        }),
        catchError(error => {
          console.error(`❌ Error fetching approver level for entity ${entity.entity}:`, error);
          return of({ 
            error: true, 
            entity: entity.entity,
            message: 'Failed to fetch approver level'
          });
        })
      )
    );

    console.log('Making approver level requests for entities:', this.selectedStatusEntities.map(e => ({
      entity: e.entity,
      vendorCompanyId: row.id,
      procurementCompanyId: e.procurementCompanyId
    })));

    // Execute all API calls in parallel
    forkJoin(levelRequests).subscribe({
      next: (responses: any[]) => {
        console.log('All approver level responses:', responses);
        
        // Update each entity with approver level data
        this.selectedStatusEntities.forEach((entity, index) => {
          const response = responses[index];
          
          // Check if this response is an error
          if (response?.error) {
            entity.level = 'N/A';
            entity.approverLevelName = 'N/A';
            return;
          }

          // Extract approver level and name from response
          let approverLevel, approverName;
          
          if (response?.value?.approverLevel !== undefined) {
            approverLevel = response.value.approverLevel;
            approverName = response.value.approverName;
          } else if (response?.approverLevel !== undefined) {
            approverLevel = response.approverLevel;
            approverName = response.approverName;
          } else if (response?.data?.approverLevel !== undefined) {
            approverLevel = response.data.approverLevel;
            approverName = response.data.approverName;
          } else if (response?.result?.approverLevel !== undefined) {
            approverLevel = response.result.approverLevel;
            approverName = response.result.approverName;
          }

          // Set the level display
          if (approverLevel !== undefined && approverLevel !== null && approverLevel !== '') {
            entity.level = `Level ${approverLevel}`;
          } else {
            entity.level = 'N/A';
          }

          // Set approver name
          entity.approverLevelName = approverName || 'N/A';
        });

        console.log('Final selectedStatusEntities with levels:', this.selectedStatusEntities);
        this.loadingStatus = false;
        this.cdr.detectChanges();
        this.modalService.open(this.statusModal, { size: 'lg', backdrop: 'static' });
      },
      error: (error) => {
        console.error('Critical error in forkJoin for approver levels:', error);
        // Set all to N/A as fallback
        this.selectedStatusEntities.forEach(entity => {
          entity.level = 'N/A';
          entity.approverLevelName = 'N/A';
        });
        this.loadingStatus = false;
        this.cdr.detectChanges();
        this.modalService.open(this.statusModal, { size: 'lg', backdrop: 'static' });
      }
    });
  }

openRemarksPopup(row: any): void {
  this.loadingRemarks = true;
  this.selectedRemarksEntities = [];
  this.showNoRemarksMessage = false; // Reset flag

  console.log('Row data for remarks:', row);
  console.log('Entity details for remarks:', row.entityDetails);

  // Remove the filter: Call API for ALL entities (including 'InProcess')
  const entitiesWithRemarks = row.entityDetails; // No filtering

  console.log('Entities for remarks (all entities):', entitiesWithRemarks);

  // If no entities found, show message
  if (!entitiesWithRemarks || entitiesWithRemarks.length === 0) {
    this.selectedRemarksEntities = [{
      entity: 'No remarks available',
      remarks: [], // Empty array for no remarks
      status: '',
      source: 'no-remarks'
    }];
    this.showNoRemarksMessage = true; // Set flag
    console.log('No entities available');
    this.loadingRemarks = false;
    this.modalService.open(this.remarksModal, { size: 'lg', backdrop: 'static' });
    return;
  }

  // Create API calls for each entity using getsetuphistory with associationId (entity.id)
  const apiCalls = entitiesWithRemarks.map(entity => 
    this.companyService.getsetuphistory(entity.id).pipe(
      tap(response => {
        console.log(`✅ Setup history response for entity ${entity.entity}:`, response);
      }),
      catchError(error => {
        console.error(`❌ Error fetching setup history for entity ${entity.entity}:`, error);
        return of({ 
          error: true, 
          entity: entity.entity,
          message: 'Failed to fetch remarks from setup history API'
        });
      })
    )
  );

  console.log('Making setup history API calls for entities:', entitiesWithRemarks.map(e => ({
    entity: e.entity,
    associationId: e.id // Using entity.id as associationId
  })));

  // Execute all API calls in parallel
  forkJoin(apiCalls).subscribe({
    next: (responses: any[]) => {
      console.log('All setup history API responses:', responses);
      
      // Process each entity with its corresponding API response
      this.selectedRemarksEntities = entitiesWithRemarks.map((entity, index) => {
        const response = responses[index];
        
        // Check if response has error
        if (response?.error) {
          return {
            entity: entity.entity,
            remarks: [], // Empty array on error
            status: entity.status,
            source: 'api-error'
          };
        }

        // CORRECTED: Extract remarks array from response.value
        let remarksArray = [];
        
        // Handle different possible response structures
        if (Array.isArray(response?.value)) {
          remarksArray = response.value;
        } else if (Array.isArray(response?.data?.value)) {
          remarksArray = response.data.value;
        } else if (Array.isArray(response)) {
          remarksArray = response;
        }
        
        console.log(`Processed remarks for ${entity.entity}:`, remarksArray);

        return {
          entity: entity.entity,
          remarks: remarksArray, // Array of { remarks, createdDate, approverName }
          status: entity.status,
          source: 'setup-history-api'
        };
      });

      // Set the flag for no remarks message - check if ALL entities have no remarks
      const hasAnyRemarks = this.selectedRemarksEntities.some(e => e.remarks && e.remarks.length > 0);
      this.showNoRemarksMessage = !hasAnyRemarks;

      console.log('Final selectedRemarksEntities:', this.selectedRemarksEntities);
      this.loadingRemarks = false;
      this.cdr.detectChanges();
      this.modalService.open(this.remarksModal, { size: 'lg', backdrop: 'static' });
    },
    error: (error) => {
      console.error('API Error in forkJoin for setup history:', error);
      
      this.selectedRemarksEntities = entitiesWithRemarks.map(entity => ({
        entity: entity.entity,
        remarks: [], // Empty array on complete failure
        status: entity.status,
        source: 'api-complete-failure'
      }));
      
      this.showNoRemarksMessage = true; // Set flag on error
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
  shouldShowRemarks(entity: any): boolean {
    const status = entity.status?.toLowerCase();
    return ['completed', 'sendback', 'rejected'].includes(status);
  }
}
