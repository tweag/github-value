import { Routes } from '@angular/router';
import { CopilotSurveyComponent } from './main/copilot/copilot-surveys/copilot-survey/copilot-survey.component';
import { CopilotSurveysComponent } from './main/copilot/copilot-surveys/surveys.component';
import { SettingsComponent } from './main/settings/settings.component';
import { InstallComponent } from './install/install.component';
import { SetupGuard } from './guards/setup.guard';
import { MainComponent } from './main/main.component';
import { CopilotDashboardComponent } from './main/copilot/copilot-dashboard/dashboard.component';
import { CopilotValueComponent } from './main/copilot/copilot-value/value.component';
import { CopilotMetricsComponent } from './main/copilot/copilot-metrics/copilot-metrics.component';
import { CopilotSeatsComponent } from './main/copilot/copilot-seats/copilot-seats.component';
import { CopilotCalculatorComponent } from './main/copilot/copilot-calculator/copilot-calculator.component';

export const routes: Routes = [
  { path: 'setup', component: InstallComponent },  {
    path: '',
    component: MainComponent,
    canActivate: [SetupGuard],
    canActivateChild: [SetupGuard],
    children: [
      { path: 'copilot', component: CopilotDashboardComponent, title: 'Dashboard' },
      { path: 'copilot/value', component: CopilotValueComponent, title: 'Value' },
      { path: 'copilot/metrics', component: CopilotMetricsComponent, title: 'Metrics' },
      { path: 'copilot/seats', component: CopilotSeatsComponent, title: 'Seats' },
      { path: 'copilot/calculator', component: CopilotCalculatorComponent, title: 'Calculator' },
      { path: 'copilot/surveys', component: CopilotSurveysComponent, title: 'Surveys' },
      { path: 'copilot/surveys/new', component: CopilotSurveyComponent, title: 'New Survey' },
      { path: 'settings', component: SettingsComponent, title: 'Settings' },
      { path: '', redirectTo: 'copilot', pathMatch: 'full' }
    ]
  },
  { path: '**', component: MainComponent }
];