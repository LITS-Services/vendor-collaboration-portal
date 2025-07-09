import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewTenderComponent } from './new-tender.component';

describe('NewTenderComponent', () => {
  let component: NewTenderComponent;
  let fixture: ComponentFixture<NewTenderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewTenderComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewTenderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
