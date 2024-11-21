// predictive-modeling.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-predictive-modeling',
  styles: [`
    :host {
      display: block;
    }
  `], templateUrl: 'predictive-modeling.component.html',
  imports: [ReactiveFormsModule],
  standalone: true
})
export class PredictiveModelingComponent implements OnInit {
  form: FormGroup;
  inputFields = [
    {
      id: 'developerTotal',
      label: 'Total Developers',
      tooltip: 'Total number of developers in your organization',
      type: 'number',
      min: 0,
      step: 1,
      required: true
    },
    {
      id: 'perDevHoursPerYear',
      label: 'Per Developer Hours Per Year',
      tooltip: 'Average working hours per developer per year (e.g., 2080 for 40 hours/week)',
      type: 'number',
      min: 0,
      step: 1,
      required: true
    },
    {
      id: 'perDevCostPerYear',
      label: 'Per Developer Cost Per Year ($)',
      tooltip: 'Average annual cost per developer including salary and benefits',
      type: 'number',
      min: 0,
      step: 1000,
      required: true
    },
    {
      id: 'percentofHoursCoding',
      label: 'Percent of Hours Coding (%)',
      tooltip: 'Percentage of work hours spent on coding activities',
      type: 'number',
      min: 0,
      max: 100,
      step: 1,
      required: true
    }
  ];
  targetFields = [
    {
      id: 'targetedNumberOfDevelopers',
      label: 'Targeted Number of Developers',
      tooltip: 'Number of developers expected to use the solution',
      type: 'number',
      min: 0,
      step: 1,
      required: true
    },
    {
      id: 'targetedPercentOfTimeSaved',
      label: 'Targeted Percent of Time Saved (%)',
      tooltip: 'Expected percentage of time saved through improvements',
      type: 'number',
      min: 0,
      max: 100,
      step: 1,
      required: true
    }
  ];

  resultFields = [
    {
      id: 'roomForImprovement',
      label: 'Current Room for Improvement',
      tooltip: 'Calculated as: Total Developers × (Percent Coding ÷ 100) × Hours Per Year × (Cost Per Year ÷ Hours Per Year)'
    },
    {
      id: 'targetedRoomForImprovement',
      label: 'Targeted Room for Improvement',
      tooltip: 'Calculated as: Target Developers × (Target Time Saved ÷ 100) × (Percent Coding ÷ 100) × Hours Per Year × (Cost Per Year ÷ Hours Per Year)'
    },
    {
      id: 'impact',
      label: 'Impact',
      tooltip: 'Percentage of target to current room for improvement: (Targeted Room for Improvement ÷ Current Room for Improvement) × 100'
    },
    {
      id: 'hoursPerDevPerWeek',
      label: 'Hours Per Dev Per Week',
      tooltip: 'Weekly hours saved per developer: (Targeted Room for Improvement ÷ (Cost Per Year ÷ 50 weeks)) ÷ Target Developers'
    }
  ];

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      developerTotal: ['', [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)]],
      perDevHoursPerYear: ['', [Validators.required, Validators.min(0), Validators.max(8760)]],
      perDevCostPerYear: ['', [Validators.required, Validators.min(0)]],
      percentofHoursCoding: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
      targetedNumberOfDevelopers: ['', [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)]],
      targetedPercentOfTimeSaved: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
      roomForImprovement: [0],
      targetedRoomForImprovement: [0],
      impact: [0],
      hoursPerDevPerWeek: [0]
    });
  }

  ngOnInit() {
    // Subscribe to form changes to update calculations
    this.form.valueChanges.subscribe(() => {
      if (this.form.valid) {
        this.calculateValues();
      }
    });

    // Add custom validator for targetedNumberOfDevelopers
    this.form.get('targetedNumberOfDevelopers')?.addValidators((control) => {
      const targetValue = Number(control.value);
      const totalValue = Number(this.form.get('developerTotal')?.value);
      return targetValue > totalValue ? { exceedsTotal: true } : null;
    });
  }

  getErrorMessage(fieldId: string): string {
    const control = this.form.get(fieldId);
    if (!control?.errors || !control.touched) return '';

    if (control.errors['required']) return 'Required';
    if (control.errors['min']) return 'Must be 0 or greater';
    if (control.errors['max']) {
      if (fieldId === 'perDevHoursPerYear') return 'Cannot exceed hours in a year (8760)';
      return 'Cannot exceed 100%';
    }
    if (control.errors['pattern']) return 'Must be a whole number';
    if (control.errors['exceedsTotal']) return 'Cannot exceed total developers';

    return 'Invalid value';
  }

  calculateValues() {
    const values = {
      developerTotal: Number(this.form.get('developerTotal')?.value) || 0,
      perDevHoursPerYear: Number(this.form.get('perDevHoursPerYear')?.value) || 0,
      perDevCostPerYear: Number(this.form.get('perDevCostPerYear')?.value) || 0,
      percentofHoursCoding: Number(this.form.get('percentofHoursCoding')?.value) || 0,
      targetedNumberOfDevelopers: Number(this.form.get('targetedNumberOfDevelopers')?.value) || 0,
      targetedPercentOfTimeSaved: Number(this.form.get('targetedPercentOfTimeSaved')?.value) || 0
    };

    const roomForImprovement =
      values.developerTotal *
      (values.percentofHoursCoding / 100) *
      values.perDevHoursPerYear *
      (values.perDevCostPerYear / values.perDevHoursPerYear);

    const targetedRoomForImprovement =
      values.targetedNumberOfDevelopers *
      (values.targetedPercentOfTimeSaved / 100) *
      (values.percentofHoursCoding / 100) *
      values.perDevHoursPerYear *
      (values.perDevCostPerYear / values.perDevHoursPerYear);

    const impact = roomForImprovement !== 0
      ? (targetedRoomForImprovement / roomForImprovement) * 100
      : 0;

    const hoursPerDevPerWeek = (values.perDevCostPerYear !== 0 && values.targetedNumberOfDevelopers !== 0)
      ? (targetedRoomForImprovement / (values.perDevCostPerYear / 50)) / values.targetedNumberOfDevelopers
      : 0;

    this.form.patchValue({
      roomForImprovement,
      targetedRoomForImprovement,
      impact,
      hoursPerDevPerWeek
    }, { emitEvent: false });
  }

  formatResult(id: string): string {
    const value = this.form.get(id)?.value;
    if (value === null || value === undefined) return '';

    switch (id) {
      case 'roomForImprovement':
      case 'targetedRoomForImprovement':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(value);
      case 'impact':
        return `${value.toFixed(1)}%`;
      case 'hoursPerDevPerWeek':
        return `${value.toFixed(1)} hours`;
      default:
        return value.toString();
    }
  }

  onSubmit() {
    console.log('submitted');
  }
}
