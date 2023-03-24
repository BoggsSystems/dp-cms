/**
 * Service to manage data related to user credit, video tour, notifications and login state.
 */

import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  /**
   * Subject for user credit updates.
   */
  private creditsSubject = new Subject<any>();

  /**
   * Subject for video tour updates.
   */
  private tourSubject = new Subject<any>();

  /**
   * Subject for login state updates.
   */
  private loginSubject = new Subject<any>();

  /**
   * BehaviorSubject for notification updates.
   */
  private notificationSubject = new BehaviorSubject<any>({
    displayNotification: true,
    message: 'Please, check your email for verification.'
  });

  constructor() {
  }

  public get getNotification(): any {
    return this.notificationSubject.value;
  }

  updateUserCredit(points: number) {
    this.creditsSubject.next({points});
  }

  getUserCredit(): Observable<any> {
    return this.creditsSubject.asObservable();
  }

  setVideoTour(enabled: boolean) {
    this.tourSubject.next({enabled});
  }

  setNotification(displayNotification: boolean, notificationMessage: string) {
    this.notificationSubject.next({displayNotification, notificationMessage});
  }

  setLogin(loggedIn: boolean = false): void {
    this.loginSubject.next({loggedIn});
  }

  getLogin(): Observable<any> {
    return this.loginSubject.asObservable();
  }
}
