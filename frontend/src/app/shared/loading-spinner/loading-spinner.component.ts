// loading-spinner.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  template: `
    <div class="spinner-container">
      <mat-spinner diameter="40"></mat-spinner>
    </div>
  `,
  styles: [`
    :host {
      width: 100%;
      height: 100%;
    }
    .spinner-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100px;
      width: 100%;
      height: 100%;
    }
  `]
})
export class LoadingSpinnerComponent {}