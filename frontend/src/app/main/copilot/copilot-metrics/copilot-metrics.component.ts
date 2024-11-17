import { Component } from '@angular/core';
import { DateRangeSelectComponent } from "../../../shared/date-range-select/date-range-select.component";

@Component({
  selector: 'app-metrics',
  standalone: true,
  imports: [DateRangeSelectComponent],
  templateUrl: './copilot-metrics.component.html',
  styleUrl: './copilot-metrics.component.scss'
})
export class CopilotMetricsComponent {
  dateRangeChange(event: {start: Date, end: Date}) {
  }
}
