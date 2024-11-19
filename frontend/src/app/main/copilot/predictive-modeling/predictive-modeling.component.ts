import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SettingsHttpService } from '../../../services/settings.service';

@Component({
  selector: 'app-predictive-modeling',
  standalone: true,
  imports: [],
  templateUrl: './predictive-modeling.component.html',
  styleUrl: './predictive-modeling.component.scss'
})
export class PredictiveModelingComponent implements OnInit {
  form: FormGroup;
  roomForImprovement: number = 0;
  targetedRoomForImprovement: number = 0;

  constructor(
    private fb: FormBuilder,
    private settingsService: SettingsHttpService
  ) {
    this.form = this.fb.group({
      developerTotal: ['', Validators.required],
      adopterCount: ['', Validators.required],
      perLicenseCost: ['', Validators.required],
      perDevCostPerYear: ['', Validators.required],
      perDevHoursPerYear: ['', Validators.required],
      percentofHoursCoding: ['', Validators.required],
      targetedNumberOfDevelopers: ['', Validators.required],
      targetedPercentOfTimeSaved: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.settingsService.getAllSettings().subscribe(settings => {
      this.form.patchValue({
        developerTotal: settings.developerCount,
        adopterCount: settings.adopterCount,
        perLicenseCost: settings.perLicenseCost,
        perDevCostPerYear: settings.devCostPerYear,
        perDevHoursPerYear: settings.hoursPerYear,
        percentofHoursCoding: settings.percentCoding
      });
    });

    this.form.valueChanges.subscribe(() => {
      this.calculateRoomForImprovement();
      this.calculateTargetedRoomForImprovement();
    });
  }

  calculateRoomForImprovement() {
    const { developerTotal, percentofHoursCoding, perDevHoursPerYear, perDevCostPerYear } = this.form.value;
    this.roomForImprovement = developerTotal * (percentofHoursCoding / 100) * perDevHoursPerYear * (perDevCostPerYear / perDevHoursPerYear);
  }

  calculateTargetedRoomForImprovement() {
    const { targetedNumberOfDevelopers, targetedPercentOfTimeSaved, percentofHoursCoding, perDevHoursPerYear, perDevCostPerYear } = this.form.value;
    this.targetedRoomForImprovement = targetedNumberOfDevelopers * (targetedPercentOfTimeSaved / 100) * (percentofHoursCoding / 100) * perDevHoursPerYear * (perDevCostPerYear / perDevHoursPerYear);
  }

  onSave() {
    const targetValues = {
      targetedRoomForImprovement: this.targetedRoomForImprovement,
      targetedNumberOfDevelopers: this.form.value.targetedNumberOfDevelopers,
      targetedPercentOfTimeSaved: this.form.value.targetedPercentOfTimeSaved
    };
    // Save targetValues to backend
  }
}
