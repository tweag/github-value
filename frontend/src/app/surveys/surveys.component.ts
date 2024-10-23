import { Component } from '@angular/core';
import { MaterialModule } from '../material.module';
import { AppModule } from '../app.module';
import { CopilotSurveyService as CopilotSurveyService } from '../copilot-survery.service';
import { Survey } from '../models/survey';

@Component({
  selector: 'app-surveys',
  standalone: true,
  imports: [
    AppModule,
    MaterialModule
  ],
  templateUrl: './surveys.component.html',
  styleUrl: './surveys.component.scss'
})
export class SurveysComponent {
  surveys: Survey[] = [];

  constructor(
    private copilotSurveyService: CopilotSurveyService
  ) { }

  ngOnInit() {
    this.copilotSurveyService.getAllSurveys().subscribe((surveys) => {
      console.log(surveys);
      this.surveys = surveys;
    });
  }
}
