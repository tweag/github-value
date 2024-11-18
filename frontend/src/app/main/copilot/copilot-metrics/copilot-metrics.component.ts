import { Component } from '@angular/core';
import { DateRangeSelectComponent } from "../../../shared/date-range-select/date-range-select.component";
import { MetricsService } from '../../../services/metrics.service';
import { CopilotMetrics } from '../../../services/metrics.service.interfaces';
import { CopilotMetricsPieChartComponent } from './copilot-metrics-pie-chart/copilot-metrics-pie-chart.component';

@Component({
  selector: 'app-metrics',
  standalone: true,
  imports: [
    DateRangeSelectComponent,
    CopilotMetricsPieChartComponent
  ],
  templateUrl: './copilot-metrics.component.html',
  styleUrl: './copilot-metrics.component.scss'
})
export class CopilotMetricsComponent {
  metrics?: CopilotMetrics[];
  metricsTotals?: CopilotMetrics;

  constructor(
    private metricsService: MetricsService
  ) { }

  dateRangeChange(event: {start: Date, end: Date}) {
    console.log(event)
    this.metricsService.getMetrics({
      since: event.start.toISOString(),
      until: event.end.toISOString()
    }).subscribe((metrics) => {
      this.metrics = metrics;
      console.log(metrics);
    });
    this.metricsService.getMetricsTotals({
      since: event.start.toISOString(),
      until: event.end.toISOString()
    }).subscribe((metricsTotals) => {
      this.metricsTotals = metricsTotals;
      console.log(metricsTotals);
    })
  }
}
