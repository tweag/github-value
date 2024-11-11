import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardCardDrilldownBarChartComponent } from './dashboard-card-drilldown-bar-chart.component';

describe('DashboardCardDrilldownBarChartComponent', () => {
  let component: DashboardCardDrilldownBarChartComponent;
  let fixture: ComponentFixture<DashboardCardDrilldownBarChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardCardDrilldownBarChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardCardDrilldownBarChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
