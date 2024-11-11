import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { serverUrl } from './server.service';
import { Endpoints } from "@octokit/types";

type seatsResponse = Endpoints["GET /orgs/{org}/copilot/billing/seats"]["response"]["data"]["seats"];
interface ActivityResponse {
  active: seatsResponse,
  inactive: seatsResponse,
};

@Injectable({
  providedIn: 'root'
})
export class SeatService {
  private apiUrl = `${serverUrl}/api/seats`;

  constructor(private http: HttpClient) { }

  getAllSeats(): Observable<NonNullable<seatsResponse>> {
    return this.http.get<NonNullable<seatsResponse>>(`${this.apiUrl}`);
  }

  getSeatByLogin(login: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${login}`);
  }

  getSeatActivityByLogin(login: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${login}/activity`);
  }

  getActivity(): Observable<ActivityResponse> {
    return this.http.get<ActivityResponse>(`${this.apiUrl}/activity`);
  };
}