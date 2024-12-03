import { Component, forwardRef, OnInit } from '@angular/core';
import { AppModule } from '../../../../app.module';
import { FormBuilder, FormControl, FormGroup, NG_VALUE_ACCESSOR, Validators } from '@angular/forms';
import { CopilotSurveyService, Survey } from '../../../../services/api/copilot-survey.service';
import { ActivatedRoute, Params, Router } from '@angular/router';

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
  surveys: Survey[] = []; // Array to hold survey objects

  constructor(
    private fb: FormBuilder,
    private copilotSurveyService: CopilotSurveyService,
    private route: ActivatedRoute,
    private router: Router
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
    // Load historical reasons from the service
    this.copilotSurveyService.getRecentSurveysWithGoodReasons(20).subscribe((surveys: Survey[]) => {
      this.surveys = surveys;
      this.historicalReasons = surveys.map(survey => survey.reason);

      // Debugging: Confirm the historical reasons are loaded
      console.log('Historical Reasons:', this.historicalReasons);
      if (this.historicalReasons.length > 0) {
        console.log('First Reason:', this.historicalReasons[0]);
      }
      if (this.historicalReasons.length < 1) {
        this.historicalReasons =[
          'I chose 5% because Copilot enabled me to tidy up loose ends because I got added to pilot after I\'d already completed most of this task.',
          'I chose 10% because Copilot enabled me to make a very small change.',
          'I chose 10% because Copilot enabled me to make small familiar changes for which Copilot\'s main use was double-checking my work.',
          'I chose 10% because Copilot enabled me to connect files and models together, which Copilot isn\'t savvy on doing. It was helpful to figure out why a test wasn\'t working though.',
          'I chose 0% because this is my first time trying co-pilot so I expect this % to raise for future PR\'s.',
          'I chose 20% because Copilot enabled me to save time typing similar lines of code or docstrings.',
          'I chose 20% because Copilot chat asking how to use specific command. Gives faster accurate answer without having to dig in the CLI documentation.',
          'I chose 30% because Copilot helped with unit tests and writing boilerplate.',
          'I chose 30% because Copilot enabled me to save time writing comments and test-case boilerplate.',
          'I chose 30% because Copilot automatically adapted the code from previous lines so I barely wrote anything by hand.',
          'I chose 25% because I created a new nestJS service to provide Github App authentication to other services. I was adapting logic from another Shift-left service. My thinking behind the 21%-30% savings is that Copilot autocompleted several of the tie-ins to other parts of the application and felt to provide about that much productivity increase.',
          'I chose 20% because it was good when I had writer\'s block to suggest the next line, or what I might do. It was also very convenient to quickly search for an answer to a small question I had.',
          'I chose 20% because less typing required, prefilled code blocks for me.',
          'I chose 25% because for about half the work in this PR, I did the first quarter of it, told GH Copilot "see what I did at lines N through N in #file? Do that for...." and let it do the other one-quarter of the work for me.',
          'I chose 30% because Copilot was awesome for this. I used it for a combination of starting code blocks with comments and it made the function, and I used the inline chat. Compared to both it typing out stuff I knew how to do, and it finding solutions to stuff that would have taken time on the web, it felt like a really substantial time saver.',
          'I chose 30% because raw time spent coding and generating tests. Copilot was able to suggest more than 90% of the code I would have had to manually create.',
          'I chose 40% because Copilot reduced the amount of thought required.',
          'I chose 50% because it takes most of the time to write test cases for functionality. Copilot did it automatically for simple function with one input.',
          'I chose 45% because when scaffolding React components, there is much boilerplate that can be autofilled with Copilot. For example, in many cases, a small React component return value may be 10 lines. Copilot is often smart enough to autocomplete these components for me. The greatest gains are seen when scaffolding a brand new codebase. Gains are smaller if making small code changes or performing analysis.',
          'I chose 40% because Copilot assisted with formatting large sets of data for a test that normally would have taken much longer to do manually.',
          'I chose 50% because I was able to tab out the entire process.'
        ];
      }

    });  
   
  }

  addKudos(event: Event, index: number) {
    event.preventDefault();
    const survey = this.surveys[index];
    if (survey) {
      if (!survey.kudos) {
        survey.kudos = 0;
      }
      survey.kudos += 1;
      this.copilotSurveyService.updateSurvey(survey).subscribe(() => {
        console.log(`Kudos added to survey with id ${survey.id}. Total kudos: ${survey.kudos}`);
      });
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
    const survey = {
      id: this.id,
      userId: this.params['author'],
      org,
      repo,
      prNumber,
      usedCopilot: this.surveyForm.value.usedCopilot,
      percentTimeSaved: Number(this.surveyForm.value.percentTimeSaved),
      reason: this.surveyForm.value.reason,
      timeUsedFor: this.surveyForm.value.timeUsedFor
    };
    if (!this.id) {
      this.copilotSurveyService.createSurvey(survey).subscribe(() => {
        this.router.navigate(['/copilot/surveys']);
      });
    } else {
      this.copilotSurveyService.createSurveyGitHub(survey).subscribe(() => {
        const redirectUrl = this.params['url'];
        if (redirectUrl && redirectUrl.startsWith('https://github.com/')) {
          window.location.href = redirectUrl;
        } else {
          console.error('Unauthorized URL:', redirectUrl);
        }
      });
    }
  }

  formatPercent(value: number): string {
    return `${value}%`
  }
}
