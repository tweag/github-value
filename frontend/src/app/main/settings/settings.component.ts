import { Component, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MaterialModule } from '../../material.module';
import { AppModule } from '../../app.module';
import { AbstractControl, FormControl, FormGroup, FormGroupDirective, NgForm, ValidationErrors, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { SettingsHttpService } from '../../services/api/settings.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ThemeService } from '../../services/theme.service';
import { Endpoints } from '@octokit/types';
import cronstrue from 'cronstrue';
import { InstallationsService } from '../../services/api/installations.service';


export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    MaterialModule,
    AppModule,
    CommonModule,
    MatCheckboxModule
  ],
  providers: [DecimalPipe],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})

export class SettingsComponent implements OnInit {
  // Form controls are initialized with default values
  form = new FormGroup({
    developerCount: new FormControl(0, [
      Validators.min(0),
      Validators.max(100000)
    ]),
    devCostPerYear: new FormControl(0, [
      Validators.min(30000),
      Validators.max(500000)
    ]),
    hoursPerYear: new FormControl(0, [
      Validators.min(1000),
      Validators.max(3000)
    ]),
    percentCoding: new FormControl(0, [
      Validators.min(0),
      Validators.max(100)
    ]),
    percentTimeSaved: new FormControl(0, [
      Validators.min(0),
      Validators.max(100)
    ]),
    metricsCronExpression: new FormControl('', [
      (control: AbstractControl): ValidationErrors | null => {
        try {
          this.cronString = cronstrue.toString(control.value, {
            throwExceptionOnParseError: true,
            verbose: true
          });
          if (!this.cronString) throw new Error('Invalid cron expression');
        } catch (error) {
          return { invalidCron: { value: error } };
        }
        return null
      },
    ]),
    baseUrl: new FormControl('', [
      Validators.pattern(/^(https?:\/\/)[^\s/$.?#].[^\s]*$/)
    ]),
    webhookProxyUrl: new FormControl('', [
      Validators.pattern(/^(https?:\/\/)[^\s/$.?#].[^\s]*$/)
    ]),
    webhookSecret: new FormControl('', [])
  });
  cronString = '';
  installs?: Endpoints["GET /app/installations"]["response"]["data"];

  constructor(
    private settingsService: SettingsHttpService,
    private router: Router,
    public themeService: ThemeService,
    public installationsService: InstallationsService,
    private decimalPipe: DecimalPipe
  ) {}


  ngOnInit() {
    // Settings are loaded from API and formatted with thousand separators
    this.settingsService.getAllSettings().subscribe((settings) => {
      this.form.setValue({
        metricsCronExpression: settings.metricsCronExpression || '',
        baseUrl: settings.baseUrl || '',
        webhookProxyUrl: settings.webhookProxyUrl || '',
        webhookSecret: settings.webhookSecret || '',
        devCostPerYear: settings.devCostPerYear || 0,
        developerCount: settings.developerCount || 0,
        hoursPerYear: settings.hoursPerYear || 0,
        percentCoding: settings.percentCoding || 0,
        percentTimeSaved: settings.percentTimeSaved || 0
      });

      // Format the displayed values after setting them
      Object.keys(this.form.controls).forEach(key => {
        const control = this.form.get(key);
        if (control && typeof control.value === 'number') {
          const input = document.querySelector(`input[formControlName="${key}"]`) as HTMLInputElement;
          if (input) {
            input.value = this.convertMetricStateToString(control.value);
            
          }
        }
      });
    });
  }

  onSubmit() {
    this.form.markAllAsTouched();
    
    const settings = {
      metricsCronExpression: this.form.controls.metricsCronExpression.value,
      baseUrl: this.form.controls.baseUrl.value,
      webhookProxyUrl: this.form.controls.webhookProxyUrl.value,
      webhookSecret: this.form.controls.webhookSecret.value,
      devCostPerYear: this.convertStringToMetricState(this.form.controls.devCostPerYear.value?.toString() || ' '),
      developerCount: this.convertStringToMetricState(this.form.controls.developerCount.value?.toString() || ' '),
      hoursPerYear: this.convertStringToMetricState(this.form.controls.hoursPerYear.value?.toString() || ' '),
      percentCoding: this.convertStringToMetricState(this.form.controls.percentCoding.value?.toString() || ' '),
      percentTimeSaved: this.convertStringToMetricState(this.form.controls.percentTimeSaved.value?.toString() || ' ')
    };
    
    console.log('Saving settings', settings);
  
    // Now you can store the settings object in the database
    this.settingsService.createSettings(settings).subscribe(() => {
      this.router.navigate(['/']);
    });
  }

  onFieldBlur(event: FocusEvent, fieldName: string): void {
    const input = event.target as HTMLInputElement;
    const rawValue = input.value.replace(/[^0-9.-]/g, '');
    const numValue = parseInt(rawValue, 10) || 0;

    // Apply validation ranges
    let formattedValue = numValue;
    switch(fieldName) {
      case 'devCostPerYear':
        formattedValue = this.clampValue(numValue, 30000, 500000);
        input.value = this.convertMetricStateToString(formattedValue);
        break;
      case 'developerCount':
        formattedValue = this.clampValue(numValue, 0, 200000);
        input.value = this.convertMetricStateToString(formattedValue);
        break;
      case 'hoursPerYear':
        formattedValue = this.clampValue(numValue, 1000, 3000);
        input.value = this.convertMetricStateToString(formattedValue);
        break;
      case 'percentCoding':
        formattedValue = this.clampValue(numValue, 0, 100);
        input.value = formattedValue.toString(); // No formatting for percentages
        break;
      case 'percentTimeSaved':
        formattedValue = this.clampValue(numValue, 0, 100);
        input.value = formattedValue.toString(); // No formatting for percentages
        break;
    }

    // Update the form control with raw number
    this.form.get(fieldName)?.setValue(input.value);
  }

  private clampValue(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  convertMetricStateToString(metricValue: number): string {
    try {
      return this.decimalPipe?.transform(metricValue, '1.0-0') || '0';
    } catch (error) {
      console.error('Error in convertMetricStateToString:', error);
      return '0';
    }
  }

  convertStringToMetricState(metricString: string): number {
    try {
      return parseFloat(metricString.replace(/[^0-9.-]/g, ''));
    } catch (error) {
      console.error('Error in convertStringToMetricState:', error);
      return 0;
    }
  }
}