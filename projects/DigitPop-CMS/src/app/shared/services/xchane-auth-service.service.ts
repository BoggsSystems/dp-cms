import {Inject, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';
import {XchaneUser} from '../models/xchane.user';
import {catchError, map} from 'rxjs/operators';
import {environment} from 'projects/DigitPop-CMS/src/environments/environment';
import {HTTP_XCHANE_AUTH} from '../../app.module';
import * as moment from 'moment';

const httpOptions = {
  headers: new HttpHeaders({'Content-Type': 'application/json'}),
};

@Injectable({providedIn: 'root'})
export class XchaneAuthenticationService {
  public currentUser: Observable<XchaneUser>;
  private currentUserSubject: BehaviorSubject<XchaneUser>;

  constructor(@Inject(HTTP_XCHANE_AUTH) private httpClient: HttpClient) {
    if (localStorage.getItem('XchaneCurrentUser')) {
      this.currentUserSubject = new BehaviorSubject<XchaneUser>(JSON.parse(localStorage.getItem('XchaneCurrentUser')));
    } else if (sessionStorage.getItem('XchaneCurrentUser')) {
      this.currentUserSubject = new BehaviorSubject<XchaneUser>(JSON.parse(sessionStorage.getItem('XchaneCurrentUser')));
    }
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): XchaneUser {
    return this.currentUserSubject.value;
  }

  storeUser(user: XchaneUser) {
    user.token = this.currentUserValue.token;
    this.currentUserSubject.next(user);
  }

  getAllXchaneUsers() {
    return this.httpClient.get('/api/xchaneuser/');
  }

  toggleXchaneUserCategory(category: any, xchaneUser: any) {
    return this.httpClient.put(`${environment.apiUrl}/api/xchaneuser/` + xchaneUser._id + '/togglecategory', category);
  }


  removeXchaneUserCategory(category: any, xchaneUser: any) {
    return this.httpClient.put('/api/xchaneuser/' + xchaneUser._id + '/removecategory', category);
  }

  updateXchaneUser(xchaneUser: any) {
    return this.httpClient.put('/api/xchaneuser/' + xchaneUser._id, xchaneUser);
  }

  approveXchaneUser(xchaneUser: any) {
    const body = JSON.stringify(xchaneUser);
    return this.httpClient.post('/api/xchaneuser/approve', body, httpOptions);
  }

  createXchaneUser(xchaneUser: XchaneUser) {
    const body = JSON.stringify(xchaneUser);

    return this.httpClient
      .post<any>(`${environment.apiUrl}/api/xchaneuser/`, body, httpOptions)
      .pipe(map((res) => {
        if (res.token) {
          res.user.token = res.token;
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          localStorage.setItem('XchaneCurrentUser', JSON.stringify(res.user));
          this.currentUserSubject.next(res.user);
        }

        return res;

        // login successful if there's a jwt token in the response
        // if (res) {
        //   console.log('Successful login');
        //   // res.user.token = res.token;
        //   // store user details and jwt token in local storage to keep user logged in between page refreshes
        //   localStorage.setItem('currentUser', JSON.stringify(res));
        //   this.currentUserSubject.next(res);
        // }

        // return res;
      }), catchError((err) => {
        alert(err.msg);
        return err;
      }));
  }

  loginXchaneUser(email: string, password: string) {
    return this.httpClient
      .post<any>(`${environment.apiUrl}/api/xchaneuser/login`, {
        email, password
      })
      .pipe(map((res) => {
        if (res.token) {
          res.user.token = res.token;
          this.setSession(res.token, res.expiresIn);
          this.currentUserSubject.next(res.user);
        } else {
          alert(res.msg);
        }
        return res.user;
      }));
  }

  getCurrentXchaneUser() {
    return this.httpClient.get(`${environment.apiUrl}/api/xchaneuser/me`, httpOptions);
  }

  getXchaneUser(id: string) {
    return this.httpClient.get(`${environment.apiUrl}/api/xchaneuser/` + id);
  }

  addPointsAfterSignUp = (campaignId: string, xchaneUserId: string, projectId: string) => {
    return this.httpClient
      .post<any>(`${environment.apiUrl}/api/engagement/addPoints`, {
        campaignId, xchaneUserId, projectId
      });
  }

  welcome() {
    return this.httpClient
      .put<any>(`${environment.apiUrl}/api/xchaneuser/` + this.currentUserValue._id + '/welcome', {id: this.currentUserValue._id});
  }

  tour = () => {
    return this.httpClient
      .put<any>(`${environment.apiUrl}/api/xchaneuser/tour`, {id: this.currentUserValue._id});
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('expires_at');
  }

  public isLoggedIn() {
    return moment().isBefore(this.getExpiration());
  }

  isLoggedOut() {
    return !this.isLoggedIn();
  }

  getExpiration() {
    const expiration = localStorage.getItem('expires_at');
    const expiresAt = JSON.parse(expiration);
    return moment(expiresAt);
  }

  private setSession(token: string, expiresIn: string) {
    const expiresAt = moment().add(expiresIn, 'second');

    localStorage.setItem('token', token);
    localStorage.setItem('expires_at', JSON.stringify(expiresAt.valueOf()));
  }

}
