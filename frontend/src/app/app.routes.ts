import { Routes } from '@angular/router';
import { CopilotSurveyComponent } from './main/surveys/copilot-survey/copilot-survey.component';
import { SurveysComponent } from './main/surveys/surveys.component';
import { SettingsComponent } from './main/settings/settings.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { SetupGuard } from './guards/setup.guard';
import { MainComponent } from './main/main.component';
import { CopilotDashboardComponent } from './main/copilot-dashboard/copilot-dashboard.component';
import { HomeComponent } from './main/home/home.component';

export const routes: Routes = [
  { path: 'setup', component: WelcomeComponent },  {
    path: '',
    component: MainComponent,
    canActivate: [SetupGuard],
    canActivateChild: [SetupGuard],
    children: [
      { path: '', component: HomeComponent },
      { path: 'copilot', component: CopilotDashboardComponent },
      { path: 'surveys/new', component: CopilotSurveyComponent },
      { path: 'surveys', component: SurveysComponent },
      { path: 'settings', component: SettingsComponent }
    ]
  },
  { path: '**', component: MainComponent }
];