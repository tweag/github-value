import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PredictiveModelingService {
  private apiUrl = 'api/predictive-modeling';

  constructor(private http: HttpClient) {}

  getSettings(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/settings`);
  }

  getTargets(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/targets`);
  }

  saveTargets(targets: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/targets`, targets);
  }

  getCalculatedFields(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/calculated-fields`);
  }
}
