import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoDetailsListComponent } from './po-details-list.component';

describe('PoDetailsListComponent', () => {
  let component: PoDetailsListComponent;
  let fixture: ComponentFixture<PoDetailsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PoDetailsListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PoDetailsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
