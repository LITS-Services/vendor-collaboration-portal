import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuotationBidModalComponent } from './quotation-bid-modal.component';

describe('QuotationBidModalComponent', () => {
  let component: QuotationBidModalComponent;
  let fixture: ComponentFixture<QuotationBidModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuotationBidModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuotationBidModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
