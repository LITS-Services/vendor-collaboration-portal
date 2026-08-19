import { AuthService } from './auth.service';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export function sessionInitializer(auth: AuthService) {
  return () => auth.restoreSession$().pipe(
    catchError(() => of(false))
  ).toPromise();
}
