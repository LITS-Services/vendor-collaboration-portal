import { Router } from '@angular/router';
import { Injectable, Injector } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { Observable, of, Subject } from 'rxjs';
import { environment } from 'environments/environment';
import { HttpClient } from '@angular/common/http';
import { AuthUtils } from './auth.util';
import { catchError, finalize, map, tap } from 'rxjs/operators';
import { TokenStorageService } from './token-storage.service';
import { SessionIdleService } from './session-idle.service';
import { vendorWebLoginHeaders } from './vendor-client.headers';
import { withSkipToast } from '../interceptor/response-handler.interceptor';

const HTTP_CREDENTIALS = { withCredentials: true } as const;
const PERMISSIONS_KEY = 'permissions';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private user: Observable<firebase.User | null>;
  private userDetails: firebase.User | null = null;
  private _authState = new Subject<boolean>();
  private accessExpiresAt: string | null = null;
  private refreshExpiresAt: string | null = null;
  private sessionExpiryTimer: ReturnType<typeof setTimeout> | null = null;
  private loggingOut = false;

  constructor(
    public _firebaseAuth: AngularFireAuth,
    private router: Router,
    private http: HttpClient,
    private tokenStorage: TokenStorageService,
    private injector: Injector
  ) {
    this.user = _firebaseAuth.authState as unknown as Observable<firebase.User | null>;
    this.user.subscribe(user => this.userDetails = user || null);
    this.tokenStorage.clearLegacyStorage();
  }

  private get baseUrl(): string {
    return environment.apiUrl;
  }

  useCookieAuth(): boolean {
    return !!window.config?.authUseCookies;
  }

  get accessToken(): string | null {
    if (this.useCookieAuth()) return null;
    const token = this.tokenStorage.getAccessToken();
    if (!token) return null;
    return AuthUtils.isTokenExpired(token) ? null : token;
  }

  set accessToken(token: string | null) {
    if (token) {
      this.tokenStorage.setTokens(token, this.tokenStorage.getRefreshToken() || '');
    }
  }

  get refreshToken(): string | null {
    return this.tokenStorage.getRefreshToken();
  }

  set refreshToken(token: string | null) {
    if (token) {
      this.tokenStorage.setTokens(this.tokenStorage.getAccessToken() || '', token);
    }
  }

  getCaptchaConfig(): Observable<{ enabled: boolean; siteKey: string }> {
    return this.http
      .get<Record<string, unknown>>(`${this.baseUrl}/Auth/captcha-config`, {
        ...HTTP_CREDENTIALS,
        headers: vendorWebLoginHeaders(),
        context: withSkipToast(),
      })
      .pipe(
        map(cfg => ({
          enabled: !!(cfg && (cfg['enabled'] === true || cfg['Enabled'] === true)),
          siteKey: String(cfg?.['siteKey'] ?? cfg?.['SiteKey'] ?? '').trim(),
        })),
        catchError(() => of({ enabled: false, siteKey: '' })),
      );
  }

  isCaptchaEnabled(): Observable<boolean> {
    return this.getCaptchaConfig().pipe(map(cfg => cfg.enabled));
  }

  setSSOSession(data: any): void {
    const roles = data.roles
      ? (Array.isArray(data.roles) ? data.roles : data.roles.split(','))
      : [];

    this._setSessionFromLogin({
      token: data.token,
      refreshToken: data.refreshToken || '',
      userId: data.id || data.userId || '',
      userName: data.username || data.userName || '',
      email: data.email || '',
      roles,
      vendorCompanyIds: data.vendorCompanyIds || data.companyIds || [],
      permissions: data.permissions || [],
    });
  }

  forgetPassword(email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/Auth/VendorForgotPassword`, { email }, HTTP_CREDENTIALS);
  }

  ConfirmForgotOtp(payload: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/Auth/VendorResetPassword`, payload, HTTP_CREDENTIALS);
  }

  initiateSSOLogin(returnUrl: string = '/dashboard/dashboard1'): Observable<any> {
    return this.http.get(`${this.baseUrl}/Auth/sso/login-url?returnUrl=${encodeURIComponent(returnUrl)}`, HTTP_CREDENTIALS);
  }

  GoogleSSOLogin(returnUrl: string = '/dashboard/dashboard1'): Observable<any> {
    return this.http.get(`${this.baseUrl}/Auth/google/login?returnUrl=${encodeURIComponent(returnUrl)}`, HTTP_CREDENTIALS);
  }

  FacebookSSOLogin(returnUrl: string = '/dashboard/dashboard1'): Observable<any> {
    return this.http.get(`${this.baseUrl}/Auth/facebook/login?returnUrl=${encodeURIComponent(returnUrl)}`, HTTP_CREDENTIALS);
  }

  sgninUser(username: string, password: string, turnstileToken?: string | null): Observable<any> {
    return this.signinUser(username, password, turnstileToken);
  }

  signinUser(username: string, password: string, turnstileToken?: string | null): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/Auth/VendorLogin`,
      { username, password, turnstileToken: turnstileToken || null },
      { ...HTTP_CREDENTIALS, headers: vendorWebLoginHeaders() }
    ).pipe(
      tap((res) => {
        const auth = unwrapAuthPayload(res);
        if (auth && (authToken(auth) || this.useCookieAuth())) {
          this._setSessionFromLogin(auth);
        }
      })
    );
  }

  signinUserFirebase(email: string, password: string) {
    return this._firebaseAuth.signInWithEmailAndPassword(email, password);
  }

  resendOtp(username: string, portalType: string) {
    return this.http.post(`${this.baseUrl}/Auth/ResendOtp`, { username, portalType }, HTTP_CREDENTIALS);
  }

  verifyOtp(otp: string, email: string, resetOtp: boolean = false) {
    return this.http.post(
      `${this.baseUrl}/Auth/VerifyVendorOtp`,
      { otp: Number(otp), email, resetOtp },
      { responseType: 'text', ...HTTP_CREDENTIALS }
    );
  }

  registerUser(registerData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/Auth/VendorUserRegister`, registerData, {
      responseType: 'text',
      ...HTTP_CREDENTIALS
    });
  }

  registerCompany(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/register-company`, payload, HTTP_CREDENTIALS);
  }

  vendorLogout(): Observable<any> {
    const refreshToken = this.useCookieAuth() ? undefined : this.tokenStorage.getRefreshToken() ?? undefined;
    const body = refreshToken ? { refreshToken } : {};
    return this.http.post(`${this.baseUrl}/Auth/Vendorlogout`, body, HTTP_CREDENTIALS);
  }

  logout(): void {
    this.performLogout();
  }

  performLogout(reason?: 'session-expired' | 'idle'): void {
    if (this.loggingOut) return;
    this.loggingOut = true;
    this.vendorLogout().pipe(catchError(() => of(null))).subscribe({
      complete: () => this.finishLogout(reason),
      error: () => this.finishLogout(reason),
    });
    try { this._firebaseAuth.signOut(); } catch { /* ignore */ }
  }

  isAuthenticated(): boolean {
    if (this.useCookieAuth()) {
      return localStorage.getItem('isAuthenticated') === 'true' && !!localStorage.getItem('userId');
    }
    return !!this.accessToken;
  }

  hasPermission(permission: string): boolean {
    if (!permission) return true;
    if (this.hasRole('Super Admin') || this.hasRole('Admin')) return true;
    const permissions = this.getPermissions();
    // Backward compatible: older sessions without JWT permissions stay usable until re-login.
    if (!permissions.length) return this.isAuthenticated();
    return permissions.includes(permission);
  }

  getPermissions(): string[] {
    try {
      const stored = JSON.parse(localStorage.getItem(PERMISSIONS_KEY) || '[]');
      return Array.isArray(stored) ? stored : [];
    } catch {
      return [];
    }
  }

  getUserRoles(): string[] {
    try {
      const stored = JSON.parse(localStorage.getItem('roles') || '[]');
      return Array.isArray(stored) ? stored : [];
    } catch {
      return [];
    }
  }

  hasRole(role: string): boolean {
    return this.getUserRoles().some(r => r.toLowerCase() === role.toLowerCase());
  }

  getUserId(): string | null {
    return localStorage.getItem('userId');
  }

  restoreSession$(): Observable<boolean> {
    this.tokenStorage.clearLegacyStorage();
    if (this.useCookieAuth()) {
      this.tokenStorage.clear();
    } else {
      this.tokenStorage.restorePersistedRefreshToken();
      if (!this.tokenStorage.getRefreshToken()) {
        return of(false);
      }
    }

    return this.refreshAccessToken$().pipe(
      map(token => this.useCookieAuth() ? this.isAuthenticated() : !!token),
      catchError(() => of(false)),
    );
  }

  ensureValidAccessToken$(): Observable<string | null> {
    const bufferSeconds = window.config?.accessTokenRefreshBufferSeconds ?? 5;

    if (this.useCookieAuth()) {
      if (this.accessExpiresAt && !AuthUtils.isUtcExpiredOrNear(this.accessExpiresAt, bufferSeconds)) {
        return of(null);
      }
      return this.refreshAccessToken$();
    }

    const token = this.accessToken;
    if (token && !AuthUtils.isTokenExpired(token, bufferSeconds)) {
      return of(token);
    }

    if (!this.tokenStorage.getRefreshToken()) {
      return of(null);
    }

    return this.refreshAccessToken$();
  }

  refreshAccessToken$(): Observable<string | null> {
    if (!this.tokenStorage.tryBeginRefresh()) {
      return this.tokenStorage.waitForRefresh();
    }

    const refreshToken = this.tokenStorage.getRefreshToken();
    if (!this.useCookieAuth() && !refreshToken) {
      this.tokenStorage.completeRefresh(null);
      return of(null);
    }

    const body = this.useCookieAuth() ? {} : { refreshToken };

    return this.http
      .post<any>(`${this.baseUrl}/Auth/Vendor-Refresh`, body, {
        ...HTTP_CREDENTIALS,
        context: withSkipToast(),
      })
      .pipe(
        tap((resp) => this._applySessionFromRefresh(resp)),
        map((resp) => resp?.token ?? this.tokenStorage.getAccessToken()),
        catchError(() => of(null)),
        finalize(() => this.tokenStorage.completeRefresh(this.accessToken))
      );
  }

  private _setSessionFromLogin(res: any): void {
    this.tokenStorage.clearLegacyStorage();
    const token = authToken(res);
    const refresh = authRefreshToken(res);
    if (this.useCookieAuth()) {
      this.tokenStorage.clear();
    } else if (token || refresh) {
      this.tokenStorage.setTokens(token, refresh);
    }

    this.accessExpiresAt = res.expiresAt ?? res.ExpiresAt ?? null;
    this.refreshExpiresAt = res.refreshExpiresAt ?? res.RefreshExpiresAt ?? null;

    const userId = res.userId || res.UserId || res.id || '';
    if (userId) localStorage.setItem('userId', userId);

    const username = res.username ?? res.userName ?? res.UserName ?? res.email ?? '';
    if (username) localStorage.setItem('username', username);

    const email = res.email || res.Email || '';
    if (email) localStorage.setItem('userEmail', email);

    const roles = res.roles || res.Roles || [];
    localStorage.setItem('roles', JSON.stringify(Array.isArray(roles) ? roles : []));

    const companyIds = res.vendorCompanyIds ?? res.VendorCompanyIds ?? res.companyIds ?? [];
    const ids = Array.isArray(companyIds) ? companyIds : [];
    localStorage.setItem('companyIds', JSON.stringify(ids));
    if (ids[0]) localStorage.setItem('company', ids[0]);

    const permissions = res.permissions || res.Permissions || [];
    localStorage.setItem(PERMISSIONS_KEY, JSON.stringify(Array.isArray(permissions) ? permissions : []));

    localStorage.setItem('isAuthenticated', 'true');
    this.scheduleSessionExpiry(this.refreshExpiresAt);
    this.bumpIdleTimer();
    this._authState.next(this.isAuthenticated());
  }

  private _applySessionFromRefresh(res: any): void {
    if (!res) return;
    if (this.useCookieAuth()) {
      this.tokenStorage.clear();
    } else if (res.token || res.refreshToken) {
      this.tokenStorage.setTokens(
        res.token || this.tokenStorage.getAccessToken() || '',
        res.refreshToken || this.tokenStorage.getRefreshToken() || ''
      );
    }

    this.accessExpiresAt = res.expiresAt ?? res.ExpiresAt ?? this.accessExpiresAt;
    this.refreshExpiresAt = res.refreshExpiresAt ?? res.RefreshExpiresAt ?? this.refreshExpiresAt;

    if (res.userId) localStorage.setItem('userId', res.userId);
    const username = res.username ?? res.userName ?? res.user?.username ?? res.user?.email;
    if (username) localStorage.setItem('username', username);
    if (res.email) localStorage.setItem('userEmail', res.email);
    if (res.roles) localStorage.setItem('roles', JSON.stringify(res.roles));

    const companyIds = res.vendorCompanyIds ?? res.companyIds;
    if (companyIds) {
      const ids = Array.isArray(companyIds) ? companyIds : [];
      localStorage.setItem('companyIds', JSON.stringify(ids));
      if (ids[0]) localStorage.setItem('company', ids[0]);
    }

    if (res.permissions) {
      localStorage.setItem(PERMISSIONS_KEY, JSON.stringify(res.permissions));
    }

    if (res.userId || res.token || this.useCookieAuth()) {
      localStorage.setItem('isAuthenticated', 'true');
    }

    this.scheduleSessionExpiry(this.refreshExpiresAt);
    this.bumpIdleTimer();
    this._authState.next(this.isAuthenticated());
  }

  private scheduleSessionExpiry(isoUtc: string | null): void {
    if (this.sessionExpiryTimer !== null) {
      clearTimeout(this.sessionExpiryTimer);
      this.sessionExpiryTimer = null;
    }
    if (!isoUtc) return;
    const delay = Date.parse(isoUtc) - Date.now();
    if (Number.isNaN(delay) || delay <= 0) return;
    this.sessionExpiryTimer = setTimeout(() => {
      if (this.isAuthenticated()) this.performLogout('session-expired');
    }, delay);
  }

  private bumpIdleTimer(): void {
    try { this.injector.get(SessionIdleService).start(); } catch { /* optional */ }
  }

  private finishLogout(reason?: 'session-expired' | 'idle'): void {
    if (this.sessionExpiryTimer !== null) {
      clearTimeout(this.sessionExpiryTimer);
      this.sessionExpiryTimer = null;
    }
    try { this.injector.get(SessionIdleService).stop(); } catch { /* optional */ }
    this.tokenStorage.clear();
    this.accessExpiresAt = null;
    this.refreshExpiresAt = null;
    localStorage.clear();
    this.loggingOut = false;
    if (reason === 'session-expired') {
      sessionStorage.setItem('authFlash', 'Your session has expired. Please sign in again.');
    } else if (reason === 'idle') {
      sessionStorage.setItem('authFlash', 'You were signed out due to inactivity.');
    }
    this.router.navigate(['/pages/login']);
  }

  get authState(): Observable<boolean> {
    return this._authState.asObservable();
  }
}

function unwrapAuthPayload(res: any): any {
  if (!res || typeof res !== 'object') return res;
  const inner = res.value ?? res.Value;
  if (inner && typeof inner === 'object' && (authToken(inner) || authRefreshToken(inner) || inner.userId || inner.UserId)) {
    return inner;
  }
  return res;
}

function authToken(res: any): string {
  return (res?.token || res?.Token || '').toString();
}

function authRefreshToken(res: any): string {
  return (res?.refreshToken || res?.RefreshToken || '').toString();
}
