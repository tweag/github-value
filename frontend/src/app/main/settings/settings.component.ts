import { Component, OnInit } from '@angular/core';
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
import { SharedModule } from '../settings/shared.module'; // Adjust the path as necessary
import { ThousandSeparatorPipe } from '../settings/thousand-separator.pipe'; // Adjust the path as necessary


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
    MatCheckboxModule,
    SharedModule
  ],
  providers: [ThousandSeparatorPipe],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit {
  form = new FormGroup({
    developerCount: new FormControl('1,000'),
    devCostPerYear: new FormControl('100,000'),
    hoursPerYear: new FormControl("2,000"),
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
    public installationsService: InstallationsService,
    public themeService: ThemeService,
    public sharedModule: SharedModule,
    private thousandSeparatorPipe: ThousandSeparatorPipe
  ) { }

  ngOnInit() {
    this.settingsService.getAllSettings().subscribe((settings) => {
      this.form.setValue({
        metricsCronExpression: settings.metricsCronExpression || '',
        baseUrl: settings.baseUrl || '',
        webhookProxyUrl: settings.webhookProxyUrl || '',
        webhookSecret: settings.webhookSecret || '',
        devCostPerYear: this.thousandSeparatorPipe.transform(settings.devCostPerYear ?? 0 ),
        developerCount: this.thousandSeparatorPipe.transform(settings.developerCount ?? 0),
        hoursPerYear: this.thousandSeparatorPipe.transform(settings.hoursPerYear ?? 0),
        percentCoding: settings.percentCoding || 0,
        percentTimeSaved: settings.percentTimeSaved || 0
      });
    });
  }

  onSubmit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }
    
    const settings = {
      metricsCronExpression: this.form.controls.metricsCronExpression.value,
      baseUrl: this.form.controls.baseUrl.value,
      webhookProxyUrl: this.form.controls.webhookProxyUrl.value,
      webhookSecret: this.form.controls.webhookSecret.value,
      devCostPerYear: parseInt((this.form.controls.devCostPerYear.value ?? '0').replace(/,/g, ''), 10) || 0,
      developerCount: parseInt((this.form.controls.developerCount.value ?? '0').replace(/,/g, ''), 10) || 0,
      hoursPerYear: parseInt((this.form.controls.hoursPerYear.value ?? '0').replace(/,/g, ''), 10) || 0,
      percentCoding: this.form.controls.percentCoding.value,
      percentTimeSaved: this.form.controls.percentTimeSaved.value
    };
    console.log('Saving settings', settings)
  
    // Now you can store the settings object in the database
    this.settingsService.createSettings(settings).subscribe(() => {
      this.router.navigate(['/']);
    });
  }

  onDevCostPerYearInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/,/g, ''); // Remove existing commas
    const numericValue = value ? parseInt(value, 10) : 0;
    const formattedValue = this.thousandSeparatorPipe.transform(numericValue);
    this.form.controls.devCostPerYear.setValue(formattedValue);
    input.value = formattedValue; // Update the input value with the formatted value
  }

  onDeveloperCountInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/,/g, ''); // Remove existing commas
    const numericValue = value ? parseInt(value, 10) : 0;
    const formattedValue = this.thousandSeparatorPipe.transform(numericValue);
    this.form.controls.developerCount.setValue(formattedValue);
    input.value = formattedValue; // Update the input value with the formatted value
  }

  onHoursPerYearInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/,/g, ''); // Remove existing commas
    const numericValue = value ? parseInt(value, 10) : 0;
    const formattedValue = this.thousandSeparatorPipe.transform(numericValue);
    this.form.controls.hoursPerYear.setValue(formattedValue);
    input.value = formattedValue; // Update the input value with the formatted value
  }
}
