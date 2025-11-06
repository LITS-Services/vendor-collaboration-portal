import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ShipmentService } from 'app/shared/services/shipment.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-shipment-details',
  templateUrl: './shipment-details.component.html',
  styleUrls: ['./shipment-details.component.scss']
})
export class ShipmentDetailsComponent implements OnInit {
@Input() poId: number;
  //poId!: number;
  form!: FormGroup;

  isEdit = false;
  shipmentId?: number;

  purchaseOrderNo?: string;
  vendorName?: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private shipmentService: ShipmentService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    // this.poId = Number(this.route.snapshot.paramMap.get('id'));
    console.log('PO ID:', this.poId);

    this.form = this.fb.group({
      country: [''],
      city: [''],
      shippingAddress: [''],
      shipmentDate: [null],
      deliveryDate: [null],
      notes: ['']
    });

    this.checkIfShipmentExists();
  }

  checkIfShipmentExists() {
    this.shipmentService.getShipmentDetailById(this.poId).subscribe({
      next: (res) => {
        if (res) {
          this.isEdit = true;
          const d = res;

          this.shipmentId = d.id;
          this.purchaseOrderNo = d.purchaseOrderNo;
          this.vendorName = d.vendorName;

          // Patch form values
          this.form.patchValue({
            country: d.country,
            city: d.city,
            shippingAddress: d.shippingAddress,
            shipmentDate: d.shipmentDate ? d.shipmentDate.split('T')[0] : null,
            deliveryDate: d.deliveryDate ? d.deliveryDate.split('T')[0] : null,
            notes: d.notes
          });
          this.cdr.detectChanges();
        }
      },
      error: () => console.log("No existing shipment - Add mode"),
    });
  }
  save() {
    if (this.form.invalid) {
      this.toastr.warning("Fill required fields.");
      return;
    }

    const payload = {
      purchaseOrderId: this.poId,
      shipmentDetail: {
        purchaseOrderId: this.poId,
        ...this.form.value
      }
    };

    // If editing call update API
    // if (this.isEdit && this.shipmentId) {
    //   this.shipmentService.updateShipment(this.shipmentId, payload).subscribe({
    //     next: () => {
    //       this.router.navigate([`/purchase-order/purchase-order-details/${this.poId}`]);
    //     }
    //   });
    //   return;
    // }

    this.shipmentService.createShipment(payload).subscribe({
      next: () => {
        this.router.navigate([`/purchase-order/purchase-order-details/${this.poId}`], { skipLocationChange: true });
      }
    });
  }

  goBack() {
    const id = this.route.snapshot.paramMap.get('id');
    this.router.navigate([`/purchase-order/purchase-order-details/${id}`], { skipLocationChange: true });
  }
}