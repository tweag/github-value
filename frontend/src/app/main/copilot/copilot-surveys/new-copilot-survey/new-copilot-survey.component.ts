import { Component, forwardRef, OnInit } from '@angular/core';
import { AppModule } from '../../../../app.module';
import { FormBuilder, FormControl, FormGroup, NG_VALUE_ACCESSOR, Validators } from '@angular/forms';
import { CopilotSurveyService } from '../../../../services/api/copilot-survey.service';
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

  formColumnWidth = 70; // Percentage width for the form column
  historyColumnWidth = 30; // Percentage width for the history column
  historicalReasons: string[] = []; // Array to hold historical reasons

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
    this.loadHistoricalReasons();

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

    // Debugging: Confirm the reason list is not empty
    console.log('Historical Reasons:', this.historicalReasons);

    // Duplicate the content dynamically
    this.duplicateContent();
  }

  duplicateContent() {
    const content = document.querySelector('.scrollable-card-content');
    if (content) {
      const clone = content.cloneNode(true);
      content.appendChild(clone);
    }
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

  loadHistoricalReasons() {
    // Load historical reasons from the service or any other source
    this.historicalReasons = [
      'I chose 20% because Copilot helped me write boilerplate code.',
      'I chose 50% because Copilot enabled me to focus on complex logic.',
      'I chose 0% because Copilot did not help me in this PR.',
      'I chose 30% because Copilot helped me with repetitive tasks.',
      'I chose 40% because Copilot improved my coding efficiency.',
      'I chose 60% because Copilot reduced my development time.',
      'I chose 70% because Copilot provided useful code suggestions.',
      'I chose 80% because Copilot helped me with complex logic.',
      'I chose 90% because Copilot made my coding faster.',
      'I chose 100% because Copilot was extremely helpful.'
      // Add more historical reasons as needed
    ];

    // Debugging: Confirm the scrolling content is not empty
    if (this.historicalReasons.length > 0) {
      console.log('Scrolling content is not empty');
    } else {
      console.log('Scrolling content is empty');
    }
  }

  parseGitHubPRUrl(url: string) {
    let urlObj;
    try {
      urlObj = new URL(url);
    } catch {
      return { org: '', repo: '', prNumber: NaN };
    }
    const pathSegments = urlObj.pathname.split('/');

    const org = pathSegments[1];
    const repo = pathSegments[2];
    const prNumber = Number(pathSegments[4]);
    return { org, repo, prNumber };
  }

  onSubmit() {
    const { org, repo, prNumber } = this.parseGitHubPRUrl(this.params['url']);
    this.copilotSurveyService.createSurvey({
      id: this.id,
      userId: this.params['author'],
      org,
      repo,
      prNumber,
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
