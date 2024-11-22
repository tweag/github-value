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
import confetti from 'canvas-confetti';
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
    port: new FormControl('', [Validators.required, Validators.min(1), Validators.max(65535)]),
    username: new FormControl('', Validators.required),
    password: new FormControl(''),
  });

  constructor(
    private cdr: ChangeDetectorRef,
    private setupService: SetupService,
    private router: Router
  ) {
    console.log('DatabaseComponent');
  }

  ngAfterViewInit() {
    this.stepper.selectedIndexChange.subscribe(() => {
      if (this.stepper.selectedIndex === 2) {
        this.stepper.steps.get(2)!.interacted = true;
        this.celebrate();
        setTimeout(async () => await this.router.navigate(['/setup/loading']), 1000);
      }
    });
    this.checkStatus().subscribe();
  }

  dbConnect() {
    if(this.dbFormGroup.invalid) return;
    this.isDbConnecting = true;
    this.checkStatus().subscribe(() => {
      this.isDbConnecting = false;
      this.cdr.detectChanges();
      this.stepper.selectedIndex = 1;
    });
  }

  checkStatus() {
    return this.setupService.getSetupStatus().pipe(
      tap(status => {
        this.status = status;
        if (this.status.dbConnected && this.stepper.selectedIndex === 0) {
          this.stepper.next();
        }
        if (this.status.isSetup && this.stepper.selectedIndex === 1) {
          this.stepper.next();
        }
      })
    )
  }

  celebrate() {
    const duration = 15 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      // since particles fall down, start a bit higher than random
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  }

}
