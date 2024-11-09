import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardBarsCardComponent } from './dashboard-bars-card.component';

describe('DashboardBarsCardComponent', () => {
  let component: DashboardBarsCardComponent;
  let fixture: ComponentFixture<DashboardBarsCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardBarsCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardBarsCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
