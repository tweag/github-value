import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CopilotSurveysComponent } from './surveys.component';

describe('SurveysComponent', () => {
  let component: CopilotSurveysComponent;
  let fixture: ComponentFixture<CopilotSurveysComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CopilotSurveysComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CopilotSurveysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
