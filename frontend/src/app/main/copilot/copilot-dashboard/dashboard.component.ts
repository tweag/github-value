import { Component, OnInit } from '@angular/core';
import { AppModule } from '../../../app.module';
import { DashboardCardBarsComponent, DashboardCardBarsInput } from "./dashboard-card/dashboard-card-bars/dashboard-card-bars.component";
import { DashboardCardValueComponent } from './dashboard-card/dashboard-card-value/dashboard-card-value.component';
import { DashboardCardSunburstComponent } from "./dashboard-card/dashboard-card-sunburst/dashboard-card-sunburst.component";
import { DashboardCardDrilldownBarChartComponent } from './dashboard-card/dashboard-card-drilldown-bar-chart/dashboard-card-drilldown-bar-chart.component';
import { MetricsService } from '../../../services/metrics.service';
import { CopilotMetrics } from '../../../services/metrics.service.interfaces';
import { SeatService } from '../../../services/seat.service';
import { MembersService } from '../../../services/members.service';
import { CopilotSurveyService } from '../../../services/copilot-survery.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    AppModule,
    DashboardCardValueComponent,
    DashboardCardBarsComponent,
    DashboardCardSunburstComponent,
    DashboardCardDrilldownBarChartComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class CopilotDashboardComponent implements OnInit {
  totalMembers = 0;
  totalSeats = 0;
  totalSurveys = 0;
  totalSurveysThisWeek = 0;
  metricsData?: CopilotMetrics[];
  seatPercentage = 0;
  activeToday = 0;
  activeWeeklyChangePercent = 0;

  constructor(
    private metricsService: MetricsService,
    private membersService: MembersService,
    private seatService: SeatService,
    private surveyService: CopilotSurveyService
  ) { }

  ngOnInit() {
    const since = new Date();
    since.setDate(since.getDate() - 30);
    const formattedSince = since.toISOString().split('T')[0];

    this.surveyService.getAllSurveys().subscribe(data => {
      this.totalSurveys = data.length;
      this.totalSurveysThisWeek = data.reduce((acc, survey) => {
        const surveyDate = new Date(survey.dateTime);
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        return surveyDate > oneWeekAgo ? acc + 1 : acc;
      }, 0);
    });

    forkJoin({
      members: this.membersService.getAllMembers(),
      seats: this.seatService.getAllSeats()
    }).subscribe(result => {
      this.totalMembers = result.members.length;
      this.totalSeats = result.seats.length;
      this.seatPercentage = (this.totalSeats / this.totalMembers) * 100;
    });

    this.metricsService.getMetrics({
      since: formattedSince,
    }).subscribe(data => {
      this.metricsData = data;
      this.activeToday = data[data.length - 1].total_active_users;

      const lastWeekIndex = data.length - 8; // 7 days ago
      const lastWeekUsers = lastWeekIndex >= 0 ? data[lastWeekIndex].total_active_users : 0;

      const percentChange = lastWeekUsers === 0
        ? 100 // If last week was 0, treat as 100% increase
        : ((this.activeToday - lastWeekUsers) / lastWeekUsers) * 100;
      this.activeWeeklyChangePercent = Math.round(percentChange * 10) / 10;
    });
  }
}
