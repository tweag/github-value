import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { serverUrl } from './server.service';
import { Endpoints } from '@octokit/types';

export interface SetupStausResponse {
  isSetup?: boolean;
  dbInitialized?: boolean;
  dbsInitalized?: {
    usage: boolean;
    metrics: boolean;
    copilotSeats: boolean;
    teamsAndMembers: boolean;
  },
  installation?: any;
}
@Injectable({
  providedIn: 'root'
})
export class SetupService {
  private apiUrl = `${serverUrl}/api/setup`;

  constructor(private http: HttpClient) { }

  getSetupStatus(fields?: string[]): Observable<SetupStausResponse> {
    const params = fields ? new HttpParams().set('fields', fields.join(',')) : undefined;
    return this.http.get<any>(`${this.apiUrl}/status`, {
      params
    });
  }

  getInstall() {
    return this.http.get<any>(`${this.apiUrl}/install`);
  }

  getManifest(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/manifest`);
  }

  addExistingApp(request: {
    appId: string,
    privateKey: string,
    webhookSecret: string
  }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/existing-app`, request);
  }

}
