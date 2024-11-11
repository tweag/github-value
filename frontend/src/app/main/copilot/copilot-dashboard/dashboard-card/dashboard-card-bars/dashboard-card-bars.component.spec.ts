import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardCardBarsComponent } from './dashboard-card-bars.component';

describe('DashboardBarsCardComponent', () => {
  let component: DashboardCardBarsComponent;
  let fixture: ComponentFixture<DashboardCardBarsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardCardBarsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardCardBarsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
