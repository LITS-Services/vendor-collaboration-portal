import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';

export interface Company {
  id: number;
  requisitionNo: string;
  status: string;
  date: string;
  owner: string;
  department: string;
  title: string;
  vendors: string;
  accounts: string;
  totalAmount: number;
}

@Injectable({
  providedIn: 'root'
})
export class CompanyService {

  private apiUrl = `${environment.apiUrl}/Company`; // dynamically use environment API URL

  constructor(private http: HttpClient) { }

  /** Register a new vendor company */
  registerCompany(payload: any): Observable<any> {
    console.log('Register payload:', payload);
    return this.http.post(`${this.apiUrl}/register-vendor-company`, payload);
  }


getCompanyByVendorId(vendorId: string, status?: string): Observable<any> {
  let params = new HttpParams();
  if (status) {
    params = params.set('status', status);
  }
  return this.http.get(`${this.apiUrl}/get-vendor-company/${vendorId}`);
}



  getCompanies(status?: string): Observable<Company[]> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<Company[]>(`${this.apiUrl}/get-all-vendor-companies`, { params });
  }





  getProcurementCompanies(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/get-all-procurement-companies`);
  }

  /** Fetch list of companies (optionally filtered by status) */


getCompanyById(id: number): Observable<Company> {
  return this.http.get<Company>(`${this.apiUrl}/${id}`);
}




updateCompany(id: number, payload: any) {
  return this.http.put(`${this.apiUrl}/update-vendor-company/${id}`, payload);
}




  // /** Delete company */
  // deleteCompany(id: number): Observable<any> {
  //   return this.http.delete(`${this.apiUrl}/${id}`);
  // }
}
