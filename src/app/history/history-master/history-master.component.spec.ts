import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoryMasterComponent } from './history-master.component';

describe('HistoryMasterComponent', () => {
  let component: HistoryMasterComponent;
  let fixture: ComponentFixture<HistoryMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HistoryMasterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistoryMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
