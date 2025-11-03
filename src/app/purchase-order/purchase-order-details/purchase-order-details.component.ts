import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { PurchaseOrderService } from 'app/shared/services/purchase-order.service';

@Component({
  selector: 'app-vendor-purchase-order-details',
  templateUrl: './purchase-order-details.component.html',
  styleUrls: ['./purchase-order-details.component.scss']
})
export class PurchaseOrderDetailsComponent implements OnInit {
  poDetails: any;
  loading = true;
  poId!: number;

  constructor(
    private route: ActivatedRoute,
    private purchaseOrderService: PurchaseOrderService,
    public cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.poId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadPurchaseOrder();
  }

  loadPurchaseOrder(): void {
    this.loading = true;

    this.purchaseOrderService.getPurchaseOrderById(this.poId).subscribe({
      next: (res: any) => {
        if (res) {
          this.poDetails = res;
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
