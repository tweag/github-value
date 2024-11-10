import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdoptionChartComponent } from './adoption-chart.component';

describe('AdoptionChartComponent', () => {
  let component: AdoptionChartComponent;
  let fixture: ComponentFixture<AdoptionChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdoptionChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdoptionChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
