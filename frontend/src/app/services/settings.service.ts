import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { serverUrl } from './server.service';

@Injectable({
  providedIn: 'root'
})
export class SettingsHttpService {
  private apiUrl = `${serverUrl}/api/settings`;

  constructor(private http: HttpClient) { }

  getAllSettings(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}`);
  }

  getSettingsByName(name: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${name}`);
  }

  createSettings(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}`, data);
  }
  
  updateSettings(name: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${name}`, data);
  }

  deleteSettings(name: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${name}`);
  }
}