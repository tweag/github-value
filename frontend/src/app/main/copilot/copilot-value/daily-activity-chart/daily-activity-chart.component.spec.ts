import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DailyActivityChartComponent } from './daily-activity-chart.component';

describe('AdoptionChartComponent', () => {
  let component: DailyActivityChartComponent;
  let fixture: ComponentFixture<DailyActivityChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DailyActivityChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DailyActivityChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
