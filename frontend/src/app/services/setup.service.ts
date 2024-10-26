import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { serverUrl } from './server.service';

@Injectable({
  providedIn: 'root'
})
export class SetupService {
  private apiUrl = `${serverUrl}/api/setup`;

  constructor(private http: HttpClient) { }

  getSetupStatus(): Observable<{ isSetup: boolean }> {
    return this.http.get<any>(`${this.apiUrl}/status`);
  }

  getInstall(): Observable<any> {
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
