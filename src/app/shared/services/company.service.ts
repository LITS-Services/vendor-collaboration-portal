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

  /** Fetch list of companies (optionally filtered by status) */
  getCompanies(status?: string): Observable<Company[]> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<Company[]>(`${this.apiUrl}/get-all-vendor-companies`, { params });
  }

  // /** Get single company details */
  // getCompanyById(id: number): Observable<Company> {
  //   return this.http.get<Company>(`${this.apiUrl}/${id}`);
  // }

  // /** Update company details */
  // updateCompany(id: number, payload: any): Observable<any> {
  //   return this.http.put(`${this.apiUrl}/${id}`, payload);
  // }

  // /** Delete company */
  // deleteCompany(id: number): Observable<any> {
  //   return this.http.delete(`${this.apiUrl}/${id}`);
  // }
}
