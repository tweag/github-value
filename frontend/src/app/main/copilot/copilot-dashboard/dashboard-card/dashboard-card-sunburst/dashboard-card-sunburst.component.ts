import { Component, Input } from '@angular/core';
import { SunburstChartComponent } from '../../../../../shared/sunburst-chart/sunburst-chart.component';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard-card-sunburst',
  standalone: true,
  imports: [
    SunburstChartComponent,
    MatCardModule,
    CommonModule
  ],
  templateUrl: './dashboard-card-sunburst.component.html',
  styleUrls: [
    './dashboard-card-sunburst.component.scss',
    '../dashboard-card.scss'
  ]
})
export class DashboardCardSunburstComponent {
  @Input() data: Highcharts.PointOptionsObject[] = [];
  @Input() title?: string;
}
