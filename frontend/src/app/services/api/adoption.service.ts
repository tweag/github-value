import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { serverUrl } from '../server.service';

export interface GetAdoptionsParams {
  enterprise?: string;
  daysInactive: number;
  org?: string;
  team?: string;
  precision?: string;
  since?: string;
  until?: string;
}
//TODO remove old params

export interface Adoption {
  _id: {
    $oid: string;
  };
  date: {
    $date: string;
  };
  totalSeats: number;
  totalActive: number;
  totalInactive: number;
  seats: {
    $oid: string;
  }[];
  createdAt: {
    $date: string;
  };
  updatedAt: {
    $date: string;
  };
  __v: number;
}

@Injectable({
  providedIn: 'root',
})
export class AdoptionService {
  private apiUrl = `${serverUrl}/api/seats/activity`;

  constructor(private http: HttpClient) { }

  getAdoptions(params: GetAdoptionsParams): Observable<Adoption[]> {
    let httpParams = new HttpParams().set('daysInactive', params.daysInactive.toString());

    if (params.enterprise) {
      httpParams = httpParams.set('enterprise', params.enterprise);
    }

    if (params.daysInactive) {
      httpParams = httpParams.set('daysInactive', params.daysInactive.toString());
    } 
    
    if (params.org) {
      httpParams = httpParams.set('org', params.org);
    }
    if (params.team) {
      httpParams = httpParams.set('team', params.team);
    }

    if (params.precision) {
      httpParams = httpParams.set('precision', params.precision);
    }
    if (params.since) {
      httpParams = httpParams.set('since', params.since);
    } 
    if (params.until) {
      httpParams = httpParams.set('until', params.until);
    } 

    const adoptionResponse = this.http.get<Adoption[]>(this.apiUrl, { params: httpParams });
    
    return adoptionResponse;
  }
}
