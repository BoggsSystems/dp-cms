import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, first, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { BusinessUser } from '../../interfaces/business-user.json';
import { environment } from 'projects/DigitPop-CMS/src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BusinessUserService {
  private endpoint = `${environment.apiUrl}/api/business-users`;

  public currentUser: Observable<BusinessUser>;
  private currentUserSubject: BehaviorSubject<BusinessUser>;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.currentUserSubject = new BehaviorSubject<BusinessUser>(
      JSON.parse(localStorage.getItem('user'))
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): BusinessUser {
    return this.currentUserSubject.value;
  }

  private storeTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  private cleanStorage = () => {
    if (sessionStorage.getItem('currentRole')) {
      sessionStorage.removeItem('currentRole');
    }
    if (sessionStorage.getItem('user')) {
      sessionStorage.removeItem('user');
    }
    if (sessionStorage.getItem('accessToken')) {
      sessionStorage.removeItem('accessToken');
    }
    if (sessionStorage.getItem('refreshToken')) {
      sessionStorage.removeItem('refreshToken');
    }

    if (localStorage.getItem('currentRole')) {
      localStorage.removeItem('currentRole');
    }
    if (localStorage.getItem('user')) {
      localStorage.removeItem('user');
    }
    if (localStorage.getItem('accessToken')) {
      localStorage.removeItem('accessToken');
    }
    if (localStorage.getItem('refreshToken')) {
      localStorage.removeItem('refreshToken');
    }

    this.currentUserSubject.next(null);
  }

  createUser = (user: BusinessUser): Observable<any> =>
    this.http.post(this.endpoint, user).pipe(
      catchError((error) => {
        console.error(error);
        return [];
      })
    );

  storeUser = (user: any): void => {
    const updatedUser = user;
    localStorage.setItem('user', JSON.stringify(updatedUser));
    this.currentUserSubject = new BehaviorSubject<any>(updatedUser);
  };

  updateUser = (user?: BusinessUser): Observable<any> => {
    const targetUser = user || this.currentUserValue;

    if (!targetUser) {
      console.error('No target user found.');
      return of(null);
    }

    return this.http
      .put<any>(`${this.endpoint}/` + targetUser._id, {
        user: targetUser,
      })
      .pipe(
        catchError((error) => {
          console.error(error);
          return of(null);
        })
      );
  };

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
          console.error(err);
          return throwError(err);
        })
      );
  }

  private handleLoginSuccess(res: any): Observable<BusinessUser> {
    this.storeTokens(res.token, res.refreshToken);
    const user = { ...res.user, token: res.token };
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSubject.next(user);
    return of(res.user);
  }

  private handleLoginFailure(res: any): Observable<never> {
    alert(res.message);
    return throwError('Login failed');
  }

  welcome = (): Observable<any> => {
    const userId = this.currentUserValue?._id;
    const url = `${environment.apiUrl}/api/business-users/${userId}/welcome`;

    return this.http.put<any>(url, { id: userId }).pipe(
      catchError((error) => {
        console.error(error);
        return of(null);
      })
    );
  }

  projectTour = (): Observable<any> => {
    const userId = this.currentUserValue?._id;
    const url = `${environment.apiUrl}/api/business-users/${userId}/tour`;

    return this.http.put<any>(url, { id: userId }).pipe(
      catchError((error) => {
        console.error(error);
        return of(null);
      })
    );
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
              localStorage.setItem('user', JSON.stringify(updatedUser));
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

  getSubscription = (subscriptionId?: string) => {
    if (!subscriptionId) {
      subscriptionId = this.currentUserValue?.subscription;
    }
    return this.http.get<any>(
      `${environment.apiUrl}/api/subscription/${subscriptionId}`
    );
  }

  getUsage = (userId?: string, subscriptionId? : string) => {
    if (!userId) {
      userId = this.currentUserValue?._id;
    }

    if (!subscriptionId) {
      subscriptionId = this.currentUserValue?.subscription;
    }

    return this.http.post<any>(
      `${environment.apiUrl}/api/business-users/${userId}/usage`,
      {
        subscriptionId: subscriptionId
      }
    );
  };

  logout = () => {
    this.cleanStorage();
    this.router.navigate(['/home']);
  }
}
