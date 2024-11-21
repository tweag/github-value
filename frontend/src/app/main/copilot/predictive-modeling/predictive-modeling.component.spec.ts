import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PredictiveModelingComponent } from './predictive-modeling.component';

describe('PredictiveModelingComponent', () => {
  let component: PredictiveModelingComponent;
  let fixture: ComponentFixture<PredictiveModelingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PredictiveModelingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PredictiveModelingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
