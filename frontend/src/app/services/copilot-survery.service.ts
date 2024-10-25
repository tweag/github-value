import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Survey } from '../models/survey';
import { serverUrl } from './server.service';

@Injectable({
  providedIn: 'root'
})
export class CopilotSurveyService {
  private apiUrl = `${serverUrl}/api/survey`;

  constructor(private http: HttpClient) { }

  createSurvey(survey: Survey) {
    return this.http.post(this.apiUrl, survey);
  }

  getAllSurveys(): Observable<Survey[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getSurveyById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  updateSurvey(id: number, survey: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, survey);
  }

  deleteSurvey(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

}
