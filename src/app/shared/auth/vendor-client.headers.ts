import { HttpHeaders, HttpRequest } from '@angular/common/http';

export const VENDOR_WEB_CLIENT_HEADER = 'X-Vendor-Client';
export const VENDOR_WEB_CLIENT_VALUE = 'web';
export const VENDOR_CSRF_HEADER = 'X-Requested-With';
export const VENDOR_CSRF_HEADER_VALUE = 'XMLHttpRequest';

export function vendorWebLoginHeaders(): HttpHeaders {
  return new HttpHeaders({ [VENDOR_WEB_CLIENT_HEADER]: VENDOR_WEB_CLIENT_VALUE });
}

export function attachVendorCsrfHeaders<T>(req: HttpRequest<T>): HttpRequest<T> {
  return req.clone({
    setHeaders: {
      [VENDOR_WEB_CLIENT_HEADER]: VENDOR_WEB_CLIENT_VALUE,
      [VENDOR_CSRF_HEADER]: VENDOR_CSRF_HEADER_VALUE,
    },
  });
}
