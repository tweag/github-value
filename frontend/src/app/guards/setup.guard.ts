import { Injectable, isDevMode } from '@angular/core';
import { CanActivate, CanActivateChild, GuardResult, MaybeAsync, Router } from '@angular/router';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { SetupService, SetupStatusResponse } from '../services/setup.service';

@Injectable({
  providedIn: 'root'
})
export class SetupGuard implements CanActivate, CanActivateChild {
  cache: SetupStatusResponse = {
    isSetup: false,
    dbConnected: false,
    installations: []
  };

  constructor(
    private setupService: SetupService,
    private router: Router
  ) { }

  canActivate(): MaybeAsync<GuardResult> {
    if (this.cache.isSetup && this.cache.dbConnected) {
      return of(true);
    }
    return this.setupService.getSetupStatus().pipe(
      map((response) => {
        this.cache = response;
        if (!response.dbConnected) {
          this.router.navigate(['/setup/db'])
          return false;
        }
        if (!response.installations?.some(i => Object.values(i).some(j => !j)) && !isDevMode()) {
          this.router.navigate(['/setup/loading']);
          return false;
        }
        if (!response.isSetup) throw new Error('Not setup');
        return true;
      }),
      catchError(() => {
        this.router.navigate(['/setup/db']);
        return of(false);
      })
    );
  }

  canActivateChild(): MaybeAsync<GuardResult> {
    return this.canActivate();
  }
}
