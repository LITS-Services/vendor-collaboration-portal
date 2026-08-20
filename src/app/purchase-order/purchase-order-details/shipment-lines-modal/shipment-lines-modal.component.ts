import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ShipmentService } from 'app/shared/services/shipment.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-shipment-lines-modal',
  templateUrl: './shipment-lines-modal.component.html',
  styleUrls: ['./shipment-lines-modal.component.scss'],
  standalone: false
})
export class ShipmentLinesModalComponent implements OnInit {
  @Input() poLineId!: number;
  @Input() itemName!: string;
  @Input() orderedQty!: number;
  @Output() stateChange = new EventEmitter<{ ready: boolean }>();

  form!: FormGroup;
  itemsForm!: FormArray;
  loading = true;
  totalShipped = 0;
  
  constructor(
    private fb: FormBuilder,
    private shipmentService: ShipmentService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      items: this.fb.array([])
    });

    this.itemsForm = this.form.get('items') as FormArray;
    
    // Validate total shipped quantity whenever form changes
    this.itemsForm.valueChanges.subscribe(() => {
      this.validateQuantities();
    });

    this.loadShipmentLines();
  }

  loadShipmentLines() {
    this.loading = true;
    this.spinner.show();
    this.shipmentService.getShipmentLinesByPoLineId(this.poLineId).subscribe({
      next: (res) => {
        const data = res?.value || res; // Handle if wrapped in Result object
        this.itemsForm.clear();
        
        if (data && data.length > 0) {
          data.forEach((line: any) => {
            const row = this.fb.group({
              id: [line.id],
              quantity: [line.quantity, [Validators.required, Validators.min(1)]],
              shipmentDate: [this.toDateInputValue(line.shipmentDate), Validators.required],
              error: [null]
            });
            this.itemsForm.push(row);
          });
        }
        
        this.validateQuantities();
        this.spinner.hide();
        this.loading = false;
        this.stateChange.emit({ ready: true });
      },
      error: () => {
        this.spinner.hide();
        this.loading = false;
        this.stateChange.emit({ ready: true });
        this.toastr.error('Failed to load shipment lines');
      }
    });
  }

  addRow() {
    const row = this.fb.group({
      id: [0],
      quantity: [null, [Validators.required, Validators.min(1)]],
      shipmentDate: [null, Validators.required],
      error: [null]
    });
    this.itemsForm.push(row);
    this.validateQuantities();
  }

  validateQuantities() {
    this.totalShipped = 0;
    
    // First, sum up all quantities to see if we exceed total ordered qty
    let sum = 0;
    this.itemsForm.controls.forEach(ctrl => {
      const q = Number(ctrl.get('quantity')?.value) || 0;
      sum += q;
    });
    this.totalShipped = sum;

    // Then, flag rows if they push the total over the limit
    let runningTotal = 0;
    this.itemsForm.controls.forEach(ctrl => {
      const q = Number(ctrl.get('quantity')?.value) || 0;
      runningTotal += q;
      
      if (runningTotal > this.orderedQty) {
        ctrl.get('error')?.setValue('Exceeds ordered quantity', { emitEvent: false });
      } else {
        ctrl.get('error')?.setValue(null, { emitEvent: false });
      }
    });
    
    // If the whole form is over limit or there are no items, state is not ready for save
    if (this.totalShipped > this.orderedQty || this.itemsForm.length === 0) {
      this.stateChange.emit({ ready: false });
    } else {
      this.stateChange.emit({ ready: this.form.valid });
    }
  }

  save() {
    if (this.form.invalid) {
      this.toastr.warning("Please fill all the required fields.");
      return;
    }

    if (this.totalShipped > this.orderedQty) {
      this.toastr.error("Total shipped quantity exceeds ordered quantity.");
      return;
    }

    Swal.fire({
      title: 'Confirm Save',
      text: 'Are you sure you want to save these shipment lines?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, continue',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (!result.isConfirmed) {
        return;
      }

      const linesPayload = this.itemsForm.controls.map(ctrl => ({
        id: ctrl.get('id')?.value || 0,
        quantity: Number(ctrl.get('quantity')?.value),
        shipmentDate: this.toApiDate(ctrl.get('shipmentDate')?.value)
      }));

      const payload = {
        purchaseOrderLineId: this.poLineId,
        lines: linesPayload
      };

      this.loading = true;
      this.spinner.show();
      this.shipmentService.saveShipmentLines(payload).subscribe({
        next: () => {
          this.loading = false;
          this.spinner.hide();
          //this.toastr.success('Shipment lines saved successfully.');
          this.loadShipmentLines(); // Reload to get newly generated IDs
        },
        error: (err) => {
          this.loading = false;
          this.spinner.hide();
          this.toastr.error(err?.error?.message || 'Failed to save shipment lines.');
        }
      });
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
}
