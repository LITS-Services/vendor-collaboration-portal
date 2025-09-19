import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from "@angular/fire/auth";
import firebase from 'firebase/app'
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';
import { tap } from 'rxjs/operators';

@Injectable()
export class AuthService {
  private user: Observable<firebase.User>;
  private userDetails: firebase.User = null;
  private baseUrl = environment.apiUrl;

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
  getProCompanies(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/Company/get-all-procurement-companies`);
  }

  // 🔹 Vendor Login API
  sgninUser(username: string, password: string): Observable<any> {
    const body = { username, password };
    return this.http.post(`${this.baseUrl}/Auth/VendorLogin`, body)
      .pipe(
        tap((response: any) => {
          // ✅ Save UserId
          if (response.UserId) {
            localStorage.setItem('UserId', response.UserId);
          }

          // ✅ Save token
          if (response.token) {
            localStorage.setItem('token', response.token);
          }

          // ✅ Save username
          if (response.username) {
            localStorage.setItem('username', response.username);
          }
        })
      );
  }


  resendOtp(username: string, portalType: string) {
    return this.http.post(`${this.baseUrl}/Auth/ResendOtp`, {
      username,
      portalType
    });
  }

  verifyOtp(otp: string) {
    return this.http.post(`${this.baseUrl}/Auth/VerifyVendorOtp`, { otp },
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
  //   isAuthenticated() {
  //   return true;
  // }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    // basic check: token exists
    if (!token) {
      return false;
    }

    // optional: check if token is expired (if it’s a JWT)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const isExpired = Date.now() >= payload.exp * 1000;
      return !isExpired;
    } catch (e) {
      return false;
    }
  }
}