import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { catchError, switchMap } from 'rxjs/operators';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

   constructor(private auth: AuthService) {}

  private isAuthUrl(url: string): boolean {
    return (
      url.includes('/Auth/VendorLogin') ||
      url.includes('/Auth/Vendor-Refresh') ||
      url.includes('/Auth/VendorUserRegister') ||
      url.includes('/Auth/VerifyVendorOtp') ||
      url.includes('/Auth/ResendOtp') ||
      url.includes('/Auth/sso/login-url') ||
      url.includes('/Auth/sso/callback')
      
    );
  }

    private attach(req: HttpRequest<any>, token: string | null): HttpRequest<any> {
    if (!token) return req;
    return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const skip = this.isAuthUrl(req.url);
        const source$ = skip ? of<string | null>(null) : this.auth.ensureValidAccessToken$();

        return source$.pipe(
          switchMap((maybeToken) => {
            const authReq = skip ? req : this.attach(req, maybeToken);

            return next.handle(authReq).pipe(
              catchError((err) => {
                const isRefreshCall = req.url.includes('/Auth/Vendor-Refresh');

                // If protected call got 401 → try ONE refresh-then-retry
                if (!skip && err instanceof HttpErrorResponse && err.status === 401) {
                  return this.auth.ensureValidAccessToken$().pipe(
                    switchMap((newToken) => {
                      if (!newToken) {
                        this.auth.performLogout();
                        return throwError(() => err);
                      }
                      return next.handle(this.attach(req, newToken));
                    }),
                    catchError((refreshErr) => {
                      this.auth.performLogout();
                      return throwError(() => refreshErr);
                    })
                  );
                }

                // If refresh itself returned 401 → hard logout (expired/invalid RT)
                if (isRefreshCall && err instanceof HttpErrorResponse && err.status === 401) {
                    const msg = (err?.error?.[0]?.ErrorMessage ?? err?.error?.message ?? '').toString().toLowerCase();
                    if (msg.includes('token expired')) {
                      sessionStorage.setItem('authFlash', 'Your session has expired. Please sign in again.');
                    }
                  this.auth.performLogout();
                }

                return throwError(err);
              })
            );
          })
        );
      }
}
