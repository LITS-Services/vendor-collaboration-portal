import { HttpRequest } from '@angular/common/http';
import { attachVendorCsrfHeaders } from './vendor-client.headers';

const AUTH_EXCLUDED_PATHS = [
  '/Auth/VendorLogin',
  '/Auth/Vendor-Refresh',
  '/Auth/VerifyVendorOtp',
  '/Auth/ResendOtp',
  '/Auth/VendorUserRegister',
  '/Auth/VendorForgotPassword',
  '/Auth/VendorResetPassword',
  '/Auth/Vendorlogout',
  '/Auth/sso/login-url',
  '/Auth/sso/callback',
  '/Auth/google/login',
  '/Auth/facebook/login',
  '/Auth/captcha-config',
] as const;

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export function isAuthExcludedUrl(url: string): boolean {
  const u = (url || '').toLowerCase();
  return AUTH_EXCLUDED_PATHS.some(path => u.includes(path.toLowerCase()));
}

export function withAuthCredentials<T>(req: HttpRequest<T>): HttpRequest<T> {
  return req.clone({ withCredentials: true });
}

export function withCookieAuthRequest<T>(req: HttpRequest<T>, useCookies: boolean): HttpRequest<T> {
  if (!useCookies) return req;
  const credentialed = withAuthCredentials(req);
  if (!MUTATING_METHODS.has(req.method.toUpperCase()) || isAuthExcludedUrl(req.url)) {
    return credentialed;
  }
  return attachVendorCsrfHeaders(credentialed);
}

export function attachBearerToken<T>(req: HttpRequest<T>, token: string | null): HttpRequest<T> {
  const credentialed = withAuthCredentials(req);
  if (!token) return credentialed;
  return credentialed.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
}
