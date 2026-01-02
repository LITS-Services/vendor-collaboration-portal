import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PurchaseOrderService } from 'app/shared/services/purchase-order.service';

@Component({
  selector: 'app-grn-details',
  templateUrl: './grn-details.component.html',
  styleUrls: ['./grn-details.component.scss'],
  standalone: false
})
export class GrnDetailsComponent implements OnInit {
  @Input() poId: number;
  grnDetails: any;
  loading = true;
  itemsExpanded: boolean = true;
  constructor(private router: Router, private purchaseOrderService: PurchaseOrderService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    if (this.poId) this.loadGrnDetails();
  }
  loadGrnDetails() {
    this.purchaseOrderService.getGoodsReceiptNoteById(this.poId).subscribe({
      next: res => {
        this.grnDetails = res;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => this.loading = false
    });
  }

  toggleItems() {
    this.itemsExpanded = !this.itemsExpanded;
  }

  goBack() {
    this.router.navigate(['/purchase-order/purchase-order-list']);
  }
}