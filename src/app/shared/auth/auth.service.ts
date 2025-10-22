import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from "@angular/fire/auth";
import firebase from 'firebase/app'
import { Observable, of, ReplaySubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';
import { catchError, finalize, map, tap } from 'rxjs/operators';
import { AuthUtils } from './auth.util';

@Injectable()
export class AuthService {
  private user: Observable<firebase.User>;
  private userDetails: firebase.User = null;
  private baseUrl = environment.apiUrl;

  private _refreshInProgress = false;
  private _refreshSubject = new ReplaySubject<string | null>(1);
  
  constructor(public _firebaseAuth: AngularFireAuth, public router: Router, private http: HttpClient,) {
    this.user = _firebaseAuth.authState;
    this.user.subscribe(
      (user) => {
        if (user) {
          this.userDetails = user;
        }
        else {
          this.userDetails = null;
        }
      }
    );
    //Get all Entites 
  }

forgetPassword(email: string): Observable<any> {
  return this.http.post(`${environment.apiUrl}/Auth/VendorForgotPassword`, { email });
}

ConfirmForgotOtp(payload: any): Observable<any> {
  return this.http.post<any>(`${environment.apiUrl}/Auth/VendorResetPassword`, payload);
}




      get accessToken(): string | null {
    return localStorage.getItem('token');
  }
 set accessToken(token: string | null) {
  if (token) {
    console.log('[AUTH] Setting accessToken:', token.slice(0, 12) + '...');
    localStorage.setItem('token', token);
  } else {
    console.log('[AUTH] Clearing accessToken');
    localStorage.removeItem('token');
  }
}

  get refreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }
set refreshToken(token: string | null) {
  if (token) {
    console.log('[AUTH] Setting refreshToken:', token.slice(0, 12) + '...');
    localStorage.setItem('refreshToken', token);
  } else {
    console.log('[AUTH] Clearing refreshToken');
    localStorage.removeItem('refreshToken');
  }
}

  // getProCompanies(): Observable<any[]> {
  //   return this.http.get<any[]>(`${this.baseUrl}/Company/get-all-procurement-companies`);
  // }

// getSSOCallbackUrl() {
//   return this.http.get<any>('https://localhost:7188/api/Auth/sso/callback');
// }
  
// ssoCallback(code: string): Observable<any> {
//   return new Observable((observer) => {
//     this.http.get<any>(`${this.baseUrl}/Auth/sso/callback?code=${encodeURIComponent(code)}`)
//       .subscribe({
//         next: (res) => {
//           if (res && res.token) {
//             // Store JWT & user info
//             this._applySessionFromAny(res);
//           }
//           observer.next(res);
//           observer.complete();
//         },
//         error: (err) => observer.error(err)
//       });
//   });
// }

 initiateSSOLogin(returnUrl: string = '/dashboard/dashboard1'): Observable<any> {
    return this.http.get(`${this.baseUrl}/Auth/sso/login-url?returnUrl=${encodeURIComponent(returnUrl)}`);
  }
  


  // 🔹 Vendor Login API
  sgninUser(username: string, password: string): Observable<any> {
    const body = { username, password };
    return this.http.post(`${this.baseUrl}/Auth/VendorLogin`, body)
      .pipe(
        tap((response: any) => {
          this._applySessionFromAny(response);
        })
      );
  }


  resendOtp(username: string, portalType: string) {
    return this.http.post(`${this.baseUrl}/Auth/ResendOtp`, {
      username,
      portalType
    });
  }

  verifyOtp(otp: string, email: string) {
      const body = { otp: Number(otp), email };
    return this.http.post(`${this.baseUrl}/Auth/VerifyVendorOtp`,  body,
    { responseType: 'text' }
    );
  }

  signinUser(email: string, password: string) {
    //your code for checking credentials and getting tokens for for signing in user
    return this._firebaseAuth.signInWithEmailAndPassword(email, password)

  }

  registerUser(registerData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/Auth/VendorUserRegister`, registerData, {
      responseType: 'text'
    });
  }
  // registerCompany(payload: any): Observable<any> {
  //   return this.http.post(`${this.baseUrl}/register-company`, payload);
  // }
  registerCompany(payload: any): Observable<any> {
    console.log('userId', payload.userId);
    console.log('Sending payload to backend:', payload);
    return this.http.post(`${this.baseUrl}/register-company`, payload); // <-- use correct API endpoint
  }

  logout() {
    this._firebaseAuth.signOut();
    this.router.navigate(['YOUR_LOGOUT_URL']);
  }

    performLogout(): void {
    localStorage.clear();
    this.router.navigate(['/pages/login']);
  }
  //   isAuthenticated() {
  //   return true;
  // }

  // isAuthenticated(): boolean {
  //   const token = localStorage.getItem('token');
  //   // basic check: token exists
  //   if (!token) {
  //     return false;
  //   }

  //   // optional: check if token is expired (if it’s a JWT)
  //   try {
  //     const payload = JSON.parse(atob(token.split('.')[1]));
  //     const isExpired = Date.now() >= payload.exp * 1000;
  //     return !isExpired;
  //   } catch (e) {
  //     return false;
  //   }
  // }

    isAuthenticated(): boolean {
    const token = this.accessToken;
    return !!token && !AuthUtils.isTokenExpired(token);
  }

    ensureValidAccessToken$(): Observable<string | null> {
    const token = this.accessToken;

    // still valid for at least 5s?
    if (token && !AuthUtils.isTokenExpired(token, 5)) {
      return of(token);
    }

    if (!this.refreshToken) {
      return of(null);
    }

    // de-dupe concurrent refresh waves
    if (this._refreshInProgress) {
      return this._refreshSubject.asObservable();
    }

    this._refreshInProgress = true;

    return this.http
      .post<any>(`${this.baseUrl}/Auth/Vendor-Refresh`, { refreshToken: this.refreshToken })
      .pipe(
        tap((resp) => this._applySessionFromRefresh(resp)),
        map((resp) => resp?.token ?? null),
        tap((newToken) => this._refreshSubject.next(newToken)),
        catchError((err) => {
          console.error('[REFRESH] Refresh failed:', err);
          this._refreshSubject.next(null);
          return of(null);
        }),
        finalize(() => {
          this._refreshInProgress = false;
          this._refreshSubject.complete();
          this._refreshSubject = new ReplaySubject<string | null>(1);
        })
      );
  }

   private _applySessionFromAny(res: any): void {
    if (!res) return;
    if (res.token) this.accessToken = res.token;
    if (res.refreshToken) this.refreshToken = res.refreshToken;

    const user = res.user ?? {};
    const userId = res.userId ?? user.id ?? null;
    const username = res.username ?? user.username ?? user.email ?? null;
    const roles = res.roles ?? user.roles ?? [];

    if (userId) localStorage.setItem('userId', userId);
    if (username) localStorage.setItem('username', username);
    localStorage.setItem('roles', JSON.stringify(Array.isArray(roles) ? roles : []));

    const companyIds = res.companyIds?.$values ?? res.companyIds ?? null;
    if (companyIds) localStorage.setItem('companyIds', JSON.stringify(companyIds));
  }

  private _applySessionFromRefresh(res: any): void {
    if (!res) return;
    if (res.token) this.accessToken = res.token;
    if (res.refreshToken) this.refreshToken = res.refreshToken; 

    if (res.userId) localStorage.setItem('userId', res.userId);
    const username = res.username ?? res.user?.username ?? res.user?.email ?? null;
    if (username) localStorage.setItem('username', username);
    if (res.roles) localStorage.setItem('roles', JSON.stringify(res.roles));
    const companyIds = res.companyIds?.$values ?? res.companyIds ?? null;
    if (companyIds) localStorage.setItem('companyIds', JSON.stringify(companyIds));
  }

}