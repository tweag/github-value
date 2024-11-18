import { Component } from '@angular/core';
import { DateRangeSelectComponent } from "../../../shared/date-range-select/date-range-select.component";
import { MetricsService } from '../../../services/metrics.service';
import { CopilotMetrics } from '../../../services/metrics.service.interfaces';

@Component({
  selector: 'app-metrics',
  standalone: true,
  imports: [DateRangeSelectComponent],
  templateUrl: './copilot-metrics.component.html',
  styleUrl: './copilot-metrics.component.scss'
})
export class CopilotMetricsComponent {
  metrics?: CopilotMetrics[];

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
  }
}
