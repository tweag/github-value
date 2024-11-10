import { Component } from '@angular/core';
import { AppModule } from '../../../app.module';
import { DashboardCardBarsComponent, DashboardCardBarsInput } from "./dashboard-card/dashboard-card-bars/dashboard-card-bars.component";
import { DashboardCardValueComponent } from './dashboard-card/dashboard-card-value/dashboard-card-value.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    AppModule,
    DashboardCardValueComponent,
    DashboardCardBarsComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class CopilotDashboardComponent {
  totalMembers = 845;
  totalSeats = 845;
  engagementSections: DashboardCardBarsInput[] = [
    { name: 'IDE Code Completion', icon: 'code', value: 643, maxValue: this.totalSeats },
    { name: 'IDE Chat', icon: 'chat', value: 506, maxValue: this.totalSeats },
    { name: '.COM Chat', icon: 'public', value: 342, maxValue: this.totalSeats },
    { name: '.COM PRs', icon: 'merge', value: 146, maxValue: this.totalSeats },
  ]
}
