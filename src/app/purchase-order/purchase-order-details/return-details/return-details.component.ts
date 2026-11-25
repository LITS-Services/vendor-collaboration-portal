import { formatDate } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { PurchaseOrderService } from 'app/shared/services/purchase-order.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-return-details',
  templateUrl: './return-details.component.html',
  styleUrls: ['./return-details.component.scss'],
  standalone: false
})
export class ReturnDetailsComponent implements OnInit {
  @Input() returnId?: number;
  @Input() poId?: number;
  @Input() inModal = false;
  @Output() stateChange = new EventEmitter<{ ready: boolean }>();
  returnDetails: any;
  loading = true;
  itemsExpanded: boolean = true;

  constructor(
    private router: Router,
    private purchaseOrderService: PurchaseOrderService,
    private cdr: ChangeDetectorRef,
    private spinner: NgxSpinnerService
  ) { }

  ngOnInit(): void {
    if (this.returnId) {
      this.loadReturnDetails();
    }
  }

  loadReturnDetails() {
    this.loading = true;
    this.spinner.show();
    this.purchaseOrderService.getPurchaseReturnById(this.returnId!).subscribe({
      next: (res) => {
        this.returnDetails = res?.value || res;
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

  formatDisplayDate(value: string | Date | null | undefined): string {
    if (!value) {
      return '';
    }
    const date = new Date(value);
    if (isNaN(date.getTime()) || date.getFullYear() <= 1) {
      return '';
    }
    return formatDate(date, 'yyyy-MM-dd', 'en-US');
  }

  toggleItems() {
    this.itemsExpanded = !this.itemsExpanded;
  }

  goBack() {
    this.router.navigate(['/purchase-order/purchase-order-list']);
  }
}
