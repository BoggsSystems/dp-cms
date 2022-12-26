import {Inject, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';
import {XchaneUser} from '../models/xchane.user';
import {catchError, map} from 'rxjs/operators';
import {environment} from 'projects/DigitPop-CMS/src/environments/environment';
import {HTTP_XCHANE_AUTH} from '../../app.module';

const httpOptions = {
  headers: new HttpHeaders({'Content-Type': 'application/json'}),
};

@Injectable({providedIn: 'root'})
export class XchaneAuthenticationService {
  public currentUser: Observable<XchaneUser>;
  private currentUserSubject: BehaviorSubject<XchaneUser>;

  constructor(@Inject(HTTP_XCHANE_AUTH) private httpClient: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<XchaneUser>(JSON.parse(localStorage.getItem('XchaneCurrentUser')));
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): XchaneUser {
    return this.currentUserSubject.value;
  }

  storeUser(user: XchaneUser) {
    user.token = this.currentUserValue.token;
    localStorage.setItem('XchaneCurrentUser', JSON.stringify(user));
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
    //let body = JSON.stringify(xchaneUser);
    return this.httpClient.put('/api/xchaneuser/' + xchaneUser._id, xchaneUser);
  }

  approveXchaneUser(xchaneUser: any) {
    let body = JSON.stringify(xchaneUser);
    return this.httpClient.post('/api/xchaneuser/approve', body, httpOptions);
  }

  createXchaneUser(xchaneUser: XchaneUser) {
    let body = JSON.stringify(xchaneUser);
    //return this.httpClient.post('/api/xchaneuser/', body, httpOptions);

    return this.httpClient
      .post<any>(`${environment.apiUrl}/api/xchaneuser/`, body, httpOptions)
      .pipe(map((res) => {
        console.log('LOGIN RESULT : ' + JSON.stringify(res));
        if (res.token) {
          console.log('Successful login');
          res.user.token = res.token;
          console.log('Set token of user : ' + res.user.token);
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          localStorage.setItem('XchaneCurrentUser', JSON.stringify(res.user));
          console.log('Set current user in local storage');
          this.currentUserSubject.next(res.user);
        } else if (res.msg) {
          alert(res.msg);
        }
        console.log('Returning result user');
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
      },), catchError((err, caught) => {
        console.log(err.message)
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
        // login successful if there's a jwt token in the response
        console.log('LOGIN RESULT : ' + JSON.stringify(res));
        if (res.token) {
          console.log('Successful login');
          res.user.token = res.token;
          console.log('Set token of user : ' + res.user.token);
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          localStorage.setItem('XchaneCurrentUser', JSON.stringify(res.user));
          console.log('Set current user in local storage');
          this.currentUserSubject.next(res.user);
        } else {
          alert(res.msg);
        }


        console.log('Returning result user');
        return res.user;
      }));
  }

  getCurrentXchaneUser() {
    console.log('In getCurrentXchaneUser');

    return this.httpClient.get(`${environment.apiUrl}/api/xchaneuser/me`, httpOptions);
  }

  getXchaneUser(id: string) {
    console.log('In getCurrentXchaneUser');

    return this.httpClient.get(`${environment.apiUrl}/api/xchaneuser/` + id);
  }

  addPointsAfterSignUp = (campaignId: string, xchaneUserId: string, projectId: string) => {
    return this.httpClient
      .post<any>(`${environment.apiUrl}/api/engagement/addPoints`, {
        campaignId, xchaneUserId, projectId
      });
  }

  welcome() {
    return this.httpClient.put<any>(`${environment.apiUrl}/api/xchaneuser/` + this.currentUserValue._id + '/welcome', {id: this.currentUserValue._id});
  }
}
