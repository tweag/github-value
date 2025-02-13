import { Component, inject, model } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { Subject, takeUntil } from 'rxjs';
import { InstallationsService } from '../../../services/api/installations.service';
import { Target, Targets, TargetsService } from '../../../services/api/targets.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';

interface TableTarget {
  key: string;
  current: number;
  target: number;
  max: number;
}

@Component({
  selector: 'app-copilot-value-modeling',
  imports: [
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    CommonModule
  ],
  templateUrl: './copilot-value-modeling.component.html',
  styleUrl: './copilot-value-modeling.component.scss'
})
export class CopilotValueModelingComponent {
  displayedColumns: string[] = ['key', 'current', 'target', 'max', 'actions'];
  orgDataSource: TableTarget[] = [];
  userDataSource: TableTarget[] = [];
  impactDataSource: TableTarget[] = [];
  private readonly _destroy$ = new Subject<void>();
  keyToNameMap: Record<string, string> = {
    seats: 'Seats',
    adoptedDevs: 'Adopted Devs',
    monthlyDevsReportingTimeSavings: 'Monthly Devs reporting Time Savings',
    percentOfSeatsReportingTimeSavings: '% of Seats reporting Time Savings',
    percentOfSeatsAdopted: '% of Seats Adopted',
    percentOfMaxAdopted: '% of Max Adopted',
    dailySuggestions: 'Daily Suggestions',
    dailyAcceptances: 'Daily Acceptances',
    dailyChatTurns: 'Daily Chat Turns',
    dailyDotComChats: 'Daily Dot-Com Chats',
    weeklyPRSummaries: 'Weekly PR Summaries',
    weeklyTimeSavedHrs: 'Weekly Time Saved (hrs)',
    monthlyTimeSavingsHrs: 'Monthly Time Savings (hrs)',
    annualTimeSavingsAsDollars: 'Annual Time Savings as Dollars ($)',
    productivityOrThroughputBoostPercent: 'Productivity or Throughput Boost (%)'
  };
  nameToKeyMap: Record<string, string> = Object.fromEntries(
    Object.entries(this.keyToNameMap).map(([key, value]) => [value, key])
  );
  readonly dialog = inject(MatDialog);

  constructor(
    private installationsService: InstallationsService,
    private targetsService: TargetsService
  ) { }

  ngOnInit() {
    this.installationsService.currentInstallation.pipe(
      takeUntil(this._destroy$.asObservable())
    ).subscribe(installation => {
      try {
        this.targetsService.getTargets().subscribe(targets => {
          console.log(targets);
          this.orgDataSource = this.transformTargets(targets.org);
          this.userDataSource = this.transformTargets(targets.user);
          this.impactDataSource = this.transformTargets(targets.impact);
        });
      } catch (error) {
        console.error('Error during initialization:', error);
      }
    });
  }

  transformTargets(targets: Record<string, Target>): TableTarget[] {
    return Object.keys(targets).map(key => ({
      key: this.keyToNameMap[key] || key, // Use the mapped name or the key if no mapping is found
      current: targets[key].current,
      target: targets[key].target,
      max: targets[key].max
    }));
  }

  transformBackToTargets(orgData: TableTarget[],
    userData: TableTarget[],
    impactData: TableTarget[]): Targets {
    const transformArrayToObject = (data: TableTarget[]): Record<string, Target> => {
      return data.reduce((acc, item) => {
        const originalKey = this.nameToKeyMap[item.key] || item.key;
        acc[originalKey] = { current: item.current, target: item.target, max: item.max };
        return acc;
      }, {} as Record<string, Target>);
    };

    return {
      org: transformArrayToObject(orgData) as Targets['org'],
      user: transformArrayToObject(userData) as Targets['user'],
      impact: transformArrayToObject(impactData) as Targets['impact']
    };
  }

  saveTargets() {
    const targets: Targets = this.transformBackToTargets(this.orgDataSource, this.userDataSource, this.impactDataSource);
    this.targetsService.saveTargets(targets).subscribe();
  }

  openEditDialog(target: Target) {
    // Open the dialog here
    const dialogRef = this.dialog.open(EditTargetDialogComponent, {
      data: target,
      width: '250px',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        target = result;
        this.saveTargets();
      }
    });
  }
}

@Component({
  selector: 'app-edit-target-dialog',
  template: `
<h2 mat-dialog-title>{{ data.key }}</h2>
<mat-dialog-content>
  <!-- <p>What's your favorite animal?</p> -->
  <mat-form-field>
    <mat-label>Current</mat-label>
    <input matInput [(ngModel)]="data.current" />
  </mat-form-field>
  <mat-form-field>
    <mat-label>Target</mat-label>
    <input matInput [(ngModel)]="data.target" />
  </mat-form-field>
  <mat-form-field>
    <mat-label>Max</mat-label>
    <input matInput [(ngModel)]="data.max" />
  </mat-form-field>
</mat-dialog-content>
<mat-dialog-actions>
  <button mat-button (click)="onNoClick()">Close</button>
  <button mat-button (click)="onSaveClick()" cdkFocusInitial>Save</button>
</mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }
    mat-form-field {
      width: 100%;
    }
  `],
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions
  ],
})
export class EditTargetDialogComponent {
  readonly dialogRef = inject(MatDialogRef<EditTargetDialogComponent>);
  readonly data = inject<TableTarget>(MAT_DIALOG_DATA);

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSaveClick(): void {
    this.dialogRef.close(this.data);
  }
}