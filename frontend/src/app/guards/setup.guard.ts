import { Injectable, isDevMode } from '@angular/core';
import { CanActivate, GuardResult, MaybeAsync, Router } from '@angular/router';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { SetupService } from '../services/setup.service';

@Injectable({
  providedIn: 'root'
})
export class DbConnectionGuard implements CanActivate {
  constructor(
    private setupService: SetupService,
    private router: Router
  ) {}

  canActivate(): MaybeAsync<GuardResult> {
    console.log('DbConnectionGuard');
    return this.setupService.getSetupStatus().pipe(
      map((response) => {
        console.log('response', response);
        if (!response.dbConnected) throw new Error('DB not connected');
        return true;
      }),
      catchError(() => {
        console.log('errorrrr');
        this.router.navigate(['/setup/db']);
        return of(false);
      })
    );
  }

  canActivateChild() {
    return this.canActivate();
  }
}

// installation.guard.ts
@Injectable({
  providedIn: 'root'
})
export class InstallationGuard implements CanActivate {
  constructor(
    private setupService: SetupService,
    private router: Router
  ) {}

  canActivate(): MaybeAsync<GuardResult> {
    console.log('InstallationGuard');
    return this.setupService.getSetupStatus().pipe(
      map((response) => {
        if (!response.installations?.some(i => Object.values(i).some(j => !j)) && !isDevMode()) {
          this.router.navigate(['/setup/loading']);
          return false;
        }
        return true;
      })
    );
  }

  canActivateChild() {
    return this.canActivate();
  }
}

// setup-status.guard.ts
@Injectable({
  providedIn: 'root'
})
export class SetupStatusGuard implements CanActivate {
  constructor(
    private setupService: SetupService,
    private router: Router
  ) {}

  canActivate(): MaybeAsync<GuardResult> {
    console.log('SetupStatusGuard');
    return this.setupService.getSetupStatus().pipe(
      map((response) => {
        if (!response.isSetup) {
          throw new Error('Not setup');
        }
        return true;
      })
    );
  }

  canActivateChild() {
    return this.canActivate();
  }
}