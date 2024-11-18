import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CopilotSurveyService, Survey } from '../../../../services/copilot-survey.service';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-copilot-survey',
  standalone: true,
  templateUrl: './copilot-survey.component.html',
  styleUrls: ['./copilot-survey.component.scss'],
  imports: [
    MatCardModule,
    CommonModule
  ]
})
export class CopilotSurveyComponent implements OnInit {
  survey?: Survey;

  constructor(
    private route: ActivatedRoute,
    private copilotSurveyService: CopilotSurveyService
  ) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.copilotSurveyService.getSurveyById(+id).subscribe((survey) => {
        this.survey = survey;
      });
    }
  }
}
