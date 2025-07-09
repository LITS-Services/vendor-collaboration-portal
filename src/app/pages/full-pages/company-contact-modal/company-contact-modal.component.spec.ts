import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyContactModalComponent } from './company-contact-modal.component';

describe('CompanyContactModalComponent', () => {
  let component: CompanyContactModalComponent;
  let fixture: ComponentFixture<CompanyContactModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CompanyContactModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompanyContactModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
