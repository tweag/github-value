import { Component } from '@angular/core';
import { DateRangeSelectComponent } from "../../../shared/date-range-select/date-range-select.component";
import { MetricsService } from '../../../services/metrics.service';
import { CopilotMetrics } from '../../../services/metrics.service.interfaces';
import { CopilotMetricsPieChartComponent } from './copilot-metrics-pie-chart/copilot-metrics-pie-chart.component';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-metrics',
  standalone: true,
  imports: [
    DateRangeSelectComponent,
    CopilotMetricsPieChartComponent,
    MatCardModule
  ],
  templateUrl: './copilot-metrics.component.html',
  styleUrls: [
    './copilot-metrics.component.scss',
    '../copilot-dashboard/dashboard.component.scss'
  ]
})
export class CopilotMetricsComponent {
  metrics?: CopilotMetrics[];
  metricsTotals?: CopilotMetrics;

  constructor(
    private metricsService: MetricsService
  ) { }

  dateRangeChange(event: {start: Date, end: Date}) {
    const utcStart = Date.UTC(event.start.getFullYear(), event.start.getMonth(), event.start.getDate());
    const utcEnd = Date.UTC(event.end.getFullYear(), event.end.getMonth(), event.end.getDate());
    const startModified = new Date(utcStart - 1);
    const endModified = new Date(utcEnd + 1);
    this.metricsService.getMetrics({
      since: startModified.toISOString(),
      until: endModified.toISOString()
    }).subscribe((metrics) => {
      this.metrics = metrics;
      console.log(metrics);
    });
    this.metricsService.getMetricsTotals({
      since: startModified.toISOString(),
      until: endModified.toISOString()
    }).subscribe((metricsTotals) => {
      this.metricsTotals = metricsTotals;
      console.log(metricsTotals);
    })
  }
}
