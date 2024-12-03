import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { serverUrl } from './server.service';
import { Observable } from 'rxjs';

export interface Survey {
  id?: number;
  owner: string;
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

  createSurvey(survey: Survey): Observable<Survey> {
    return this.http.post<Survey>(this.apiUrl, survey);
  }

  getAllSurveys(): Observable<Survey[]> {
    return this.http.get<Survey[]>(this.apiUrl);
  }

  getRecentSurveysWithGoodReasons(minReasonLength: number = 20): Observable<Survey[]> {
    //const params = new HttpParams().set('minReasonLength', minReasonLength.toString());
    return this.http.get<Survey[]>(`${this.apiUrl}/recent-good-reasons/${minReasonLength}`);
  }

  getSurveyById(id: number): Observable<Survey> {
    return this.http.get<Survey>(`${this.apiUrl}/${id}`);
  }

  deleteSurvey(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  updateSurvey(survey: Survey): Observable<Survey> {
    return this.http.put<Survey>(`${this.apiUrl}/${survey.id}`, survey);
  }
}
