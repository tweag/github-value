import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { serverUrl } from './server.service';

@Injectable({
  providedIn: 'root'
})
export class TeamsService {
  private apiUrl = `${serverUrl}/api/teams`;

  constructor(private http: HttpClient) { }

  getAllTeams(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}`);
  }
}
