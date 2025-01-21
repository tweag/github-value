import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { serverUrl } from '../server.service';

export interface GetAdoptionsParams {
  daysInactive: number;
  org?: string;
  precision?: string;
}

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

    if (params.org) {
      httpParams = httpParams.set('org', params.org);
    }
    if (params.precision) {
      httpParams = httpParams.set('precision', params.precision);
    }

    const adoptionResponse = this.http.get<Adoption[]>(this.apiUrl, { params: httpParams });
    
    return adoptionResponse;
  }
}
