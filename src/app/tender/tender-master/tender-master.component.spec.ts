import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TenderMasterComponent } from './tender-master.component';

describe('TenderMasterComponent', () => {
  let component: TenderMasterComponent;
  let fixture: ComponentFixture<TenderMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TenderMasterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TenderMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
