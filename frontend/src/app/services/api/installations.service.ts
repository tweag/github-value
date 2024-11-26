import { Injectable } from '@angular/core';
import { BehaviorSubject, of, tap } from 'rxjs';
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
  status?: statusResponse;
  installations = new BehaviorSubject<Endpoints["GET /app/installations"]["response"]["data"]>([]);
  currentInstallation = new BehaviorSubject<Endpoints["GET /app/installations"]["response"]["data"][number] | undefined>(undefined);
  currentInstallationId = localStorage.getItem('installation') ? parseInt(localStorage.getItem('installation')!) : 0;
  constructor(private http: HttpClient) {
    const id = localStorage.getItem('installation');
    if (id) {
      this.setInstallation(Number(id));
    }
  }

  getStatus() {
    if (!this.status) {
      return this.refreshStatus();
    }
    return of(this.status);
  }

  refreshStatus() {
    return this.http.get<statusResponse>(`${this.apiUrl}/status`).pipe(
      tap((status) => {
        this.status = status;
        if (status.installations) {
          this.installations.next(status.installations.map(i => i.installation!));
          this.setInstallation(this.currentInstallationId);
        }
      })
    );
  }

  getInstallations() {
    return this.installations.asObservable();
  }

  setInstallation(id: number) {
    this.currentInstallationId = id;
    this.currentInstallation.next(this.installations.value.find(i => i.id === id));
    localStorage.setItem('installation', id.toString());
  }

  
}
