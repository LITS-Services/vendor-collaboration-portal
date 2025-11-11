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

    console.log('Row data for remarks:', row);
    console.log('Entity details for remarks:', row.entityDetails);

    // Filter entities to EXCLUDE InProcess status
    const entitiesWithRemarks = row.entityDetails.filter(e => 
      e.status?.toLowerCase() !== 'inprocess'
    );

    console.log('Entities with remarks (excluding InProcess):', entitiesWithRemarks);

    // If no entities with remarks found, show message
    if (entitiesWithRemarks.length === 0) {
      this.selectedRemarksEntities = [{
        entity: 'No remarks available',
        remark: 'There are no remarks for completed, rejected, or sendback entities.',
        status: '',
        source: 'no-remarks'
      }];
      console.log('No entities with remarks available');
      this.loadingRemarks = false;
      this.modalService.open(this.remarksModal, { size: 'md', backdrop: 'static' });
      return;
    }

    // Create API calls for each entity to get latest remarks ONLY from getlatestremarkscompanyId
    const apiCalls = entitiesWithRemarks.map(entity => 
      this.companyService.getlatestremarkscompanyId(
        entity.procurementCompanyId, 
        row.id
      ).pipe(
        tap(response => {
          console.log(`✅ Latest remarks API response for ${entity.entity}:`, response);
        }),
        catchError(error => {
          console.error(`❌ Error fetching latest remarks for entity ${entity.entity}:`, error);
          return of({ 
            error: true, 
            entity: entity.entity,
            message: 'Failed to fetch remarks from latest remarks API'
          });
        })
      )
    );

    console.log('Making latest remarks API calls for entities:', entitiesWithRemarks.map(e => ({
      entity: e.entity,
      procurementCompanyId: e.procurementCompanyId,
      vendorCompanyId: row.id
    })));

    // Execute all API calls in parallel
    forkJoin(apiCalls).subscribe({
      next: (responses: any[]) => {
        console.log('All latest remarks API responses:', responses);
        
        // Process each entity with its corresponding API response
        this.selectedRemarksEntities = entitiesWithRemarks.map((entity, index) => {
          const response = responses[index];
          
          // Check if response has error
          if (response?.error) {
            return {
              entity: entity.entity,
              remark: 'No remarks available from API',
              status: entity.status,
              procurementCompanyId: entity.procurementCompanyId,
              vendorCompanyId: row.id,
              approverName: entity.approverName || '—',
              createdDate: entity.createdDate,
              source: 'api-error-no-remarks'
            };
          }

          // Check for direct response structure (without value wrapper)
          if (response && response.remarks) {
            // Success case - we have remarks directly in response
            console.log(`✅ Entity ${entity.entity} - SUCCESS: Found direct remarks:`, response.remarks);
            
            return {
              entity: entity.entity,
              remark: response.remarks,
              status: entity.status,
              procurementCompanyId: entity.procurementCompanyId,
              vendorCompanyId: row.id,
              approverName: response.approverName || entity.approverName || '—',
              createdDate: response.createdDate || entity.createdDate,
              source: 'latest-remarks-api'
            };
          } 
          // Also check for the wrapped structure (with value)
          else if (response && response.value && response.value.remarks) {
            // Success case - we have remarks in value object
            const apiData = response.value;
            console.log(`✅ Entity ${entity.entity} - SUCCESS: Found remarks in value:`, apiData.remarks);
            
            return {
              entity: entity.entity,
              remark: apiData.remarks,
              status: entity.status,
              procurementCompanyId: entity.procurementCompanyId,
              vendorCompanyId: row.id,
              approverName: apiData.approverName || entity.approverName || '—',
              createdDate: apiData.createdDate || entity.createdDate,
              source: 'latest-remarks-api'
            };
          } else if (response) {
            // API returned success but no remarks field or empty remarks
            console.log(`⚠️ Entity ${entity.entity} - API success but no remarks:`, response);
            return {
              entity: entity.entity,
              remark: 'No remarks provided in API response',
              status: entity.status,
              procurementCompanyId: entity.procurementCompanyId,
              vendorCompanyId: row.id,
              approverName: response.approverName || entity.approverName || '—',
              createdDate: response.createdDate || entity.createdDate,
              source: 'api-no-remarks'
            };
          } else {
            // No valid response structure
            console.log(`❌ Entity ${entity.entity} - Invalid API response structure:`, response);
            return {
              entity: entity.entity,
              remark: 'Invalid API response format',
              status: entity.status,
              procurementCompanyId: entity.procurementCompanyId,
              vendorCompanyId: row.id,
              approverName: entity.approverName || '—',
              createdDate: entity.createdDate,
              source: 'invalid-api-response'
            };
          }
        });

        console.log('Final selectedRemarksEntities:', this.selectedRemarksEntities);
        this.loadingRemarks = false;
        this.cdr.detectChanges();
        this.modalService.open(this.remarksModal, { size: 'md', backdrop: 'static' });
      },
      error: (error) => {
        console.error('API Error in forkJoin for latest remarks:', error);
        
        this.selectedRemarksEntities = entitiesWithRemarks.map(entity => ({
          entity: entity.entity,
          remark: 'Unable to load remarks from API',
          status: entity.status,
          procurementCompanyId: entity.procurementCompanyId,
          vendorCompanyId: row.id,
          approverName: entity.approverName || '—',
          createdDate: entity.createdDate,
          source: 'api-complete-failure'
        }));
        
        this.loadingRemarks = false;
        this.cdr.detectChanges();
        this.modalService.open(this.remarksModal, { size: 'md', backdrop: 'static' });
      }
    });
  }

  shouldShowRemarks(entity: any): boolean {
    const status = entity.status?.toLowerCase();
    return ['completed', 'sendback', 'rejected'].includes(status);
  }
}