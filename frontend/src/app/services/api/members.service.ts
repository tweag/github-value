import { Injectable } from '@angular/core';
import { serverUrl } from '../server.service';
import { HttpClient } from '@angular/common/http';
import { Endpoints } from '@octokit/types';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MembersService {
  private apiUrl = `${serverUrl}/api/members`;

  constructor(private http: HttpClient) { }

  getAllMembers(org?: string) {
    return this.http.get<Endpoints["GET /orgs/{org}/members"]["response"]["data"]>(`${this.apiUrl}`, {
      params: org ? { org } : undefined
    });
  }

  getMemberByLogin(login: string) {
    return this.http.get<Endpoints["GET /users/{username}"]["response"]["data"]>(`${this.apiUrl}/${login}`).pipe(
      catchError((error) => {
        return throwError(() => new Error('User not found'));
      })
    );
  }
}
