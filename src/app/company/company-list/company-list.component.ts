import { Component, OnInit, ViewChild } from '@angular/core';
import { ColumnMode, DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import { NewCompanyComponent } from '../new-company/new-company.component';
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
  chkBoxSelected = [];
  announcementId: number;
  isEditButtonDisabled: boolean = true;
  isDeleteButtonDisabled: boolean = true;
  isOpenButtonDisabled: boolean = true;
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
    this.handleBehaviourSubject();

    this.route.queryParams.subscribe(params => {
      if (params['title']) this.title = params['title'];
      this.status = params['status'] || '';
      this.loadCompanies(this.status);
    });
  }

  private handleBehaviourSubject() {
    this.behaviourSubject.next("a value");
    this.behaviourSubject.next("b value");
    this.behaviourSubject.next("c value");
    this.behaviourSubject.subscribe(it => console.warn("observable-1:" + it));
    this.behaviourSubject.subscribe(it => console.warn("observable-2:" + it));
  }

  /** Fetch companies and show only "Inprogress" for current vendor */
  loadCompanies(status?: string) {
    this.loading = true;

    const vendorUserId = localStorage.getItem('vendorUserId'); // 👈 current vendor

    this.companyService.getCompanies(status).subscribe({
      next: (res: any) => {
        const rawCompanies = res?.$values || res || [];

        this.companyData = rawCompanies
          .map((c: any) => ({
            id: c.id,
            companyGUID: c.companyGUID,
            name: c.name,
            logo: c.logo,
            status: c.status,
            vendorId: c.vendorId, // 👈 keep vendorId
            street: c.addresses?.$values?.[0]?.street || '',
            city: c.addresses?.$values?.[0]?.city || '',
            country: c.addresses?.$values?.[0]?.country || '',
            contactNumber: c.contacts?.$values?.[0]?.contactNumber || '',
            contactType: c.contacts?.$values?.[0]?.type || ''
          }))
          // ✅ filter both status + vendorId
          .filter(c =>
            c.status?.toLowerCase() === 'inprogress' &&
            String(c.vendorId) === String(vendorUserId)
          );

        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching companies:', err);
        this.loading = false;
      }
    });
  }

  homePage() {
    this.router.navigate(['/dashboard/dashboard1']);
  }

  openEmpDetails() {
    this.modalService.open(NewCompanyComponent, { size: 'lg', backdrop: 'static', centered: true });
  }

  openQuotationBoxModal(row: any): void {
    const modalRef = this.modalService.open(NewCompanyComponent, {
      size: 'xl',
      backdrop: 'static',
      centered: true,
      windowClass: 'custom-height-modal'
    });
    modalRef.componentInstance.data = row;
  }

  onSort(event) {
    this.loading = true;
    setTimeout(() => {
      const rows = [...this.companyData];
      const sort = event.sorts[0];
      rows.sort((a, b) => {
        return a[sort.prop]?.toString().localeCompare(b[sort.prop]?.toString()) * (sort.dir === 'desc' ? -1 : 1);
      });
      this.companyData = rows;
      this.loading = false;
    }, 500);
  }

  customChkboxOnSelect({ selected }) {
    this.chkBoxSelected = [...selected];
    this.announcementId = selected[0]?.id;
    this.enableDisableButtons();
  }

  enableDisableButtons() {
    const selectedRowCount = this.chkBoxSelected.length;
    this.isDeleteButtonDisabled = selectedRowCount === 0;
    this.isEditButtonDisabled = selectedRowCount !== 1;
    this.isOpenButtonDisabled = selectedRowCount === 0;
    this.isAllSelected = this.companyData.length === this.chkBoxSelected.length;
  }
}
