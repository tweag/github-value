import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { serverUrl } from '../server.service';

export interface Survey {
  id?: number;
  org: string;
  repo: string;
  prNumber: number;
  status?: 'pending' | 'completed';
  hits?: number;
  userId: string;
  usedCopilot: boolean;
  percentTimeSaved: number;
  timeUsedFor: string;
  reason: string;
  createdAt?: Date;
  updatedAt?: Date;
  kudos?: number; // Add kudos property
}

@Injectable({
  providedIn: 'root'
})
export class CopilotSurveyService {
  private apiUrl = `${serverUrl}/api/survey`;

  constructor(private http: HttpClient) { }

  createSurvey(survey: Survey) {
    return this.http.post<Survey>(this.apiUrl, survey);
  }

  createSurveyGitHub(survey: Survey) {
    return this.http.post(`${this.apiUrl}/${survey.id}/github`, survey);
  }

  getAllSurveys(params?: {
    org?: string;
    team?: string;
    reasonLength?: number;
    since?: string;
    until?: string;
    status?: 'pending' | 'completed';
  }) {
    if (!params) {
      return this.http.get<Survey[]>(this.apiUrl);
    }
      
    let httpParams = new HttpParams().set('org', params.org ? params.org.toString() : '');

    if (params.team) {
      httpParams = httpParams.set('team', params.team);
    }

    if (params?.reasonLength) {
      httpParams = httpParams.set('reasonLength', params.reasonLength.toString());
    }
    if (params.since) {
      httpParams = httpParams.set('since', params.since);
    } 
    if (params.until) {
      httpParams = httpParams.set('until', params.until);
    } 
    if (params.status) {
      httpParams = httpParams.set('status', params.status);
    } 
    // TODO probably deletable?
    return this.http.get<Survey[]>(this.apiUrl, {
      params
    });
  }

  getSurveyById(id: number) {
    return this.http.get<Survey>(`${this.apiUrl}/${id}`);
  }

  deleteSurvey(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  updateSurvey(survey: Partial<Survey>) {
    return this.http.put<Survey>(`${this.apiUrl}/${survey.id}`, survey);
  }

}
