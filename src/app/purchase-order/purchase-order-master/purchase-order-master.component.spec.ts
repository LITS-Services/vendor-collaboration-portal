import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseOrderMasterComponent } from './purchase-order-master.component';

describe('PurchaseOrderMasterComponent', () => {
  let component: PurchaseOrderMasterComponent;
  let fixture: ComponentFixture<PurchaseOrderMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PurchaseOrderMasterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchaseOrderMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
