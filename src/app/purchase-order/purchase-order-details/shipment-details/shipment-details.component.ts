import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ShipmentService } from 'app/shared/services/shipment.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-shipment-details',
  templateUrl: './shipment-details.component.html',
  styleUrls: ['./shipment-details.component.scss'],
  standalone: false
})
export class ShipmentDetailsComponent implements OnInit {
  @Input() poId: number;
  @Input() shipmentId?: number;
  @Input() inModal = false;
  @Output() stateChange = new EventEmitter<{ ready: boolean; isEdit: boolean; readyForPosting: boolean }>();
  form!: FormGroup;
  itemsForm!: FormArray;
  isEdit = false;
  readyForPosting = false;
  selectedShipmentId?: number;
  itemsExpanded: boolean = true;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private shipmentService: ShipmentService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
    private spinner: NgxSpinnerService
  ) { }

  ngOnInit(): void {
    // this.poId = Number(this.route.snapshot.paramMap.get('id'));
    this.form = this.fb.group({
      shipmentNo: [{ value: '', disabled: true }],
      prNo: [{ value: '', disabled: true }],
      poNo: [{ value: '', disabled: true }],
      transferFromCode: [{ value: '', disabled: true }],
      transferToCode: [{ value: '', disabled: true }],
      postingDate: [{ value: null, disabled: true }],
      shipmentDate: [null],
      items: this.fb.array([])
    });

    this.itemsForm = this.form.get('items') as FormArray;
    //this.loadShipmentDetails();
    this.cdr.detectChanges();
    
  }

  loadShipmentDetails() {
    this.loading = true;
    this.spinner.show();
    const shipmentId = this.shipmentId ?? 0;
    this.shipmentService.getShipmentDetailById(shipmentId, this.poId).subscribe({
      next: (res) => {
        const data = res;
        console.log("shupment", data)

        if (data?.id) {
          this.isEdit = true;
          this.selectedShipmentId = data.id;
        }

        this.readyForPosting = !!data?.readyForPosting;

        this.form.patchValue({
          shipmentNo: data?.shipmentNo ?? '',
          prNo: data?.prNo ?? '',
          poNo: data?.poNo ?? '',
          transferFromCode: data?.transferFromCode ?? '',
          transferToCode: data?.transferToCode ?? '',
          postingDate: this.toDateInputValue(data?.postingDate),
          shipmentDate: this.toDateInputValue(data?.shipmentDate ?? data?.shippingDate)
        });

        this.spinner.hide();
        this.itemsForm.clear();

        const lineItems = data?.lines ?? data?.items ?? [];
        lineItems.forEach(item => {
          const row = this.fb.group({
            lineId: [item.id ?? item.lineId ?? item.purchaseOrderLineId ?? 0],
            itemName: [item.itemName],
            quantity: [item.quantity ?? item.shippingQuantity ?? null, Validators.required],
            deliveryDate: [
              this.toDateInputValue(item.shipmentDate ?? item.deliveryDate ?? item.deliverDate),
              Validators.required
            ]
          });

          this.itemsForm.push(row);
        });

        this.applyReadOnlyState();
        this.cdr.detectChanges();
        this.stateChange.emit({ ready: true, isEdit: this.isEdit, readyForPosting: this.readyForPosting });
      },
      error: () => {
        this.spinner.hide();
        this.loading = false;
        this.stateChange.emit({ ready: true, isEdit: false, readyForPosting: false });
        console.log("No existing shipment - Add mode");
      }
    });
  }

  save() {
    if (this.readyForPosting) {
      return;
    }

    if (this.form.invalid) {
      this.toastr.warning("Please fill all the required fields.");
      return;
    }

    Swal.fire({
      title: 'Confirm Shipment',
      text: this.isEdit
        ? 'Are you sure you want to update this shipment?'
        : 'Are you sure you want to create this shipment?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, continue',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (!result.isConfirmed) {
        return;
      }

    const linesPayload = this.itemsForm.controls.map(ctrl => ({
      id: ctrl.get('lineId')?.value ?? 0,
      quantity: Number(ctrl.get('quantity')?.value ?? 0),
      deliveryDate: ctrl.get('deliveryDate')?.value ?? null
    }));

    if (this.isEdit && this.selectedShipmentId) {
      const updatePayload = {
        shipmentDetailId: this.selectedShipmentId,
        shippingDate: this.toApiDate(this.form.get('shipmentDate')?.value),
        readyForPosting: true,
        lines: linesPayload.map(line => ({
          id: line.id,
          quantity: line.quantity,
          shipmentDate: this.toApiDate(line.deliveryDate)
        }))
      };
      this.loading = true;
      this.spinner.show();
      this.shipmentService.updateShipment(updatePayload).subscribe({
        next: () => {
          this.loading = false;
          this.spinner.hide();
          // readyForPosting is only applied after a successful reload from get-by-id
          this.loadShipmentDetails();
        },
        error: (err) => {
          this.loading = false;
          this.spinner.hide();
          // Keep form editable — backend did not persist readyForPosting on failure
          this.readyForPosting = false;
          this.applyReadOnlyState();
          this.stateChange.emit({
            ready: true,
            isEdit: this.isEdit,
            readyForPosting: false
          });
          this.toastr.error(this.extractApiError(err, 'Failed to update shipment'));
        }
      });
      return;
    }

    const shipmentDetailPayload = {
      shipmentDate: this.form.get('shipmentDate')?.value
        ? new Date(this.form.get('shipmentDate')?.value)
        : null,
      lines: linesPayload.map(({ id, quantity, deliveryDate }) => ({
        purchaseOrderLineId: id || null,
        quantity,
        shipmentDate: this.toApiDate(deliveryDate)
      }))
    };

    const createPayload = {
      purchaseOrderId: this.poId,
      shipmentDetail: shipmentDetailPayload
    };
    this.loading = true;
    this.spinner.show();
    this.shipmentService.createShipment(createPayload).subscribe({
      next: () => {
        this.loading = false;
        this.spinner.hide();
        this.router.navigate([`/purchase-order/purchase-order-details/${this.poId}`], { skipLocationChange: true });
        this.loadShipmentDetails();
      }
    });
    });
  }

  deleteShipment() {
    if (this.readyForPosting) {
      return;
    }

    if (!this.selectedShipmentId) {
      this.toastr.warning('No shipment to delete.');
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: 'This will delete the shipment and clear all line quantities!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.shipmentService.deleteShipment(this.selectedShipmentId).subscribe({
          next: () => {
            //Swal.fire('Deleted!', 'Shipment has been deleted.', 'success');
            this.form.patchValue({
              shipmentDate: null
            });

            this.itemsForm.controls.forEach(ctrl => {
              ctrl.get('quantity')?.setValue(null);
              ctrl.get('deliveryDate')?.setValue(null);
            });

            this.isEdit = false;
            this.selectedShipmentId = undefined;
            this.loadShipmentDetails();
            //this.cdr.detectChanges();
        },
          error: () => {
            Swal.fire('Error!', 'Failed to delete shipment.', 'error');
          }
        });
      }
    });
  }

  goBack() {
    const id = this.route.snapshot.paramMap.get('id');
    this.router.navigate([`/purchase-order/purchase-order-details/${id}`], { skipLocationChange: true });
  }

  toggleItems() {
    this.itemsExpanded = !this.itemsExpanded;
  }

  private applyReadOnlyState(): void {
    if (this.readyForPosting) {
      this.form.get('shipmentDate')?.disable({ emitEvent: false });
      this.itemsForm.controls.forEach(ctrl => {
        ctrl.get('quantity')?.disable({ emitEvent: false });
        ctrl.get('deliveryDate')?.disable({ emitEvent: false });
      });
      return;
    }

    this.form.get('shipmentDate')?.enable({ emitEvent: false });
    this.itemsForm.controls.forEach(ctrl => {
      ctrl.get('quantity')?.enable({ emitEvent: false });
      ctrl.get('deliveryDate')?.enable({ emitEvent: false });
    });
  }

  private toDateInputValue(dateStr: string | null | undefined): string | null {
    return dateStr ? dateStr.split('T')[0] : null;
  }

  private toApiDate(value: string | Date | null | undefined): string | null {
    if (!value) {
      return null;
    }

    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }

  private extractApiError(err: any, fallback: string): string {
    const errors = err?.error?.errors;
    if (Array.isArray(errors) && errors.length > 0) {
      return errors.join(', ');
    }

    const validationErrors = err?.error?.validationErrors;
    if (Array.isArray(validationErrors) && validationErrors.length > 0) {
      return validationErrors.map((e: any) => e?.errorMessage || e?.message || e).join(', ');
    }

    return err?.error?.message || err?.message || fallback;
  }
}