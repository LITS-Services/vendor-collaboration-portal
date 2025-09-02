import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from "@angular/fire/auth";
import firebase from 'firebase/app'
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';

@Injectable()
export class AuthService {
  private user: Observable<firebase.User>;
  private userDetails: firebase.User = null;
  private baseUrl = environment.apiUrl;

  constructor(public _firebaseAuth: AngularFireAuth, public router: Router,private http: HttpClient,) {
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

  }

   sgninUser(username: string, password: string): Observable<any> {
    const body = { username, password };
    return this.http.post(`${this.baseUrl}/Auth/VendorLogin`, body); 
  }

  signinUser(email: string, password: string) {
    //your code for checking credentials and getting tokens for for signing in user
    return this._firebaseAuth.signInWithEmailAndPassword(email, password)

  }

  registerUser(registerData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/Auth/VendorUserRegister`, registerData);
  }


  logout() {
    this._firebaseAuth.signOut();
    this.router.navigate(['YOUR_LOGOUT_URL']);
  }

  isAuthenticated() {
    return true;
  }
}
