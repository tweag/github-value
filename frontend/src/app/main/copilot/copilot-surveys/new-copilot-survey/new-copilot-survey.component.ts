import { Component, forwardRef, OnInit } from '@angular/core';
import { AppModule } from '../../../../app.module';
import { FormBuilder, FormControl, FormGroup, NG_VALUE_ACCESSOR, Validators } from '@angular/forms';
import { CopilotSurveyService } from '../../../../services/copilot-survey.service';
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
      useExisting: forwardRef(() => NewCopilotSurveyComponent),
      multi: true,
    }
  ],
  templateUrl: './new-copilot-survey.component.html',
  styleUrl: './new-copilot-survey.component.scss'
})
export class NewCopilotSurveyComponent implements OnInit {
  surveyForm: FormGroup;
  params: Params = {};
  defaultPercentTimeSaved = 25;
  id: number;

  initializationReason = 'I chose ' + this.defaultPercentTimeSaved + '% because Copilot enabled me to...';
  didNotUsedCopilotReason = 'I did not use Copilot...';
  usedCopilotWithPercentTimeSaved = (percent: number) => `I chose ${percent}% because Copilot enabled me to...`;
  usedCopilotWithPercentTimeSavedZero = 'I chose 0% because Copilot did not help me...';

  constructor(
    private fb: FormBuilder,
    private copilotSurveyService: CopilotSurveyService,
    private route: ActivatedRoute
  ) {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.id = isNaN(id) ? 0 : id
    this.surveyForm = this.fb.group({
      usedCopilot: new FormControl(true, Validators.required),
      percentTimeSaved: new FormControl(this.defaultPercentTimeSaved, Validators.required),
      reason: new FormControl(''),
      timeUsedFor: new FormControl('', Validators.required)
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => this.params = params);

    // Page Initialization
    this.setReasonDefault();

    this.surveyForm.get('usedCopilot')?.valueChanges.subscribe((value) => {
      if (!value) {
        this.surveyForm.get('percentTimeSaved')?.setValue(0);
        this.setReasonDefault();
      } else {
        this.surveyForm.get('percentTimeSaved')?.setValue(this.defaultPercentTimeSaved);
        this.setReasonDefault();
      }
    });

    this.surveyForm.get('percentTimeSaved')?.valueChanges.subscribe((value) => {
      if (!this.surveyForm.get('reason')?.dirty) {
        this.setReasonDefault();
      } else {
        this.promptUserForConfirmation();
      }
    });
  }

  setReasonDefault() {
    const reasonControl = this.surveyForm.get('reason');
    if (reasonControl && !reasonControl.dirty) {
      const percentTimeSaved = this.surveyForm.get('percentTimeSaved')?.value;
      const usedCopilot = this.surveyForm.get('usedCopilot')?.value;
      reasonControl.setValue(
        usedCopilot
          ? (percentTimeSaved === 0 ? this.usedCopilotWithPercentTimeSavedZero : this.usedCopilotWithPercentTimeSaved(percentTimeSaved))
          : this.didNotUsedCopilotReason
      );
    }
  }

  onReasonFocus() {
    const reasonControl = this.surveyForm.get('reason');
    if (reasonControl && !reasonControl.value) {
      this.setReasonDefault();
    }
  }

  promptUserForConfirmation() {
    // Implement the logic to prompt the user with a warning
    alert("Confirm that reason and percentTimeSaved are correct.");
  }

  parseGitHubPRUrl(url: string) {
    let urlObj;
    try {
      urlObj = new URL(url);
    } catch {
      return { owner: '', repo: '', prNumber: NaN };
    }
    const pathSegments = urlObj.pathname.split('/');
  
    const owner = pathSegments[1];    const repo = pathSegments[2];    const prNumber = Number(pathSegments[4]);  
    return { owner, repo, prNumber };
  }

  onSubmit() {
    const { owner, repo, prNumber } = this.parseGitHubPRUrl(this.params['url']);
    this.copilotSurveyService.createSurvey({
      id: this.id,
      userId: this.params['author'],
      owner: owner,
      repo: repo,
      prNumber: prNumber,
      usedCopilot: this.surveyForm.value.usedCopilot,
      percentTimeSaved: Number(this.surveyForm.value.percentTimeSaved),
      reason: this.surveyForm.value.reason,
      timeUsedFor: this.surveyForm.value.timeUsedFor
    }).subscribe(() => {
      const redirectUrl = this.params['url'];
      if (redirectUrl && redirectUrl.startsWith('https://github.com/')) {
        window.location.href = redirectUrl;
      } else {
        console.error('Unauthorized URL:', redirectUrl);
      }
    });
  }

  formatPercent(value: number): string {
    return `${value}%`
  }
}
