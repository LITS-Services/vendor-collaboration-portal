import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyRegisterationComponent } from './company-registeration.component';

describe('CompanyRegisterationComponent', () => {
  let component: CompanyRegisterationComponent;
  let fixture: ComponentFixture<CompanyRegisterationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CompanyRegisterationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompanyRegisterationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
