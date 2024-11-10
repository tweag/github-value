import { Component } from '@angular/core';
import { AppModule } from '../../../app.module';
import { AdoptionChartComponent } from "./adoption-chart/adoption-chart.component";
import { SeatService } from '../../../services/seat.service';
import { DailyActivityChartComponent } from './daily-activity-chart/daily-activity-chart.component';
import { TimeSavedChartComponent } from './time-saved-chart/time-saved-chart.component';

@Component({
  selector: 'app-value',
  standalone: true,
  imports: [
    AppModule,
    AdoptionChartComponent,
    DailyActivityChartComponent,
    TimeSavedChartComponent
  ],
  templateUrl: './value.component.html',
  styleUrl: './value.component.scss'
})
export class CopilotValueComponent {
  constructor(
    private seatService: SeatService,
  ) {
    this.seatService.getActivity().subscribe(seats => {
      console.log(seats);
    });
  }
}
