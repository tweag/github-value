import { Injectable } from '@angular/core';
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
    console.log('SetupGuard');
    return this.setupService.getSetupStatus().pipe(
      map((response: any) => {
        if (response.isSetup) {
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

  canActivateChild(): Observable<boolean> {
    console.log('SetupGuard');
    return this.setupService.getSetupStatus().pipe(
      map((response: any) => {
        if (response.isSetup) {
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
}