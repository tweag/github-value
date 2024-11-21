import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { serverUrl } from './server.service';

@Injectable({
  providedIn: 'root'
})
export class PredictiveModelingService {
  private apiUrl = `${serverUrl}/api/predictive-modeling`;

  constructor(private http: HttpClient) {}

  getTargets() {
    return this.http.get<any>(`${this.apiUrl}/targets`);
  }

  saveTargets(targets: any) {
    return this.http.post<any>(`${this.apiUrl}/targets`, targets);
  }

  getCalculatedFields() {
    return this.http.get<any>(`${this.apiUrl}/calculated-fields`);
  }
}
