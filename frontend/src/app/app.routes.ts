import { Routes } from '@angular/router';
import { CopilotSurveyComponent } from './surveys/copilot-survey/copilot-survey.component';
import { CopilotDashboardComponent } from './copilot-dashboard/copilot-dashboard.component';
import { SurveysComponent } from './surveys/surveys.component';
import { SettingsComponent } from './settings/settings.component';

export const routes: Routes = [
  { path: '', component: CopilotDashboardComponent },
  { path: 'surveys/new', component: CopilotSurveyComponent },
  { path: 'surveys', component: SurveysComponent },
  { path: 'settings', component: SettingsComponent},
  { path: '**', component: CopilotDashboardComponent }
];
