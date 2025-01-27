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

export interface TargetsGridType {
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
    return this.http.get<TargetsGridType>(`${this.apiUrl}`);
  }

  saveTargets(targets: TargetsGridType) {
    return this.http.post<TargetsGridType>(`${this.apiUrl}`, targets);
  }
}

export function initializeGridObject(): TargetsGridType {
  const defaultValueState: TargetsDetailType = {
    seats: 0,
    adoptedDevs: 0,
    monthlyDevsReportingTimeSavings: 0,
    percentSeatsReportingTimeSavings: 0,
    percentSeatsAdopted: 0,
    percentMaxAdopted: 0,
    dailySuggestions: 0,
    dailyChatTurns: 0,
    weeklyPRSummaries: 0,
    weeklyTimeSaved: 0,
    monthlyTimeSavings: 0,
    annualTimeSavingsDollars: 0,
    productivityBoost: 0,
    asOfDate: 0
  };
  return {
    current: { ...defaultValueState },
    target: { ...defaultValueState },
    max: { ...defaultValueState }
  };
}
