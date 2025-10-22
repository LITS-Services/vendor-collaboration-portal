import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Observable, of } from 'rxjs';
import { catchError, map, take } from 'rxjs/operators';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private auth: AuthService, private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot)
  : Observable<boolean | UrlTree> {

    return this.auth.ensureValidAccessToken$().pipe(
      take(1),
      map(token => {
        if (token) {
          return true;
        }
        return this.router.createUrlTree(
          ['/pages/login'],
          { queryParams: { returnUrl: state.url } }
        );
      }),
      catchError(() =>
        of(this.router.createUrlTree(
          ['/pages/login'],
          { queryParams: { returnUrl: state.url } }
        ))
      )
    );
  }
}
