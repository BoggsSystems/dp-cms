import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap, first } from 'rxjs/operators';
import { Router } from '@angular/router';

import { User } from '../models/user';
import { environment } from 'projects/DigitPop-CMS/src/environments/environment';
import { HTTP_CMS_AUTH } from '../../app.module';
import { DataService } from '../../xchane/services/data.service';

const httpOptions = {
  headers: new HttpHeaders({'Content-Type': 'application/json'}),
};

@Injectable({providedIn: 'root'})
export class AuthenticationService {
  public currentUser: Observable<User>;
  private currentUserSubject: BehaviorSubject<User>;

  constructor(
    @Inject(HTTP_CMS_AUTH) private http: HttpClient,
    private data: DataService,
    private router: Router
  ) {
    this.currentUserSubject = new BehaviorSubject<User>(
      JSON.parse(localStorage.getItem('currentuser'))
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User {
    return this.currentUserSubject.value;
  }

  createUser(user: User) {
    const name = user.name;
    const email = user.email;
    const password = user.password;
    const role = user.role;

    return this.http
      .post<any>(`${environment.apiUrl}/api/users/`, {
        name,
        email,
        password,
        role,
      })
      .pipe(
        map((res) => {
          if (res.user && res.token) {
            res.user.token = res.token;
            // store user details and jwt token in local storage to keep user logged in between page refreshes
            localStorage.setItem('currentuser', JSON.stringify(res.user));
            this.currentUserSubject.next(res.user);
          }
          return res;
        })
      );
  }

  getUsage(user: User, cycle: any) {
    return this.http.get<any>(
      `${environment.apiUrl}/api/users/` + user._id + '/' + cycle + '/usage'
    );
  }

  login(email: string, password: string) {
    return this.http
      .post<any>(`${environment.apiUrl}/auth/local`, { email, password })
      .pipe(
        switchMap((res) =>
          res.token && res.refreshToken
            ? this.handleLoginSuccess(res)
            : this.handleLoginFailure(res)
        ),
        catchError((err) => {
          console.log(err);
          return throwError(err);
        })
      );
  }

  private handleLoginSuccess(res: any): Observable<User> {
    this.storeTokens(res.token, res.refreshToken);
    const user = { ...res.user, token: res.token };
    localStorage.setItem('currentuser', JSON.stringify(user));
    this.currentUserSubject.next(user);
    return of(res.user);
  }

  private handleLoginFailure(res: any): Observable<never> {
    alert(res.message);
    return throwError('Login failed');
  }

  logout() {
    localStorage.removeItem('currentuser');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    this.currentUserSubject.next(null);
    this.router.navigate(['/home']);
  }

  refreshToken(): Observable<string> {
    return this.currentUserSubject.pipe(
      first(),
      switchMap((currentUser) => {
        const refreshToken = localStorage.getItem('refreshToken');

        if (!currentUser || !refreshToken) {
          return throwError('No user or refresh token available.');
        }

        return this.http.post<any>(`${environment.apiUrl}/auth/local/refresh`, { refreshToken }).pipe(
          catchError((err) => {
            console.log(err);
            return throwError(err);
          }),
          switchMap((res) => {
            if (res.token && res.refreshToken) {
              this.storeTokens(res.token, res.refreshToken);
              const updatedUser = { ...currentUser, token: res.token };
              localStorage.setItem('currentuser', JSON.stringify(updatedUser));
              this.currentUserSubject.next(updatedUser);
              return of(res.token);
            } else {
              return throwError('Failed to refresh token');
            }
          })
        );
      })
    );
  }

  private storeTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  projectWizardPopup() {
    return this.http.put<any>(
      `${environment.apiUrl}/api/users/` +
      this.currentUserValue._id +
      '/projectWizardPopup',
      {id: this.currentUserValue._id}
    );
  }

  storeUser(user: any) {
    localStorage.setItem('currentuser', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  updateUser(user: User) {
    return this.http.put<any>(
      `${environment.apiUrl}/api/users/` + user._id,
      {
        user,
      }
    );
  }

  welcome() {
    return this.http.put<any>(
      `${environment.apiUrl}/api/business-users/` +
      this.currentUserValue._id +
      '/welcome',
      {id: this.currentUserValue._id}
    );
  }
}
