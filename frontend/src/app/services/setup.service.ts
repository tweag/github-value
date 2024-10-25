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

  getSetupStatus(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/status`);
  }

  getManifest(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/manifest`);
  }

}
