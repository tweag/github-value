import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardCardValueComponent } from './dashboard-card-value.component';

describe('DashboardCardComponent', () => {
  let component: DashboardCardValueComponent;
  let fixture: ComponentFixture<DashboardCardValueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardCardValueComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardCardValueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
