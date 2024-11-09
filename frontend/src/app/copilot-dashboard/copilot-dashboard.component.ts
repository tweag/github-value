import { Component } from '@angular/core';
import { AppModule } from '../app.module';
import { AdoptionChartComponent } from "./adoption-chart/adoption-chart.component";
import { SeatService } from '../services/seat.service';
import { DailyActivityChartComponent } from './daily-activity-chart/daily-activity-chart.component';
import { TimeSavedChartComponent } from './time-saved-chart copy/time-saved-chart.component';

@Component({
  selector: 'app-copilot-dashboard',
  standalone: true,
  imports: [
    AppModule,
    AdoptionChartComponent,
    DailyActivityChartComponent,
    TimeSavedChartComponent
  ],
  templateUrl: './copilot-dashboard.component.html',
  styleUrl: './copilot-dashboard.component.scss'
})
export class CopilotDashboardComponent {
  constructor(
    private seatService: SeatService,
  ) {
    this.seatService.getActivity().subscribe(seats => {
      console.log(seats);
    });
  }
}
