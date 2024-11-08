import { Component } from '@angular/core';
import { AppModule } from '../app.module';
import { AdoptionChartComponent } from "./adoption-chart/adoption-chart.component";
import { SeatService } from '../services/seat.service';

@Component({
  selector: 'app-copilot-dashboard',
  standalone: true,
  imports: [
    AppModule,
    AdoptionChartComponent
  ],
  templateUrl: './copilot-dashboard.component.html',
  styleUrl: './copilot-dashboard.component.scss'
})
export class CopilotDashboardComponent {
  constructor(
    private seatService: SeatService,
  ) {
    this.seatService.getAllSeatsActivity().subscribe(seats => {
      console.log(seats);
    });
  }
}
