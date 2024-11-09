import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeSavedChartComponent } from './time-saved-chart.component';

describe('AdoptionChartComponent', () => {
  let component: TimeSavedChartComponent;
  let fixture: ComponentFixture<TimeSavedChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimeSavedChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimeSavedChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
