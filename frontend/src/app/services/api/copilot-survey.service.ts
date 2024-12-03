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

  getAllSurveys(org?: string) {
    return this.http.get<Survey[]>(this.apiUrl, {
      params: org ? { org } : undefined
    });
  }

  getRecentSurveysWithGoodReasons(minReasonLength: number = 20){
    //const params = new HttpParams().set('minReasonLength', minReasonLength.toString());
    return this.http.get<Survey[]>(`${this.apiUrl}/recent-good-reasons/${minReasonLength}`);
  }

  getSurveyById(id: number) {
    return this.http.get<Survey>(`${this.apiUrl}/${id}`);
  }

  deleteSurvey(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  updateSurvey(survey: Survey)  {
    return this.http.put<Survey>(`${this.apiUrl}/${survey.id}`, survey);
  }
}
