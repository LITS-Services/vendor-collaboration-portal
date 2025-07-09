import { ChangeDetectionStrategy, Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbAccordion, NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ColumnMode, DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import { ChatService } from 'app/chat/chat.service';
import { DatatableData } from 'app/data-tables/data/datatables.data';

@Component({
  selector: 'app-new-rfq',
  templateUrl: './new-rfq.component.html',
   changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./new-rfq.component.scss'],
    providers: [ChatService]
})
export class NewRfqComponent implements OnInit {
  
  numberOfAttachments = 0;
newPurchaseRequestData = [
  {
    type: 'Inventory',
    itemCode: 'ITM001',
    description: '3 Laptops with High End specs',
    amount: '8000',
    vendorName: 'Vendor A',
    remarks: 'Urgent Order'
  },
  {
    type: 'Non-Inventory',
    itemCode: 'ITM002',
    description: '3 Cabinet AC',
    amount: '8000',
    vendorName: 'Vendor B',
    remarks: 'Routine Purchase'
  },
  {
    type: 'Inventory',
    itemCode: 'ITM003',
    description: '200 Thermal Printers',
    amount: '8000',
    vendorName: 'Vendor C',
    remarks: 'Leave Supplies'
  },
  {
    type: 'Non-Inventory',
    itemCode: 'ITM004',
    description: 'Miscellaneous Stationary Items',
    amount: '8000',
    vendorName: 'Vendor D',
    remarks: 'Order for Clinic'
  },
  {
    type: 'Inventory',
    itemCode: 'ITM005',
    description: '3 vans',
    amount: '8000',
    vendorName: 'Vendor E',
    remarks: 'Miscellaneous Items'
  }
];

public chkBoxSelected = [];
loading = false;
public rows = DatatableData;
columns = [
];
itemType: string = 'Inventory'; // Default selection
@Input() data: any; // Row data passed to the modal
  @Input() status: string;
public SelectionType = SelectionType;
  public ColumnMode = ColumnMode;
  newPurchaseRequestForm: FormGroup;
  @ViewChild('accordion') accordion: NgbAccordion;
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @ViewChild('tableRowDetails') tableRowDetails: any;
  @ViewChild('tableResponsive') tableResponsive: any;
  constructor( private router: Router,  public activeModal: NgbActiveModal,
    private modalService: NgbModal,) { }

  ngOnInit(): void {
  }
  homePage() {
    this.router.navigate(['/rfq']);
  }
  submitForm() {
  

  }
  deleteRow(rowIndex: number): void {
    this.newPurchaseRequestData.splice(rowIndex, 1);
  }
  closeDialog() {
    this.activeModal.close(false);
  }
  updateValue(event: any, prop: string, rowIndex: number) {
    const newValue = event.target.value || ''; // Capture the new value or empty string if cleared
    const row = this.rows[rowIndex]; // Get the corresponding row
  
    // Update the property value in the row
    row[prop] = newValue;
  
    // Check if the property being updated is 'ExpiryDate' and call updateExpiryDate
    if (prop === 'ExpiryDate') {
      // this.updateExpiryDate(row, newValue); // Trigger the API call to update expiry date
    }
  
    // Disable editing mode for this row's expiry field
    // this.editing[rowIndex + '-expiry'] = false;
  }

}
