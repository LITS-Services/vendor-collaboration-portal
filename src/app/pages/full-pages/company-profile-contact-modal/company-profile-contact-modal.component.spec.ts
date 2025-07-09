import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyProfileContactModalComponent } from './company-profile-contact-modal.component';

describe('CompanyProfileContactModalComponent', () => {
  let component: CompanyProfileContactModalComponent;
  let fixture: ComponentFixture<CompanyProfileContactModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CompanyProfileContactModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompanyProfileContactModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
