import { Injectable, isDevMode } from '@angular/core';
import { CanActivate, CanActivateChild, GuardResult, MaybeAsync, Router } from '@angular/router';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { SetupService } from '../services/setup.service';

@Injectable({
  providedIn: 'root'
})
export class SetupGuard implements CanActivate, CanActivateChild {
  constructor(
    private setupService: SetupService,
    private router: Router
  ) { }

  canActivate(): MaybeAsync<GuardResult> {
    return this.setupService.getSetupStatus(['isSetup', 'dbInitialized']).pipe(
      map((response) => {
        if (response.isSetup) {
          if (response.dbInitialized === false) {
            this.router.navigate(['/setup/loading']);
            return false;
          }
          return true;
        } else {
          this.router.navigate(['/setup']);
          return false;
        }
      }),
      catchError(() => {
        this.router.navigate(['/setup']);
        return of(false);
      })
    );
  }

  canActivateChild(): MaybeAsync<GuardResult> {
    return this.canActivate();
  }
}

export class LoadingGuard implements CanActivate, CanActivateChild {
  constructor(
    private setupService: SetupService,
    private router: Router
  ) { }

  canActivate(): MaybeAsync<GuardResult> {
    return this.setupService.getSetupStatus(['isSetup', 'dbInitialized']).pipe(
      map((response) => {
        if (response.dbInitialized === false) {
          this.router.navigate(['/setup/loading']);
          return false;
        }
        return true;
      }),
      catchError(() => {
        this.router.navigate(['/setup']);
        return of(false);
      })
    );
  }

  canActivateChild(): MaybeAsync<GuardResult> {
    return this.canActivate();
  }
}