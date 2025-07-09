import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrRequestListComponent } from './pr-request-list.component';

describe('PrRequestListComponent', () => {
  let component: PrRequestListComponent;
  let fixture: ComponentFixture<PrRequestListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrRequestListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrRequestListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
