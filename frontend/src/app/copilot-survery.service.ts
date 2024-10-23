import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Survey } from './models/survey';

@Injectable({
  providedIn: 'root'
})
export class CopilotSurveyService {
  private apiUrl = `http://${window.location.hostname}:3000/api`; // Adjust the URL based on your backend setup 🌐

  constructor(private http: HttpClient) { }

  createSurvey(survey: Survey) {
    return this.http.post(`${this.apiUrl}/create-survey`, survey);
  }

  getAllSurveys(): Observable<Survey[]> {
    return this.http.get<any[]>(`${this.apiUrl}/get-survey`);
  }

  getSurveyById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/get-survey/${id}`);
  }

  updateSurvey(id: number, survey: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/update-survey/${id}`, survey);
  }

  deleteSurvey(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete-survey/${id}`);
  }

}
