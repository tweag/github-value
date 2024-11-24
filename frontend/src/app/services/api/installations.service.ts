import { Injectable } from '@angular/core';
import { BehaviorSubject, tap } from 'rxjs';
import { serverUrl } from '../server.service';
import { Endpoints } from '@octokit/types';
import { HttpClient } from '@angular/common/http';

export interface InstallationStatus {
  installation?: Endpoints["GET /app/installations"]["response"]["data"][number],
  usage: boolean;
  metrics: boolean;
  copilotSeats: boolean;
  teamsAndMembers: boolean;
}
export interface statusResponse {
  isSetup: boolean;
  dbConnected: boolean;
  installations: InstallationStatus[],
}
@Injectable({
  providedIn: 'root'
})
export class InstallationsService {
  private apiUrl = `${serverUrl}/api/setup`;
  installations = new BehaviorSubject<Endpoints["GET /app/installations"]["response"]["data"]>([]);
  currentInstallation = new BehaviorSubject<Endpoints["GET /app/installations"]["response"]["data"][number] | undefined>(undefined);

  constructor(private http: HttpClient) { }

  getSetupStatus() {
    return this.http.get<statusResponse>(`${this.apiUrl}/status`).pipe(
      tap((status) => {
        if (status.installations) {
          this.installations.next(status.installations.map(i => i.installation!));
        }
      })
    );
  }

  getInstallations() {
    return this.installations.asObservable();
  }

  setInstallation(id: number) {
    this.currentInstallation.next(this.installations.value.find(i => i.id === id));
  }

  
}
