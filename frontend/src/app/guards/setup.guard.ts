import { Injectable, isDevMode } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, GuardResult, MaybeAsync, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
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
          if (response.dbInitialized || isDevMode()) {
            return true;
          } else {
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