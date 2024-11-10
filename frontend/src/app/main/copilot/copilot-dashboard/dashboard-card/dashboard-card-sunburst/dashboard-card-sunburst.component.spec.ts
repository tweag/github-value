import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardCardSunburstComponent } from './dashboard-card-sunburst.component';

describe('DashboardCardSunburstComponent', () => {
  let component: DashboardCardSunburstComponent;
  let fixture: ComponentFixture<DashboardCardSunburstComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardCardSunburstComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardCardSunburstComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
