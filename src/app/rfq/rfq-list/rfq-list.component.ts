import { ChangeDetectorRef, Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { QuotationRequest } from '../../models/quotation-request.model';
import { RfqService } from 'app/shared/services/rfq.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { skip } from 'rxjs/operators';
import { NgxSpinnerService } from 'ngx-spinner';
import { DatatableComponent } from '@swimlane/ngx-datatable';

@Component({
  selector: 'app-rfq-list',
  templateUrl: './rfq-list.component.html',
  styleUrls: ['./rfq-list.component.scss'],
  standalone: false
})
export class RfqListComponent implements OnInit {
  quotations: QuotationRequest[] = [];
  @ViewChild('datatable', { static: false }) datatable!: DatatableComponent;
  selectedStatus: string = '';
  isFilterOpen = false;
  forPending = false;
    datatableVisible: boolean = true;
  constructor(private rfqService: RfqService, private modalService: NgbModal,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute,
    public toastr: ToastrService,
    public spinner:NgxSpinnerService
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.selectedStatus = params['status'] || '';
      this.forPending = params['forPending'] === 'true' || false;
      this.loadQuotations();
    });
  }


    onAutoResize(): void {
      this.spinner.show();
    this.datatableVisible = false;
    this.cdr.detectChanges(); // destroy

    requestAnimationFrame(() => {
      this.datatableVisible = true;
      this.spinner.hide();
      this.cdr.detectChanges(); // recreate
    });
  }
  loadQuotations(): void {
    const vendorUserId = localStorage.getItem('userId');
    if (!vendorUserId) {
      this.toastr.error('Vendor user not found. Please login again.');
      return;
    }

    this.spinner.show();

    this.rfqService.getQuotationsByVendor(vendorUserId, this.selectedStatus, this.forPending)
      .subscribe(res => {
        this.quotations = res;
        this.spinner.hide();
        this.cdr.detectChanges();
      });
  }

  get isMobile(): boolean {
    return window.innerWidth <= 768;
  }
  

  openBidModal(rfq: QuotationRequest): void {
    if (!rfq.id) {
      this.toastr.error('Unable to open the modal.');
      return;
    }

    this.router.navigate(['/rfq/submit-bid', rfq.id],
      {
        skipLocationChange: true
      }
    );
  }

  toggleFilterDropdown() {
    this.isFilterOpen = !this.isFilterOpen;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown')) {
      this.isFilterOpen = false;
    }
  }

  getStatusClass(status: any): string {
  const s = (status ?? '').toString().trim().toLowerCase();

  if (s === 'new') return 'status-pill--new';
  if (s === 'inprogress' || s === 'in progress' || s === 'in_progress') return 'status-pill--inprogress';
  if (s === 'completed') return 'status-pill--completed';
  if (s === 'rejected') return 'status-pill--rejected';

  return 'status-pill--default';
}
}
