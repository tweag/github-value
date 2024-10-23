import { Component, forwardRef, OnInit } from '@angular/core';
import { AppModule } from '../../app.module';
import { FormBuilder, FormControl, FormGroup, NG_VALUE_ACCESSOR, Validators } from '@angular/forms';
import { CopilotSurveyService } from '../../copilot-survery.service';
import { provideHttpClient } from '@angular/common/http';
import { ActivatedRoute, Params } from '@angular/router';

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
export class CopilotSurveyComponent implements OnInit {
  surveyForm: FormGroup;
  params: Params = {};

  constructor(
    private fb: FormBuilder,
    private copilotSurveyService: CopilotSurveyService,
    private route: ActivatedRoute
  ) {
    this.surveyForm = this.fb.group({
      usedCopilot: new FormControl(true, Validators.required),
      percentTimeSaved: new FormControl(30, Validators.required),
      reason: new FormControl(''),
      timeUsedFor: new FormControl('', Validators.required)
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => this.params = params);
  }

  parseGitHubPRUrl(url: string) {
    const urlObj = new URL(url);
    const pathSegments = urlObj.pathname.split('/');
  
    const owner = pathSegments[1]; // Extract the owner
    const repo = pathSegments[2]; // Extract the repo
    const prNumber = Number(pathSegments[4]); // Extract the PR number
  
    return { owner, repo, prNumber };
  }

  onSubmit() {
    console.log(this.surveyForm.value);
    const { owner, repo, prNumber } = this.parseGitHubPRUrl(this.params['url']);
    this.copilotSurveyService.createSurvey({
      dateTime: new Date(),
      userId: this.params['author'],
      owner: owner,
      repo: repo,
      prNumber: prNumber,
      usedCopilot: this.surveyForm.value.usedCopilot,
      percentTimeSaved: Number(this.surveyForm.value.percentTimeSaved),
      reason: this.surveyForm.value.reason,
      timeUsedFor: this.surveyForm.value.timeUsedFor
    }).subscribe((res) => {
      if (this.params['url']) {
        window.location.href = this.params['url'];
      }
    });
  }

  formatPercent(value: number): string {
    return `${value}%`
  }
}
