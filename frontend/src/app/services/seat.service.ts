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

  getAllSeats(): Observable<seatsResponse> {
    return this.http.get<seatsResponse>(`${this.apiUrl}`);
  }

  getSeatByLogin(login: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${login}`);
  }

  getSeatActivityByLogin(login: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${login}/activity`);
  }

  getAllSeatsActivity(): Observable<ActivityResponse> {
    return this.getAllSeats().pipe(
      tap(seats => console.log(seats)),
      map(seats => {
        const result: ActivityResponse = {
          active: [],
          inactive: []
        };
        if (!seats) return result;
        return seats.reduce((acc, seat) => {
          acc.active = acc.active || [];
          acc.inactive = acc.inactive || [];
          if (!seat.last_activity_at) {
            acc.inactive.push(seat);
            return acc;
          }
          const activity = new Date(seat.last_activity_at);
          const now = new Date();
          const diff = Math.abs(now.getTime() - activity.getTime());
          const diffDays = Math.ceil(diff / (1000 * 3600 * 24));
          if (diffDays > 30) {
            acc.inactive.push(seat);
          } else {
            acc.active.push(seat);
          }
          return acc;
        }, result);
      })
    );
  };
}