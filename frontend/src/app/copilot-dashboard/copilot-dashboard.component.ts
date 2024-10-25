import { Component } from '@angular/core';
import { AppModule } from '../app.module';

@Component({
  selector: 'app-copilot-dashboard',
  standalone: true,
  imports: [
    AppModule
  ],
  templateUrl: './copilot-dashboard.component.html',
  styleUrl: './copilot-dashboard.component.scss'
})
export class CopilotDashboardComponent {

}
