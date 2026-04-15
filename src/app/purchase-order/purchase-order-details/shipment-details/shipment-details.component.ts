import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PurchaseOrderService } from 'app/shared/services/purchase-order.service';
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
  @Output() stateChange = new EventEmitter<{ ready: boolean; isEdit: boolean }>();
  form!: FormGroup;
  itemsForm!: FormArray;
  isEdit = false;
  selectedShipmentId?: number;
  purchaseOrderNo?: string;
  vendorName?: string;
  itemsExpanded: boolean = true;
  loading = true;

  addressList: any[] = []; // for primary dropdown
  address2List: any[] = []; // for secondary dropdown


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private shipmentService: ShipmentService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
    private purchaseOrderService: PurchaseOrderService,
    private spinner: NgxSpinnerService
  ) { }

  ngOnInit(): void {
    // this.poId = Number(this.route.snapshot.paramMap.get('id'));
    this.form = this.fb.group({
      shipToName: [{ value: '', disabled: true }],
      country: [{ value: '', disabled: true }],
      city: [{ value: '', disabled: true }],
      shipToAddress: [{ value: '', disabled: true }],
      shipToAddress2: [{ value: '', disabled: true }],
      region: [{ value: '', disabled: true }],
      postCode: [{ value: '', disabled: true }],
      shipmentDate: [null],
      notes: [''],
      items: this.fb.array([])
    });

    this.itemsForm = this.form.get('items') as FormArray;
    this.loadPurchaseOrder();
    this.loadShipmentDetails();
    this.cdr.detectChanges();
    
  }

  loadPurchaseOrder() {
    this.loading = true;
    this.spinner.show();
    this.purchaseOrderService.getPurchaseOrderById(this.poId).subscribe({
      next: (po) => {
        if (po) {
          const receiverName = po.receiverName;
          const address = po.address;
          const address2 = po.address2;
          const country = po.country;
          const city = po.city;
          const region = po.region;
          const postCode = po.postCode;
          
          if (receiverName) {
            this.form.patchValue({ shipToName: receiverName });
          }

          if (address) {
            this.form.patchValue({ shipToAddress: address });
          }

          if (address2) {
            this.form.patchValue({ shipToAddress2: address2 });
          }

          if (country) {
            this.form.patchValue({ country: country });
          }

          if (city) {
            this.form.patchValue({ city: city });
          }

          if (region) {
            this.form.patchValue({ region: region });
          }

          if (postCode) {
            this.form.patchValue({ postCode: postCode });
          }
        }
        this.spinner.hide();
      }
    });
  }

  loadShipmentDetails() {
    this.loading = true;
    this.spinner.show();
    const shipmentId = this.shipmentId ?? 0;
    this.shipmentService.getShipmentDetailById(shipmentId, this.poId).subscribe({
      next: (res) => {
        const data = res;
        console.log("shupment", data)

        if (data && data.id) {
          this.isEdit = true;

          this.selectedShipmentId = data.id;
          this.purchaseOrderNo = data.purchaseOrderNo;
          this.vendorName = data.vendorName;

          this.form.patchValue({
            shipToName: data.shipToName,
            country: data.country,
            city: data.city,
            region: data.region,
            shipToAddress: data.shipToAddress,
            shipToAddress2: data.shipToAddress2,
            postCode: data.postCode,
            shipmentDate: data.shipmentDate ? data.shipmentDate.split('T')[0] : null,
            notes: data.notes
          });
        }
        this.spinner.hide();
        this.itemsForm.clear();

        data.items?.forEach(item => {
          const row = this.fb.group({
            purchaseOrderLineId: [item.purchaseOrderLineId],
            itemName: [item.itemName],
            orderedQty: [item.orderedQty],
            deliveryDate: [item.deliveryDate ? item.deliveryDate.split('T')[0] : null, Validators.required],
            shippingQuantity: [item.shippingQuantity, Validators.required]
          });

          row.get('shippingQuantity')?.valueChanges.subscribe(value => {
            const orderedQty = row.get('orderedQty')?.value;

            if (value > orderedQty) {
              this.toastr.error(
                `Shipping Quantity (${value}) cannot be greater than Ordered Quantity (${orderedQty})`,
                'Invalid Quantity'
              );

              row.get('shippingQuantity')?.setValue(orderedQty, { emitEvent: false });
            }
          });

          this.itemsForm.push(row);
        });

        this.cdr.detectChanges();
        this.stateChange.emit({ ready: true, isEdit: this.isEdit });
      },
      error: () => {
        this.spinner.hide();
        this.loading = false;
        this.stateChange.emit({ ready: true, isEdit: false });
        console.log("No existing shipment - Add mode");
      }
    });
  }

  save() {
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

    const itemsPayload = this.itemsForm.controls.map(ctrl => ({
      purchaseOrderLineId: ctrl.get('purchaseOrderLineId')?.value,
      deliveryDate: ctrl.get('deliveryDate')?.value
        ? new Date(ctrl.get('deliveryDate')?.value)
        : null,
      shippingQuantity: ctrl.get('shippingQuantity')?.value
    }));

    const shipmentDetailPayload = {
      shipToName: this.form.get('shipToName')?.value,
      country: this.form.get('country')?.value,
      city: this.form.get('city')?.value,
      region: this.form.get('region')?.value,
      shipToAddress: this.form.get('shipToAddress')?.value,
      shipToAddress2: this.form.get('shipToAddress2')?.value,
      postCode: this.form.get('postCode')?.value,
      shipmentDate: this.form.get('shipmentDate')?.value
        ? new Date(this.form.get('shipmentDate')?.value)
        : null,
      notes: this.form.get('notes')?.value,
      items: itemsPayload
    };

    if (this.isEdit && this.selectedShipmentId) {
      const updatePayload = {
        shipmentDetailId: this.selectedShipmentId,
        shipmentDetail: shipmentDetailPayload
      };
      this.loading = true;
      this.spinner.show();
      this.shipmentService.updateShipment(updatePayload).subscribe({
        next: () => {
          this.loading = true;
          this.spinner.hide();
          this.router.navigate([`/purchase-order/purchase-order-details/${this.poId}`], { skipLocationChange: true });
          this.loadShipmentDetails();
        }
      });
      return;
    }

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
    if (!this.selectedShipmentId) {
      this.toastr.warning('No shipment to delete.');
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: 'This will delete the shipment and clear all delivery dates for the PO lines!',
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
              shipmentDate: null,
              notes: ''
            });

            this.itemsForm.controls.forEach(ctrl => {
              ctrl.get('deliveryDate')?.setValue(null);
            });

            this.itemsForm.controls.forEach(ctrl => {
              ctrl.get('shippingQuantity')?.setValue(null);
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
}