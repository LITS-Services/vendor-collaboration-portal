import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PurchaseOrderService } from 'app/shared/services/purchase-order.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs/operators';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-vendor-purchase-order-details',
  templateUrl: './purchase-order-details.component.html',
  styleUrls: ['./purchase-order-details.component.scss']
})
export class PurchaseOrderDetailsComponent implements OnInit {
  poDetails: any;
  loading = true;
  poId!: number;
  itemsExpanded: boolean = true;
  selectedTab: any = 'po-details';

  constructor(
    private route: ActivatedRoute,
    private purchaseOrderService: PurchaseOrderService,
    private toastr: ToastrService,
    private router: Router,
    public cdr: ChangeDetectorRef,
    private spinner: NgxSpinnerService
  ) { }

  ngOnInit(): void {
    this.poId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadPurchaseOrder();
  }

  loadPurchaseOrder() {
    this.loading = true;
    this.purchaseOrderService.getPurchaseOrderById(this.poId).subscribe({
      next: (res) => {
        this.poDetails = res;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; }
    });
  }

  toggleItems() {
    this.itemsExpanded = !this.itemsExpanded;
  }

  goToShipment() {
    this.router.navigate(['shipment'], { relativeTo: this.route, skipLocationChange: true });
  }
  goBack() {
    this.router.navigate(['/purchase-order/purchase-order-list']);
  }

  selectTab(tab: any) {
    this.selectedTab = tab;
  }

  rejectPurchaseOrder() {
    if (!this.poId) {
      return;
    }

    Swal.fire({
      title: 'Reject Purchase Order?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Reject',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6'
    }).then((result) => {
      if (result.isConfirmed) {
        this.loading = true;
        this.spinner.show();
        this.purchaseOrderService.rejectPurchaseOrder(this.poId)
        .pipe(finalize(() => { this.spinner.hide(); }))
        .subscribe({
          next: () => {
            this.loadPurchaseOrder();
          },
          error: () => {
            this.loading = false;
            this.toastr.error('Failed to reject Purchase Order');
          }
        });
      }
    });
  }
}