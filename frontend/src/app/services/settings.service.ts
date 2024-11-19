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
    return this.http.get<string>(`${this.apiUrl}/developerTotal`);
  }

  updateDeveloperTotal(data: string) {
    return this.http.put<void>(`${this.apiUrl}/developerTotal`, { value: data });
  }

  getAdopterCount() {
    return this.http.get<string>(`${this.apiUrl}/adopterCount`);
  }

  updateAdopterCount(data: string) {
    return this.http.put<void>(`${this.apiUrl}/adopterCount`, { value: data });
  }

  getPerLicenseCost() {
    return this.http.get<string>(`${this.apiUrl}/perLicenseCost`);
  }

  updatePerLicenseCost(data: string) {
    return this.http.put<void>(`${this.apiUrl}/perLicenseCost`, { value: data });
  }

  getPerDevCostPerYear() {
    return this.http.get<string>(`${this.apiUrl}/perDevCostPerYear`);
  }

  updatePerDevCostPerYear(data: string) {
    return this.http.put<void>(`${this.apiUrl}/perDevCostPerYear`, { value: data });
  }

  getPerDevHoursPerYear() {
    return this.http.get<string>(`${this.apiUrl}/perDevHoursPerYear`);
  }

  updatePerDevHoursPerYear(data: string) {
    return this.http.put<void>(`${this.apiUrl}/perDevHoursPerYear`, { value: data });
  }

  getPercentofHoursCoding() {
    return this.http.get<string>(`${this.apiUrl}/percentofHoursCoding`);
  }

  updatePercentofHoursCoding(data: string) {
    return this.http.put<void>(`${this.apiUrl}/percentofHoursCoding`, { value: data });
  }
}
