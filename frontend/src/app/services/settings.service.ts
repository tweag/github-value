import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { serverUrl } from './server.service';

export interface Settings {
  devCostPerYear?: string | null;
  developerCount?: string | null;
  hoursPerYear?: string | null;
  percentCoding?: string | null;
  percentTimeSaved?: string | null;
  metricsCronExpression?: string | null;
  baseUrl?: string | null;
  webhookProxyUrl?: string | null;
  webhookSecret?: string | null;
  developerTotal?: string | null;
  adopterCount?: string | null;
  perLicenseCost?: string | null;
  perDevCostPerYear?: string | null;
  perDevHoursPerYear?: string | null;
  percentofHoursCoding?: string | null;
  [key: string]: string | null | undefined;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsHttpService {
  private apiUrl = `${serverUrl}/api/settings`;

  constructor(private http: HttpClient) { }

  getAllSettings() {
    return this.http.get<Settings>(`${this.apiUrl}`);
  }

  getSettingsByName(name: string) {
    return this.http.get<Settings>(`${this.apiUrl}/${name}`);
  }

  createSettings(data: Settings) {
    return this.http.post<void>(`${this.apiUrl}`, data);
  }

  updateSettings(name: string, data: Settings) {
    return this.http.put<void>(`${this.apiUrl}/${name}`, data);
  }

  deleteSettings(name: string) {
    return this.http.delete<void>(`${this.apiUrl}/${name}`);
  }

  getDeveloperTotal() {
    return this.http.get<Settings>(`${this.apiUrl}/developerTotal`);
  }

  updateDeveloperTotal(data: Settings) {
    return this.http.put<void>(`${this.apiUrl}/developerTotal`, data);
  }

  getAdopterCount() {
    return this.http.get<Settings>(`${this.apiUrl}/adopterCount`);
  }

  updateAdopterCount(data: Settings) {
    return this.http.put<void>(`${this.apiUrl}/adopterCount`, data);
  }

  getPerLicenseCost() {
    return this.http.get<Settings>(`${this.apiUrl}/perLicenseCost`);
  }

  updatePerLicenseCost(data: Settings) {
    return this.http.put<void>(`${this.apiUrl}/perLicenseCost`, data);
  }

  getPerDevCostPerYear() {
    return this.http.get<Settings>(`${this.apiUrl}/perDevCostPerYear`);
  }

  updatePerDevCostPerYear(data: Settings) {
    return this.http.put<void>(`${this.apiUrl}/perDevCostPerYear`, data);
  }

  getPerDevHoursPerYear() {
    return this.http.get<Settings>(`${this.apiUrl}/perDevHoursPerYear`);
  }

  updatePerDevHoursPerYear(data: Settings) {
    return this.http.put<void>(`${this.apiUrl}/perDevHoursPerYear`, data);
  }

  getPercentofHoursCoding() {
    return this.http.get<Settings>(`${this.apiUrl}/percentofHoursCoding`);
  }

  updatePercentofHoursCoding(data: Settings) {
    return this.http.put<void>(`${this.apiUrl}/percentofHoursCoding`, data);
  }
}
