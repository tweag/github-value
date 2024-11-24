import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { PredictiveModelingService } from '../../../services/api/predictive-modeling.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AppModule } from '../../../app.module';
import { CommonModule } from '@angular/common';
import { SettingsHttpService } from '../../../services/api/settings.service';

@Component({
  standalone: true,
  selector: 'app-predictive-modeling',
  templateUrl: './predictive-modeling.component.html',
  styleUrls: ['./predictive-modeling.component.scss'],
  imports: [
    AppModule,
    CommonModule,
  ]
})
export class PredictiveModelingComponent implements OnInit {
  settingsForm = new FormGroup({
    developerCount: new FormControl({ value: '', disabled: true }),
    devCostPerYear: new FormControl({ value: '', disabled: true }),
    hoursPerYear: new FormControl({ value: '', disabled: true }),
    percentCoding: new FormControl({ value: '', disabled: true }),
    percentTimeSaved: new FormControl({ value: '', disabled: true })
  })
  targetForm = new FormGroup({
    targetedRoomForImprovement: new FormControl('', [Validators.required, Validators.min(0)]),
    targetedNumberOfDevelopers: new FormControl('', [Validators.required, Validators.min(0)]),
    targetedPercentOfTimeSaved: new FormControl('', [Validators.required, Validators.min(0), Validators.max(100)]),
  });

  constructor(
    private predictiveModelingService: PredictiveModelingService,
    private settingsService: SettingsHttpService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadSettings();
    this.loadTargets();
  }

  loadSettings(): void {
    this.settingsService.getAllSettings().subscribe(settings => {
      this.settingsForm.patchValue({
        developerCount: settings.developerCount,
        devCostPerYear: settings.devCostPerYear,
        hoursPerYear: settings.hoursPerYear,
        percentCoding: settings.percentCoding,
        percentTimeSaved: settings.percentTimeSaved,
      });
    });
  }

  loadTargets(): void {
    this.predictiveModelingService.getTargets().subscribe(targets => {
      this.targetForm.patchValue(targets);
    });
  }

  saveTargets(): void {
    const targets = this.targetForm.value;
    this.predictiveModelingService.saveTargets(targets).subscribe(() => {
      this.snackBar.open('Targets saved successfully', 'Close', {
        duration: 2000,
      });
    });
  }
}
