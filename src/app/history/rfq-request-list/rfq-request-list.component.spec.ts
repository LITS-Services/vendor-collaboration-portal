import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RfqRequestListComponent } from './rfq-request-list.component';

describe('RfqRequestListComponent', () => {
  let component: RfqRequestListComponent;
  let fixture: ComponentFixture<RfqRequestListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RfqRequestListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RfqRequestListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
