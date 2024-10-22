import { Component, forwardRef } from '@angular/core';
import { AppModule } from '../app.module';
import { FormBuilder, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CopilotSurveryService } from '../copilot-survery.service';
import { provideHttpClient } from '@angular/common/http';

@Component({
  selector: 'app-copilot-survey',
  standalone: true,
  imports: [
    AppModule,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CopilotSurveyComponent),
      multi: true,
    }
  ],
  templateUrl: './copilot-survey.component.html',
  styleUrl: './copilot-survey.component.scss'
})
export class CopilotSurveyComponent {
  surveyForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private copilotSurveyService: CopilotSurveryService
  ) {
    this.surveyForm = this.fb.group({
      usedCopilot: [true],
      pctTimesaved: [30],
      timeUsedFor: ['writing code'],
      timeSaved: ['30 minutes'],
    });
  }

  onSubmit() {
    console.log(this.surveyForm.value);
    this.copilotSurveyService.createSurvey({
      id: 0,
      daytime: new Date(),
      userId: 1,
      ...this.surveyForm.value
    }).subscribe((res) => {
      console.log('Survey created successfully 🎉');
    });
  }
}
