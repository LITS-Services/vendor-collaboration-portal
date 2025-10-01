import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RfqBidAttachmentComponent } from './rfq-bid-attachment.component';

describe('RfqBidAttachmentComponent', () => {
  let component: RfqBidAttachmentComponent;
  let fixture: ComponentFixture<RfqBidAttachmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RfqBidAttachmentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RfqBidAttachmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
