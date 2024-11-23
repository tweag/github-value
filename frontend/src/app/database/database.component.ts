import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { InstallComponent } from '../install/install.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { SetupService, SetupStatusResponse } from '../services/setup.service';
import { Router } from '@angular/router';
import { tap } from 'rxjs';

@Component({
  selector: 'app-database',
  standalone: true,
  imports: [
    MatButtonModule,
    MatStepperModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    InstallComponent,
    MatProgressSpinnerModule,
    CommonModule
  ],
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { displayDefaultIndicatorType: false },
    },
  ],
  templateUrl: './database.component.html',
  styleUrl: './database.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatabaseComponent {
  @ViewChild('stepper') private stepper!: MatStepper;
  status?: SetupStatusResponse;
  isDbConnecting = false;
  dbFormGroup = new FormGroup({
    hostname: new FormControl('', Validators.required),
    port: new FormControl(3306, [Validators.required, Validators.min(1), Validators.max(65535)]),
    username: new FormControl('root', Validators.required),
    password: new FormControl(''),
  });

  constructor(
    private cdr: ChangeDetectorRef,
    private setupService: SetupService,
    private router: Router
  ) { }

  ngAfterViewInit() {
    this.stepper.selectedIndexChange.subscribe(async () => {
      if (this.stepper.selectedIndex === 2) {
        this.stepper.steps.get(2)!.interacted = true;
        await this.router.navigate(['/setup/loading'], {
          queryParams: { celebrate: true}
        });
      }
    });
    this.checkStatus();
  }

  dbConnect() {
    if(this.dbFormGroup.invalid) return;
    this.isDbConnecting = true;
    this.setupService.setupDB({
      host: this.dbFormGroup.value.hostname!,
      port: this.dbFormGroup.value.port!,
      username: this.dbFormGroup.value.username!,
      password: this.dbFormGroup.value.password!,
    }).subscribe(() => {
      this.isDbConnecting = false;
      this.cdr.detectChanges();
      this.checkStatus();
    });
  }

  checkStatus() {
    this.setupService.getSetupStatus().subscribe(status => {
      this.status = status;
      if (this.status.dbConnected && this.stepper.selectedIndex === 0) {
        const step = this.stepper.steps.get(0);
        if (step) step.completed = true;
        this.stepper.next();
      }
      if (this.status.isSetup && this.stepper.selectedIndex === 1) {
        const step = this.stepper.steps.get(1);
        if (step) step.completed = true;
        this.stepper.next();
      }
    })
  }

}
