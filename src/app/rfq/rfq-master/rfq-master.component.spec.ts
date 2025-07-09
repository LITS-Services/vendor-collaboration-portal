import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RfqMasterComponent } from './rfq-master.component';

describe('RfqMasterComponent', () => {
  let component: RfqMasterComponent;
  let fixture: ComponentFixture<RfqMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RfqMasterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RfqMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
