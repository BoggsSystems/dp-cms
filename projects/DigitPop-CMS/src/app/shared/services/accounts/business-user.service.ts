import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { BusinessUser } from '../../interfaces/business-user.json';
import { environment } from 'projects/DigitPop-CMS/src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BusinessUserService {
  private endpoint = `${environment.apiUrl}/api/business-users`;

  public currentUser: Observable<BusinessUser>;
  private currentUserSubject: BehaviorSubject<BusinessUser>;

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<BusinessUser>(
      JSON.parse(localStorage.getItem('user'))
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): BusinessUser {
    return this.currentUserSubject.value;
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

  welcome(): Observable<any> {
    const userId = this.currentUserValue?._id;
    const url = `${environment.apiUrl}/api/business-users/${userId}/welcome`;

    return this.http.put<any>(url, { id: userId }).pipe(
      catchError((error) => {
        console.error(error);
        return of(null);
      })
    );
  }
}
