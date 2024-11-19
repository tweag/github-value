import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PredictiveModelingService } from '../../../services/predictive-modeling.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-predictive-modeling',
  templateUrl: './predictive-modeling.component.html',
  styleUrls: ['./predictive-modeling.component.scss']
})
export class PredictiveModelingComponent implements OnInit {
  settingsForm: FormGroup;
  targetForm: FormGroup;
  calculatedFields: any;

  constructor(
    private fb: FormBuilder,
    private predictiveModelingService: PredictiveModelingService,
    private snackBar: MatSnackBar
  ) {
    this.settingsForm = this.fb.group({
      developerCount: [{ value: '', disabled: true }],
      devCostPerYear: [{ value: '', disabled: true }],
      hoursPerYear: [{ value: '', disabled: true }],
      percentCoding: [{ value: '', disabled: true }],
      percentTimeSaved: [{ value: '', disabled: true }]
    });

    this.targetForm = this.fb.group({
      targetValue1: [''],
      targetValue2: ['']
    });
  }

  ngOnInit(): void {
    this.loadSettings();
    this.loadTargets();
  }

  loadSettings(): void {
    this.predictiveModelingService.getSettings().subscribe(settings => {
      this.settingsForm.patchValue(settings);
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
