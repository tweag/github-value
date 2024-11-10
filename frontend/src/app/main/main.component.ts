import { Component, inject, ViewEncapsulation } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { AsyncPipe } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { AppModule } from '../app.module';
import { MetricsService } from '../services/metrics.service';
import { ThemeService } from '../services/theme.service';
import { FormControl, FormGroup } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';

export enum DateRangeOption {
  WEEK = 'week',
  MONTH = 'month',
  LAST_MONTH = 'lastMonth',
  THIRTY_DAYS = '30days',
  NINETY_DAYS = '90days',
  YEAR = 'year',
  CUSTOM = 'custom'
}

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    AsyncPipe,
    AppModule
  ]
})
export class MainComponent {
  private breakpointObserver = inject(BreakpointObserver);
  hideNavText = false;
  range = new FormGroup({
    start: new FormControl(),
    end: new FormControl()
  });
  selectedRange: DateRangeOption = DateRangeOption.THIRTY_DAYS; // Default to 30 days 📅
  minDate: Date = new Date(2022, 0, 1);
  maxDate: Date = new Date();

  constructor(
    private metricsService: MetricsService,
    public themeService: ThemeService
  ) {
    this.hideNavText = localStorage.getItem('hideNavText') === 'true';
    this.metricsService.getMetrics().subscribe(data => {
      console.log(data);
    });
    
    // Set default date range to last 30 days 📅
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    this.range.setValue({
      start: thirtyDaysAgo,
      end: today
    });
  }

  isHandset$: Observable<boolean> = this.breakpointObserver.observe([
    '(max-width: 599px)'  // Standard mobile breakpoint
  ]).pipe(
    map(result => result.matches),
    shareReplay()
  );

  toggleNavText(): void {
    this.hideNavText = !this.hideNavText;
    localStorage.setItem('hideNavText', this.hideNavText.toString());
  }

  onRangeChange(event: MatSelectChange) {
    const today = new Date();
    let start = new Date();
    let end = new Date();

    switch (event.value) {
      case 'week':
        // Set to Monday of current week
        start.setDate(today.getDate() - today.getDay() + 1);
        end.setDate(today.getDate() - today.getDay() + 7);
        break;
      case 'month':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case 'lastMonth':
        start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        end = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      case '30days':
        start.setDate(today.getDate() - 30);
        break;
      case '90days':
        start.setDate(today.getDate() - 90);
        break;
      case 'year':
        start.setFullYear(today.getFullYear() - 1);
        break;
      case 'custom':
        return; // Don't update range, let user pick
    }

    this.range.setValue({ start, end });
  }
}
