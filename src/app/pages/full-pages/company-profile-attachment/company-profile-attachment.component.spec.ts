import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyProfileAttachmentComponent } from './company-profile-attachment.component';

describe('CompanyProfileAttachmentComponent', () => {
  let component: CompanyProfileAttachmentComponent;
  let fixture: ComponentFixture<CompanyProfileAttachmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CompanyProfileAttachmentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompanyProfileAttachmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
