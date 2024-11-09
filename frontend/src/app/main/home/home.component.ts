import { Component } from '@angular/core';
import { AppModule } from '../../app.module';
import { DashboardCardComponent } from "./dashboard-card/dashboard-card.component";
import { DashboardBarsCardComponent, DashboardBarsCardSection } from "./dashboard-bars-card/dashboard-bars-card.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    AppModule,
    DashboardCardComponent,
    DashboardBarsCardComponent
],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  totalMembers = 845;
  totalSeats = 845;
  engagementSections: DashboardBarsCardSection[] = [
      { name: 'IDE Code Completion', icon: 'code', value: 643, maxValue: this.totalSeats },
      { name: 'IDE Chat', icon: 'chat', value: 506, maxValue: this.totalSeats },
      { name: '.COM Chat', icon: 'public', value: 342, maxValue: this.totalSeats },
      { name: '.COM PRs', icon: 'merge', value: 146, maxValue: this.totalSeats },
  ]
}
