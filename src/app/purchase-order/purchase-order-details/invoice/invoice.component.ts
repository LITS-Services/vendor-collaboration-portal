import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PurchaseOrderService } from 'app/shared/services/purchase-order.service';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { formatDate } from '@angular/common';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.scss'],
  standalone: false
})
export class InvoiceComponent implements OnInit {
  @Input() poId!: number;

  form!: FormGroup;
  itemsForm!: FormArray;
  isEdit = false;
  itemsExpanded = true;
  invoiceId?: number;
  purchaseOrderNo: string = '';
  vendorName: string = '';
  grNumber: string = '';
  invoiceExists = false;
  loading = true;

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private purchaseOrderService: PurchaseOrderService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.loadGrnDetails();
    this.checkInvoice();
    this.cdr.detectChanges();
  }

  private initForm() {
    this.form = this.fb.group({
      invoiceNo: [{ value: '', disabled: true }],
      purchaseOrderNo: [{ value: '', disabled: true }],
      vendorName: [{ value: '', disabled: true }],
      invoiceDate: [{ value: '', disabled: true }],
      grNumber: [{ value: '', disabled: true }],
      requestStatus: [{ value: '', disabled: true }],
      paymentTerms: [''],
      dueDate: [''],
      remarks: [''],
      items: this.fb.array([])
    });

    this.itemsForm = this.form.get('items') as FormArray;
  }

  private loadGrnDetails() {
    this.loading = true;
    this.spinner.show();
    this.purchaseOrderService.getGoodsReceiptNoteById(this.poId).subscribe({
      next: (res) => {
        if (!res) return;
        this.purchaseOrderNo = res.purchaseOrderNo;
        this.vendorName = res.vendorName;
        this.grNumber = res.grNumber;

      this.form.patchValue({
          purchaseOrderNo: res.purchaseOrderNo,
          vendorName: res.vendorName,
          grNumber: res.grNumber
        });

        if (res.goodsReceiptItems?.length) {
          this.itemsForm.clear();
          res.goodsReceiptItems.forEach(item => this.itemsForm.push(this.createItemGroup(item, true)));
        }
        this.loading = false;
        this.spinner.hide();
        this.cdr.markForCheck();
      },
      error: (err) => console.error(err)
    });
  }
  // private loadPurchaseOrder() {
  //   this.loading = true;
  //   this.spinner.show();
  //   this.purchaseOrderService.getPurchaseOrderById(this.poId).subscribe({
  //     next: (po) => {
  //       if (!po) return;

  //       this.purchaseOrderNo = po.purchaseOrderNo;
  //       this.vendorName = po.vendorName;
  //       this.grNumber = po.grNumber;

  //       this.form.patchValue({
  //         purchaseOrderNo: po.purchaseOrderNo,
  //         vendorName: po.vendorName,
  //         grNumber: po.grNumber
  //       });

  //       if (po.items?.length) {
  //         po.items.forEach(item => this.itemsForm.push(this.createItemGroup(item, true)));
  //       }
  //       this.loading = false;
  //       this.spinner.hide();
  //       this.cdr.markForCheck();
  //     },
  //     error: (err) => console.error(err)
  //   });
  // }

  private checkInvoice() {
    this.loading = true;
    this.spinner.show();
    this.purchaseOrderService.getInvoiceByPoId(this.poId).subscribe({
      next: (invoice) => {
        if (invoice && invoice.id) {
          this.invoiceExists = true;
          this.isEdit = true;

          this.form.patchValue({
            invoiceNo: invoice.invoiceNo,
            invoiceDate: this.toDateInputValue(invoice.invoiceDate),
            paymentTerms: invoice.paymentTerms,
            dueDate: this.toDateInputValue(invoice.dueDate),
            remarks: invoice.remarks,
            requestStatus: invoice.requestStatus
          });

          // Patch invoice items
          if (invoice.invoiceItems?.length) {
            this.itemsForm.clear();
            invoice.invoiceItems.forEach(item =>
              this.itemsForm.push(this.createItemGroup(item, false))
            );
          }

          this.form.disable();
        }
        this.loading = false;
        this.spinner.hide();
        this.cdr.detectChanges();
      },
      error: () => {
        this.invoiceExists = false;
        this.isEdit = false;
      }
    });
  }

  private createItemGroup(item: any, isPOItem: boolean): FormGroup {
    return this.fb.group({
      purchaseOrderLineId: [item.purchaseOrderLineId],
      itemName: [{ value: item.itemName, disabled: true }],
      totalQuantity: [{ value: isPOItem ? item.receivedQuantity : item.totalQuantity, disabled: true }],
      totalAmount: [{ value: isPOItem ? item.amount : item.totalAmount, disabled: this.isEdit }]
    });
  }

  toggleItems() {
    this.itemsExpanded = !this.itemsExpanded;
  }

  sendForPayment() {
    if (this.form.invalid) {
      this.toastr.warning('Please fill required fields.');
      return;
    }

    Swal.fire({
      title: 'Confirm Invoice',
      text: 'Do you want to send this invoice for payment?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, send',
      cancelButtonText: 'Cancel'
    }).then(result => {
      if (!result.isConfirmed) return;

      const payload = {
        purchaseOrderId: this.poId,
        invoice: {
          paymentTerms: this.form.get('paymentTerms')?.value,
          dueDate: this.form.get('dueDate')?.value,
          remarks: this.form.get('remarks')?.value,
          invoiceItems: this.itemsForm.getRawValue().map((item: any) => ({
            purchaseOrderLineId: item.purchaseOrderLineId,
            totalAmount: item.totalAmount
          }))
        }
      };
      this.loading = true;
      this.spinner.show();
      this.purchaseOrderService.createInvoice(payload).subscribe({
        next: (res: any) => {
          if (res) {
            this.purchaseOrderService.downloadInvoicePdf(res).subscribe(blob => {
              const url = window.URL.createObjectURL(blob);
              window.open(url, '_blank');
              const link = document.createElement('a');
              link.href = url;
              link.download = `Invoice_${this.form.get('invoiceNo')?.value}.pdf`;
              link.click();
              window.URL.revokeObjectURL(url);
            });

            this.form.disable();
            this.isEdit = true;
            this.loading = false;
            this.spinner.hide();
            this.cdr.detectChanges();
            this.checkInvoice();
          }
        },
        error: (err) => {
          this.toastr.error('Failed to create invoice.');
        }
      });


    });
  }

  goBack() {
    this.router.navigate(['/purchase-order/purchase-order-list']);
  }

  private toDateInputValue(date?: string | Date): string {
    if (!date) return '';
    return formatDate(date, 'yyyy-MM-dd', 'en-US');
  }
}