import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceDetailsListComponent } from './invoice-details-list.component';

describe('InvoiceDetailsListComponent', () => {
  let component: InvoiceDetailsListComponent;
  let fixture: ComponentFixture<InvoiceDetailsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvoiceDetailsListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvoiceDetailsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
