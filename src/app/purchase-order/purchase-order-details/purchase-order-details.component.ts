import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PurchaseOrderService } from 'app/shared/services/purchase-order.service';
import { ToastrService } from 'ngx-toastr';

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
    public cdr: ChangeDetectorRef
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
}
