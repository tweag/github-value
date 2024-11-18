import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewCopilotSurveyComponent } from './new-copilot-survey.component';

describe('CopilotSurveyComponent', () => {
  let component: NewCopilotSurveyComponent;
  let fixture: ComponentFixture<NewCopilotSurveyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewCopilotSurveyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewCopilotSurveyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
