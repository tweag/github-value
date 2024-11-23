import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { serverUrl } from './server.service';
import { Endpoints } from '@octokit/types';
import { BehaviorSubject, tap } from 'rxjs';

export interface InstallationStatus {
  installation?: Endpoints["GET /app/installations"]["response"]["data"][number],
  usage: boolean;
  metrics: boolean;
  copilotSeats: boolean;
  teamsAndMembers: boolean;
}

export interface SetupStatusResponse {
  isSetup: boolean;
  dbConnected: boolean;
  installations: InstallationStatus[],
}
@Injectable({
  providedIn: 'root'
})
export class SetupService {
  private apiUrl = `${serverUrl}/api/setup`;
  installations = new BehaviorSubject<Endpoints["GET /app/installations"]["response"]["data"]>([]);

  constructor(private http: HttpClient) { }

  getSetupStatus() {
    return this.http.get<SetupStatusResponse>(`${this.apiUrl}/status`).pipe(
      tap((status) => {
        if (status.installations) {
          this.installations.next(status.installations.map(i => i.installation!));
        }
      })
    );
  }

  getInstall() {
    return this.http.get<Endpoints["GET /app"]["response"]['data']>(
      `${this.apiUrl}/install`
    );
  }

  getManifest() {
    return this.http.get<{
      name: string;
      description: string;
      url: string;
      hook_attributes: {
        url: string;
      };
      setup_url: string;
      redirect_url: string;
      public: boolean;
      default_permissions: {
        members: 'read';
        metadata: 'read';
        organization_copilot_seat_management: 'read';
        pull_requests: 'write';
      };
      default_events: ('pull_request')[];
    }>(
      `${this.apiUrl}/manifest`
    );
  }

  addExistingApp(request: {
    appId: string,
    privateKey: string,
    webhookSecret: string
  }) {
    return this.http.post<{
      installUrl: string
    }>(`${this.apiUrl}/existing-app`, request);
  }

  setupDB(request: { // should be url or fields
    host?: string;
    port?: number;
    username?: string;
    password?: string;
    url?: string;
  }) {
    return this.http.post(`${this.apiUrl}/db`, request);
  }

}
