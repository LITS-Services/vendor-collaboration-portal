import { ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { QuotationRequest } from '../../models/quotation-request.model';
import { RfqService } from 'app/shared/services/rfq.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-rfq-list',
  templateUrl: './rfq-list.component.html',
  styleUrls: ['./rfq-list.component.scss']
})
export class RfqListComponent implements OnInit {
  quotations: QuotationRequest[] = [];
  selectedStatus: string = '';
  isFilterOpen = false;

  constructor(private rfqService: RfqService, private modalService: NgbModal,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute,
    public toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.selectedStatus = params['status'] || '';
      this.loadQuotations();
    });
  }

  loadQuotations(): void {
    const vendorUserId = localStorage.getItem('userId');
    if (!vendorUserId) {
      this.toastr.error('Vendor user not found. Please login again.');
      return;
    }

    this.rfqService.getQuotationsByVendor(vendorUserId, this.selectedStatus)
      .subscribe(res => {
        this.quotations = res;
        this.cdr.detectChanges();
      });
  }

  openBidModal(rfq: QuotationRequest): void {
    if (!rfq.id) {
      this.toastr.error('Unable to open the modal.');
      return;
    }

    this.router.navigate(['/rfq/submit-bid', rfq.id]);
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
}
