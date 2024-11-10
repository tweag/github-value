import { Injectable } from '@angular/core';
import { serverUrl } from './server.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MembersService {
  private apiUrl = `${serverUrl}/api/members`;

  constructor(private http: HttpClient) { }

  getAllMembers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}`);
  }
}
