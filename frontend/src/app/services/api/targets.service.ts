import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { serverUrl } from '../server.service';

export interface TargetsDetailType {
  seats: string | number;
  adoptedDevs: string | number;
  monthlyDevsReportingTimeSavings: string | number;
  percentSeatsReportingTimeSavings: string | number;
  percentSeatsAdopted: string | number;
  percentMaxAdopted: string | number;
  dailySuggestions: string | number;
  dailyChatTurns: string | number;
  weeklyPRSummaries: string | number;
  weeklyTimeSaved: string | number;
  monthlyTimeSavings: string | number;
  annualTimeSavingsDollars: string | number;
  productivityBoost: string | number;
  asOfDate?: string | number;
  [key: string]: string | number | undefined;
};

export interface TargetsType {
  current: TargetsDetailType;
  target: TargetsDetailType;
  max: TargetsDetailType;
}

@Injectable({
  providedIn: 'root'
})
export class TargetsService {
  private apiUrl = `${serverUrl}/api/targets`;

  constructor(
    private http: HttpClient
  ) {}

  getTargets() {
    return this.http.get<TargetsType>(`${this.apiUrl}`);
  }

  saveTargets(targets: TargetsType) {
    return this.http.post<TargetsType>(`${this.apiUrl}`, targets);
  }
}
