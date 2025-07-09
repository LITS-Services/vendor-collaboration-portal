import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecievingDetailsListComponent } from './recieving-details-list.component';

describe('RecievingDetailsListComponent', () => {
  let component: RecievingDetailsListComponent;
  let fixture: ComponentFixture<RecievingDetailsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RecievingDetailsListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecievingDetailsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
