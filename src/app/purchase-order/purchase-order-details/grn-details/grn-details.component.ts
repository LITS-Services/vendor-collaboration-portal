import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { PurchaseOrderService } from 'app/shared/services/purchase-order.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-grn-details',
  templateUrl: './grn-details.component.html',
  styleUrls: ['./grn-details.component.scss'],
  standalone: false
})
export class GrnDetailsComponent implements OnInit {
  @Input() poId: number;
  @Input() grnId?: number;
  @Input() inModal = false;
  @Output() stateChange = new EventEmitter<{ ready: boolean }>();
  grnDetails: any;
  loading = true;
  itemsExpanded: boolean = true;
  constructor(private router: Router, private purchaseOrderService: PurchaseOrderService,
    private cdr: ChangeDetectorRef, private spinner: NgxSpinnerService
  ) { }

  ngOnInit(): void {
    if (this.grnId || this.poId) {
      this.loadGrnDetails();
    }
  }
  loadGrnDetails() {
    this.loading = true;
    this.spinner.show();
    const targetId = this.grnId ?? this.poId;
    this.purchaseOrderService.getGoodsReceiptNoteById(targetId).subscribe({
      next: res => {
        this.grnDetails = res;
        this.loading = false;
        this.spinner.hide();
        this.cdr.detectChanges();
        this.stateChange.emit({ ready: true });
      },
      error: () => {
        this.loading = false;
        this.spinner.hide();
        this.stateChange.emit({ ready: true });
      }
    });
  }

  toggleItems() {
    this.itemsExpanded = !this.itemsExpanded;
  }

  goBack() {
    this.router.navigate(['/purchase-order/purchase-order-list']);
  }
}