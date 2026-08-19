import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class PermissionGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    const permission = route.data['permission'] as string | undefined;
    if (!permission) return of(true);

    if (this.auth.isAuthenticated()) {
      return of(this.allowOrBlock(permission));
    }

    return this.auth.ensureValidAccessToken$().pipe(
      switchMap(token => {
        if (!this.auth.isAuthenticated() && !token) {
          return of(this.router.createUrlTree(['/pages/login'], { queryParams: { returnUrl: state.url } }));
        }
        return of(this.allowOrBlock(permission));
      }),
      catchError(() => of(this.router.createUrlTree(['/pages/login'], { queryParams: { returnUrl: state.url } })))
    );
  }

  private allowOrBlock(permission: string): boolean | UrlTree {
    return this.auth.hasPermission(permission)
      ? true
      : this.router.createUrlTree(['/pages/error']);
  }
}
