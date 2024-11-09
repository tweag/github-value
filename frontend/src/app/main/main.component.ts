import { Component, inject } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AsyncPipe } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { Observable } from 'rxjs';
import { map, shareReplay, tap } from 'rxjs/operators';
import { AppModule } from '../app.module';
import { MetricsService } from '../services/metrics.service';
import { ThemeService } from '../services/theme.service';

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

  constructor(
    private metricsService: MetricsService,
    public themeService: ThemeService
  ) {
    this.hideNavText = localStorage.getItem('hideNavText') === 'true';
    this.metricsService.getMetrics().subscribe(data => {
      console.log(data);
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
}
